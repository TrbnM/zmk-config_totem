import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { KeymapService } from '../core/services/keymap.service';
import { LocaleMappingService } from '../core/services/locale-mapping.service';
import { KeyEditorDialogComponent } from './key-editor-dialog.component';

@Component({
  selector: 'app-keyboard-visualizer',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  template: `
    <div class="keyboard-container" *ngIf="keymap() as map">
      <div class="half left-half">
        <ng-container *ngTemplateOutlet="keyTpl; context: {$implicit: 0}"></ng-container>
        <ng-container *ngTemplateOutlet="keyTpl; context: {$implicit: 1}"></ng-container>
        <ng-container *ngTemplateOutlet="keyTpl; context: {$implicit: 2}"></ng-container>
        <ng-container *ngTemplateOutlet="keyTpl; context: {$implicit: 3}"></ng-container>
        <ng-container *ngTemplateOutlet="keyTpl; context: {$implicit: 4}"></ng-container>

        <ng-container *ngTemplateOutlet="keyTpl; context: {$implicit: 10}"></ng-container>
        <ng-container *ngTemplateOutlet="keyTpl; context: {$implicit: 11}"></ng-container>
        <ng-container *ngTemplateOutlet="keyTpl; context: {$implicit: 12}"></ng-container>
        <ng-container *ngTemplateOutlet="keyTpl; context: {$implicit: 13}"></ng-container>
        <ng-container *ngTemplateOutlet="keyTpl; context: {$implicit: 14}"></ng-container>

        <ng-container *ngTemplateOutlet="keyTpl; context: {$implicit: 20}"></ng-container>
        <ng-container *ngTemplateOutlet="keyTpl; context: {$implicit: 21}"></ng-container>
        <ng-container *ngTemplateOutlet="keyTpl; context: {$implicit: 22}"></ng-container>
        <ng-container *ngTemplateOutlet="keyTpl; context: {$implicit: 23}"></ng-container>
        <ng-container *ngTemplateOutlet="keyTpl; context: {$implicit: 24}"></ng-container>
        <ng-container *ngTemplateOutlet="keyTpl; context: {$implicit: 25}"></ng-container>

        <div class="thumbs left-thumbs">
          <ng-container *ngTemplateOutlet="keyTpl; context: {$implicit: 32}"></ng-container>
          <ng-container *ngTemplateOutlet="keyTpl; context: {$implicit: 33}"></ng-container>
          <ng-container *ngTemplateOutlet="keyTpl; context: {$implicit: 34}"></ng-container>
        </div>
      </div>

      <div class="half right-half">
        <ng-container *ngTemplateOutlet="keyTpl; context: {$implicit: 5}"></ng-container>
        <ng-container *ngTemplateOutlet="keyTpl; context: {$implicit: 6}"></ng-container>
        <ng-container *ngTemplateOutlet="keyTpl; context: {$implicit: 7}"></ng-container>
        <ng-container *ngTemplateOutlet="keyTpl; context: {$implicit: 8}"></ng-container>
        <ng-container *ngTemplateOutlet="keyTpl; context: {$implicit: 9}"></ng-container>

        <ng-container *ngTemplateOutlet="keyTpl; context: {$implicit: 15}"></ng-container>
        <ng-container *ngTemplateOutlet="keyTpl; context: {$implicit: 16}"></ng-container>
        <ng-container *ngTemplateOutlet="keyTpl; context: {$implicit: 17}"></ng-container>
        <ng-container *ngTemplateOutlet="keyTpl; context: {$implicit: 18}"></ng-container>
        <ng-container *ngTemplateOutlet="keyTpl; context: {$implicit: 19}"></ng-container>

        <ng-container *ngTemplateOutlet="keyTpl; context: {$implicit: 26}"></ng-container>
        <ng-container *ngTemplateOutlet="keyTpl; context: {$implicit: 27}"></ng-container>
        <ng-container *ngTemplateOutlet="keyTpl; context: {$implicit: 28}"></ng-container>
        <ng-container *ngTemplateOutlet="keyTpl; context: {$implicit: 29}"></ng-container>
        <ng-container *ngTemplateOutlet="keyTpl; context: {$implicit: 30}"></ng-container>
        <ng-container *ngTemplateOutlet="keyTpl; context: {$implicit: 31}"></ng-container>

        <div class="thumbs right-thumbs">
          <ng-container *ngTemplateOutlet="keyTpl; context: {$implicit: 35}"></ng-container>
          <ng-container *ngTemplateOutlet="keyTpl; context: {$implicit: 36}"></ng-container>
          <ng-container *ngTemplateOutlet="keyTpl; context: {$implicit: 37}"></ng-container>
        </div>
      </div>
    </div>

    <ng-template #keyTpl let-i>
      <div class="key" [attr.data-index]="i" [class.combo-key]="isComboKey(i)" (click)="editKey(i)">
        <span class="binding">{{ getBinding(i) }}</span>
      </div>
    </ng-template>
  `,
  styles: [`
    .keyboard-container {
      display: flex;
      gap: 4rem;
      justify-content: center;
      padding: 2rem;
      perspective: 1000px;
    }
    
    .half {
      display: grid;
      grid-template-columns: repeat(5, 54px);
      grid-template-rows: repeat(3, 54px);
      gap: 8px;
      position: relative;
    }
    
    .left-half {
      /* Left pinky outer column */
      padding-left: 62px; 
    }
    .right-half {
      padding-right: 62px;
    }
    
    /* Position outer pinkies */
    .key[data-index="20"] { position: absolute; left: 0; top: 124px; }
    .key[data-index="31"] { position: absolute; right: 0; top: 124px; }
    
    .thumbs {
      position: absolute;
      bottom: -62px;
      display: flex;
      gap: 8px;
    }
    
    .left-thumbs { right: -20px; }
    .right-thumbs { left: -20px; }
    
    .key {
      width: 54px;
      height: 54px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-family: 'Inter', sans-serif;
      font-size: 0.75rem;
      cursor: pointer;
      transition: all 0.2s ease;
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    .key:hover {
      background: rgba(255, 255, 255, 0.15);
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(0,0,0,0.2);
      border-color: rgba(255,255,255,0.3);
    }
    
    .combo-key {
      background: rgba(56, 189, 248, 0.4);
      border-color: #38bdf8;
      box-shadow: 0 0 10px rgba(56, 189, 248, 0.5);
    }
    
    .binding {
      text-align: center;
      word-break: break-all;
      padding: 2px;
    }
  `]
})
export class KeyboardVisualizerComponent {
  private keymapService = inject(KeymapService);
  private localeService = inject(LocaleMappingService);
  
