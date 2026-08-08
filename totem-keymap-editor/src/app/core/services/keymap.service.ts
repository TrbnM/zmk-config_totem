import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { KeymapData, Layer } from '../models/keymap.model';

@Injectable({
  providedIn: 'root'
})
export class KeymapService {
  private keymapData = signal<KeymapData | null>(null);
  public readonly keymap = this.keymapData.asReadonly();
  
  public currentLayerIndex = signal<number>(0);
  public selectedComboIndex = signal<number | null>(null);

  constructor(private http: HttpClient) {
    this.loadKeymap();
  }

  private loadKeymap() {
    this.http.get<KeymapData>('keymap.json').subscribe(data => {
      this.keymapData.set(data);
    });
  }

  public updateBinding(layerIndex: number, keyIndex: number, newBinding: string) {
    this.keymapData.update(data => {
      if (!data) return data;
      const newData = { ...data, layers: [...data.layers] };
      const newLayer = { ...newData.layers[layerIndex], bindings: [...newData.layers[layerIndex].bindings] };
      newLayer.bindings[keyIndex] = newBinding;
      newData.layers[layerIndex] = newLayer;
      return newData;
    });
  }

  public updateCombo(index: number, newCombo: any) {
    this.keymapData.update(data => {
      if (!data) return data;
      const newData = { ...data, combos: [...data.combos] };
      newData.combos[index] = newCombo;
      return newData;
    });
  }

  public addCombo(combo: any) {
    this.keymapData.update(data => {
      if (!data) return data;
      return { ...data, combos: [...data.combos, combo] };
    });
  }

  public removeCombo(index: number) {
    this.keymapData.update(data => {
      if (!data) return data;
      const newCombos = [...data.combos];
      newCombos.splice(index, 1);
      return { ...data, combos: newCombos };
    });
  }

  public setCurrentLayer(index: number) {
    this.currentLayerIndex.set(index);
    this.selectedComboIndex.set(null); // Clear combo selection when switching layers
  }
}
