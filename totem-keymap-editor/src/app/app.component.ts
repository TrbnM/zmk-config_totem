import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { KeyboardVisualizerComponent } from './components/keyboard-visualizer.component';
import { KeymapService } from './core/services/keymap.service';

import { LocaleMappingService } from './core/services/locale-mapping.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatButtonModule,
    KeyboardVisualizerComponent
  ],
  template: `
    <mat-toolbar color="primary" class="header">
      <span>Totem Keymap Editor</span>
      <span class="spacer"></span>
      <button mat-flat-button color="accent" (click)="exportKeymap()">Export Keymap</button>
    </mat-toolbar>

    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav mode="side" opened class="sidenav">
        <h3 class="section-title">Layers</h3>
        <mat-nav-list *ngIf="keymap() as map">
          <a mat-list-item *ngFor="let layer of map.layers; let i = index" 
             [class.active]="currentLayer() === i && selectedCombo() === null"
             (click)="setLayer(i)">
            {{ layer.name }}
          </a>
        </mat-nav-list>

        <h3 class="section-title">Combos</h3>
        <mat-nav-list *ngIf="keymap() as map">
          <a mat-list-item *ngFor="let combo of map.combos; let i = index" 
             [class.active]="selectedCombo() === i"
             (click)="setCombo(i)">
            {{ combo.name }} ({{ localeService.toGermanDisplay(combo.binding) }})
          </a>
        </mat-nav-list>
        
        <div style="padding: 16px;">
          <button mat-stroked-button style="width: 100%; border-color: rgba(255,255,255,0.2); color: white;" (click)="addCombo()">+ Add Combo</button>
        </div>
      </mat-sidenav>

      <mat-sidenav-content class="main-content">
        <app-keyboard-visualizer></app-keyboard-visualizer>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background-color: #0f172a; /* Premium dark background */
      color: #f8fafc;
    }
    
    .header {
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      z-index: 10;
    }
    
    .spacer {
      flex: 1 1 auto;
    }

    .sidenav-container {
      flex: 1;
      background: transparent;
    }

    .sidenav {
      width: 250px;
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(12px);
      border-right: 1px solid rgba(255, 255, 255, 0.1);
      color: white;
    }

    .section-title {
      padding: 16px;
      margin: 0;
      color: #94a3b8;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .active {
      background: rgba(56, 189, 248, 0.2) !important;
      border-left: 4px solid #38bdf8;
    }
    
    ::ng-deep .mat-mdc-list-item-title {
      color: white !important;
    }

    .main-content {
      padding: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at center, #1e293b 0%, #0f172a 100%);
    }
  `]
})
export class AppComponent {
  private keymapService = inject(KeymapService);
  public localeService = inject(LocaleMappingService);
  
  keymap = this.keymapService.keymap;
  currentLayer = this.keymapService.currentLayerIndex;
  selectedCombo = this.keymapService.selectedComboIndex;

  setLayer(index: number) {
    this.keymapService.setCurrentLayer(index);
  }

  setCombo(index: number) {
    // Toggle combo mode on/off
    if (this.keymapService.selectedComboIndex() === index) {
      this.keymapService.selectedComboIndex.set(null);
    } else {
      this.keymapService.selectedComboIndex.set(index);
    }
  }

  addCombo() {
    const name = prompt('Enter a name for the new combo (e.g. combo_del):');
    if (name) {
      this.keymapService.addCombo({
        name,
        timeout: 50,
        keyPositions: [],
        binding: '&kp '
      });
      const newIndex = this.keymap()!.combos.length - 1;
      this.setCombo(newIndex);
    }
  }