  keymap = this.keymapService.keymap;
  currentLayer = this.keymapService.currentLayerIndex;
  selectedCombo = this.keymapService.selectedComboIndex;

  private dialog = inject(MatDialog);

  getBinding(index: number): string {
    const map = this.keymap();
    if (!map) return '';
    
    const comboIndex = this.selectedCombo();
    if (comboIndex !== null && map.combos[comboIndex]) {
      // If we are in combo mode, show combo binding on the keys that are part of it?
      // Or just show standard layer base keys so they know what they are clicking?
      // Let's show the base layer keys, but highlight them.
      const layer = map.layers[0]; // Base layer
      let binding = layer.bindings[index] || '';
      binding = this.localeService.toGermanDisplay(binding);
      return binding.replace('&kp ', '').replace('&hm ', '').replace('&lt ', '').replace('&mt ', '');
    }

    const layer = map.layers[this.currentLayer()];
    if (!layer || !layer.bindings) return '';
    
    let binding = layer.bindings[index] || '';
    binding = this.localeService.toGermanDisplay(binding);
    return binding.replace('&kp ', '').replace('&hm ', '').replace('&lt ', '').replace('&mt ', '');
  }

  isComboKey(index: number): boolean {
    const comboIndex = this.selectedCombo();
    if (comboIndex === null) return false;
    const map = this.keymap();
    if (!map || !map.combos[comboIndex]) return false;
    
    return map.combos[comboIndex].keyPositions.includes(index);
  }

  editKey(index: number) {
    const comboIndex = this.selectedCombo();
    const map = this.keymap();
    if (!map) return;
    
    if (comboIndex !== null) {
      // Toggle key in combo
      const combo = map.combos[comboIndex];
      const positions = [...combo.keyPositions];
      const idx = positions.indexOf(index);
      if (idx > -1) {
        positions.splice(idx, 1);
      } else {
        positions.push(index);
        positions.sort((a,b) => a - b);
      }
      this.keymapService.updateCombo(comboIndex, { ...combo, keyPositions: positions });
      return;
    }

    // Normal edit mode
    const layer = map.layers[this.currentLayer()];
    const currentBinding = layer.bindings[index] || '';
    
    const dialogRef = this.dialog.open(KeyEditorDialogComponent, {
      width: '400px',
      data: { keyIndex: index, currentBinding }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.keymapService.updateBinding(this.currentLayer(), index, result);
      }
    });
  }
}
