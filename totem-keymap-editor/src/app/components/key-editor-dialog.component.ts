import { Component, Inject, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { LocaleMappingService } from '../core/services/locale-mapping.service';

export interface KeyEditorData {
  keyIndex: number;
  currentBinding: string;
}

@Component({
  selector: 'app-key-editor-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    MatDialogModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule, 
    MatIconModule,
    FormsModule,
    MatSelectModule
  ],
  template: `
    <h2 mat-dialog-title>Edit Key {{ data.keyIndex }}</h2>
    
    <mat-dialog-content>
      <div class="form-container">
        
        <div class="input-row" *ngIf="!isCapturing">
          <mat-form-field appearance="fill" class="full-width">
            <mat-label>ZMK Binding</mat-label>
            <input matInput [(ngModel)]="displayBinding" cdkFocusInitial>
          </mat-form-field>
          <button mat-flat-button color="accent" class="capture-btn" (click)="startCapture()">
            Capture Key
          </button>
        </div>

        <div class="capture-overlay" *ngIf="isCapturing">
          <p class="pulse-text">Press any key on your keyboard...</p>
          <button mat-button (click)="isCapturing = false">Cancel</button>
        </div>
        
        <div class="hint" *ngIf="!isCapturing">
          <p>Common behaviors:</p>
          <ul>
            <li><code>&amp;kp KEY</code> - Key press</li>
            <li><code>&amp;mo LAYER</code> - Momentary layer</li>
            <li><code>&amp;lt LAYER KEY</code> - Layer-tap</li>
            <li><code>&amp;mt MOD KEY</code> - Mod-tap</li>
          </ul>
        </div>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end" *ngIf="!isCapturing">
      <button mat-button (click)="onNoClick()">Cancel</button>
      <button mat-flat-button color="primary" (click)="onSave()">Save</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 320px;
      margin-top: 8px;
    }
    
    .input-row {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .capture-btn {
      height: 56px;
      margin-bottom: 22px; /* align with input field ignoring hint */
    }

    .capture-overlay {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100px;
      background: rgba(56, 189, 248, 0.1);
      border: 2px dashed #38bdf8;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .pulse-text {
      color: #38bdf8;
      font-weight: bold;
      animation: pulse 1.5s infinite;
      margin-bottom: 12px;
    }

    @keyframes pulse {
      0% { opacity: 0.5; }
      50% { opacity: 1; }
      100% { opacity: 0.5; }
    }
    
    .full-width {
      flex: 1;
    }
    
    .hint {
      font-size: 0.85rem;
      color: #94a3b8;
      background: rgba(255,255,255,0.05);
      padding: 12px;
      border-radius: 4px;
    }
    
    .hint p { margin-top: 0; margin-bottom: 8px; }
    .hint ul { margin: 0; padding-left: 20px; margin-bottom: 8px; }
    .hint code { color: #38bdf8; background: rgba(0,0,0,0.2); padding: 2px 4px; border-radius: 2px; }
  `]
})
export class KeyEditorDialogComponent {
  displayBinding: string;
  isCapturing = false;
  private localeService = inject(LocaleMappingService);

  constructor(
    public dialogRef: MatDialogRef<KeyEditorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: KeyEditorData
  ) {
    // Show raw ZMK by default if they want to see the keycode!
    // But we still allow translation if they want it via the locale service later.
    // The user asked to "insert the KeyCode instead of just the letter/sign"
    // Let's just show the raw ZMK here, so they know exactly what's being saved.
    this.displayBinding = data.currentBinding;
  }

  startCapture() {
    this.isCapturing = true;
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (!this.isCapturing) return;
    
    event.preventDefault();
    event.stopPropagation();

    const key = event.key;
    
    // Ignore pure modifier presses
    if (['Shift', 'Control', 'Alt', 'Meta', 'AltGraph'].includes(key)) {
      return;
    }

    // Convert the pressed key into the ZMK code using our German layout map
    // E.g. '-' -> 'DE_MINS', 'ä' -> 'DE_A_UML', 'z' -> '&kp Y'
    const zmkCode = this.localeService.toZmkBinding(key);
    
    // Preserve any existing prefixes like `&mt LSHIFT` or `&lt Nav`
    let baseCode = zmkCode;
    if (zmkCode.startsWith('&kp ')) {
      baseCode = zmkCode.substring(4); // remove '&kp ' to get the raw key
    }

    if (this.displayBinding) {
      const parts = this.displayBinding.trim().split(' ');
      
      // If it's a simple &kp, we just replace the whole thing with zmkCode
      if (parts.length === 2 && parts[0] === '&kp') {
        this.displayBinding = zmkCode;
      } 
      // If it has multiple parts (like &mt LSHIFT A), replace the last part
      else if (parts.length > 1) {
        parts[parts.length - 1] = baseCode;
        this.displayBinding = parts.join(' ');
      }
      // If it's empty or something else, just use the zmkCode
      else {
        this.displayBinding = zmkCode;
      }
    } else {
      this.displayBinding = zmkCode;
    }
    
    this.isCapturing = false;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    // If they manually typed something in, and it's just a letter like "A", 
    // toZmkBinding will convert it. If it's already a full code like "&kp A", it returns it as is.
    const rawZmk = this.localeService.toZmkBinding(this.displayBinding);
    this.dialogRef.close(rawZmk);
  }
}