  exportKeymap() {
    const map = this.keymap();
    if (!map) return;

    let output = `//
//                                                        ▀▀▀▀▀     ▀▀▀▀▀          ▀▀█▀▀
//                                                        ▄▀▀▀▄  ▄  ▄▀▀▀▄  ▄  ▄▀▀▀▄  █  ▄▀▀▀▄
//                                                        █   █  █  █   █  █  █   █  █  █   █
//                                                         ▀▀▀   █   ▀▀▀   █   ▀▀▀   ▀   ▀▀▀
//                                                               █      ▄▄▄█▄▄▄    █   █  
//                                                               ▀      █  █  █     █▄█
//                                                             ▀▀▀▀▀    █  █  █      ▀
//                                                                      ▀  ▀  ▀
//
// ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄

#include <behaviors.dtsi>
#include <dt-bindings/zmk/bt.h>
#include <dt-bindings/zmk/ext_power.h>
#include <dt-bindings/zmk/keys.h>

#define Base        0
#define Nav         1
#define Sym         2
#define Fun         3
#define Button      4
#define Game        5
#define Gameplus    6

/* German keys mapping for ZMK on German OS */
`;

    // Add macros
    for (const [key, value] of Object.entries(map.macros)) {
      output += `#define ${key}  ${value}\n`;
    }

    output += `
&mt {
    quick-tap-ms = <100>;
    global-quick-tap;
    flavor = "tap-preferred";
    tapping-term-ms = <170>;
};

&lt {
    tapping-term-ms = <240>;
    flavor = "balanced";
    quick-tap-ms = <150>;
};

/ {
    behaviors {
        hm: homerow_mods {
            compatible = "zmk,behavior-hold-tap";
            label = "HOMEROW_MODS";
            #binding-cells = <2>;
            flavor = "tap-preferred";
            tapping-term-ms = <200>;
            quick-tap-ms = <125>;
            global-quick-tap;
            bindings =
                <&kp>,
                <&kp>;
        };
    };
`;

    let combosOutput = `    combos {\n        compatible = "zmk,combos";\n        \n`;
    for (const combo of map.combos) {
      combosOutput += `        ${combo.name} {\n`;
      combosOutput += `            timeout-ms = <${combo.timeout}>;\n`;
      combosOutput += `            key-positions = <${combo.keyPositions.join(' ')}>;\n`;
      combosOutput += `            bindings = <${combo.binding}>;\n`;
      combosOutput += `        };\n        \n`;
    }
    combosOutput += `    };\n\n`;

    output += combosOutput;

    output += `    keymap {
        compatible = "zmk,keymap";

`;

    // Add layers
    for (const layer of map.layers) {
      output += `        ${layer.name} {\n`;
      output += `            label = "${layer.name.replace('_layer', '')}";\n`;
      output += `            bindings = <\n`;
      
      const b = layer.bindings;
      // Format to Totem layout
      // Row 1
      output += `                   ${b[0] || '&trans'}       ${b[1] || '&trans'}          ${b[2] || '&trans'}         ${b[3] || '&trans'}      ${b[4] || '&trans'}    ${b[5] || '&trans'}        ${b[6] || '&trans'}        ${b[7] || '&trans'}       ${b[8] || '&trans'}               ${b[9] || '&trans'}\n`;
      // Row 2
      output += `              ${b[10] || '&trans'}  ${b[11] || '&trans'}    ${b[12] || '&trans'}  ${b[13] || '&trans'}      ${b[14] || '&trans'}    ${b[15] || '&trans'}  ${b[16] || '&trans'}  ${b[17] || '&trans'}  ${b[18] || '&trans'}  ${b[19] || '&trans'}\n`;
      // Row 3
      output += `${b[20] || '&trans'}     ${b[21] || '&trans'}       ${b[22] || '&trans'}          ${b[23] || '&trans'}         ${b[24] || '&trans'}      ${b[25] || '&trans'}    ${b[26] || '&trans'}        ${b[27] || '&trans'}    ${b[28] || '&trans'}     ${b[29] || '&trans'}           ${b[30] || '&trans'}  ${b[31] || '&trans'}\n`;
      // Thumbs
      output += `                                      ${b[32] || '&trans'}     ${b[33] || '&trans'}  ${b[34] || '&trans'}  ${b[35] || '&trans'}   ${b[36] || '&trans'}    ${b[37] || '&trans'}\n`;
      
      output += `            >;\n`;
      output += `        };\n\n`;
    }

    output += `    };\n};\n`;

    const blob = new Blob([output], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'totem.keymap';
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
