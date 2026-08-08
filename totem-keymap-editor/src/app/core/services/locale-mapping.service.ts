import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocaleMappingService {
  
  // Maps ZMK raw bindings to German display characters
  private zmkToDe: Record<string, string> = {
    // QWERTY to QWERTZ Letter Swaps
    '&kp Y': 'Z',
    '&kp Z': 'Y',
    
    // QWERTY standard keys to QWERTZ outputs
    '&kp MINUS': 'ß',
    '&kp EQUAL': '´',
    '&kp LBKT': 'Ü',
    '&kp RBKT': '+',
    '&kp SEMI': ';',
    '&kp SEMICOLON': ';',
    '&kp SQT': 'Ä',
    '&kp GRAVE': '^',
    '&kp BSLH': '#',
    '&kp SLASH': '-',
    '&kp COMMA': ',',
    '&kp DOT': '.',
    
    // Standard ZMK Shifted Keys to QWERTZ outputs
    '&kp LS(N1)': '!',
    '&kp LS(N2)': '"',
    '&kp LS(N3)': '§',
    '&kp LS(N4)': '$',
    '&kp LS(N5)': '%',
    '&kp LS(N6)': '&',
    '&kp LS(N7)': '/',
    '&kp LS(N8)': '(',
    '&kp LS(N9)': ')',
    '&kp LS(N0)': '=',
    // Standard ZMK Control & Modifier Keys to short visual representations
    '&kp ESCAPE': 'ESC',
    '&kp ESC': 'ESC',
    '&kp TAB': 'TAB',
    '&kp SPACE': 'SPC',
    '&kp RET': 'RET',
    '&kp ENTER': 'RET',
    '&kp BSPC': '⌫',
    '&kp BACKSPACE': '⌫',
    '&kp DEL': '⌦',
    '&kp DELETE': '⌦',
    '&kp UP': '↑',
    '&kp DOWN': '↓',
    '&kp LEFT': '←',
    '&kp RIGHT': '→',
    '&kp LSHIFT': '⇧',
    '&kp RSHIFT': '⇧',
    '&kp LSHFT': '⇧',
    '&kp RSHFT': '⇧',
    '&kp LCTRL': 'Ctrl',
    '&kp RCTRL': 'Ctrl',
    '&kp LALT': 'Alt',
    '&kp RALT': 'Alt',
    '&kp LGUI': 'Gui',
    '&kp RGUI': 'Gui',
    
    // User's DE_* Macros
    'DE_A_UML': 'Ä',
    'DE_O_UML': 'Ö',
    'DE_U_UML': 'Ü',
    'DE_SZ': 'ß',
    'DE_EXCL': '!',
    'DE_DQUO': '"',
    'DE_SECT': '§',
    'DE_DLR': '$',
    'DE_PERC': '%',
    'DE_AMPS': '&',
    'DE_SLSH': '/',
    'DE_LPAR': '(',
    'DE_RPAR': ')',
    'DE_EQL': '=',
    'DE_QMRK': '?',
    'DE_DEG': '°',
    'DE_PIPE': '|',
    'DE_BSLH': '\\',
    'DE_LBRC': '{',
    'DE_RBRC': '}',
    'DE_LBKT': '[',
    'DE_RBKT': ']',
    'DE_AT': '@',
    'DE_EURO': '€',
    'DE_TILD': '~',
    'DE_LT': '<',
    'DE_GT': '>',
    'DE_PLUS': '+',
    'DE_ASTR': '*',
    'DE_HASH': '#',
    'DE_QUOT': "'",
    'DE_MINS': '-',
    'DE_UNDS': '_',
    'DE_DOT': '.',
    'DE_COMM': ',',
    'DE_COLN': ':',
    'DE_SCLN': ';',
    'DE_CIRC': '^',
    'DE_ACUT': '´',
    'DE_GRAV': '`'
  };

  // Maps German character inputs back to ZMK raw bindings
  private deToZmk: Record<string, string> = {};

  constructor() {
    // Dynamically invert the map
    for (const [zmk, de] of Object.entries(this.zmkToDe)) {
      this.deToZmk[de] = zmk;
    }
  }

  /**
   * Translates a raw ZMK binding to its German display representation.
   * Handles complex bindings like &hm LCTRL Y -> &hm LCTRL Z.
   */
  public toGermanDisplay(binding: string): string {
    if (!binding) return '';
    
    // Exact match for simple cases
    if (this.zmkToDe[binding]) {
      return this.zmkToDe[binding];
    }
    
    // Special handling for keycodes wrapped in modifiers or layer taps
    // e.g. &hm LGUI Y -> &hm LGUI Z
    const parts = binding.split(' ');
    if (parts.length > 0) {
      const lastPart = parts[parts.length - 1];
      // Check if the last part is a standard QWERTY key that is mapped
      if (lastPart === 'Y') {
        parts[parts.length - 1] = 'Z';
        return parts.join(' ');
      } else if (lastPart === 'Z') {
        parts[parts.length - 1] = 'Y';
        return parts.join(' ');
      } else if (this.zmkToDe[lastPart]) {
        // e.g. &hm LGUI DE_A_UML -> &hm LGUI Ä
        parts[parts.length - 1] = this.zmkToDe[lastPart];
        return parts.join(' ');
      }
    }
    
    return binding;
  }

  /**
   * Translates a German character input into its ZMK raw binding.
   * If the user types 'Z', we return '&kp Y'.
   * If they type 'Ä', we return 'DE_A_UML'.
   */
  public toZmkBinding(input: string): string {
    if (!input) return '';
    const upperInput = input.trim().toUpperCase();
    
    // Special casing for single letters typed directly
    if (upperInput === 'Z') {
      return '&kp Y';
    }
    if (upperInput === 'Y') {
      return '&kp Z';
    }
    
    // If it's a known German symbol (like Ä, ß, etc)
    if (this.deToZmk[upperInput]) {
      return this.deToZmk[upperInput];
    }
    
    // If the user typed a full ZMK behavior string with German letters at the end
    // e.g. '&lt Nav Z' -> '&lt Nav Y'
    const parts = input.split(' ');
    if (parts.length > 1) {
      const lastPart = parts[parts.length - 1].toUpperCase();
      if (lastPart === 'Z') {
        parts[parts.length - 1] = 'Y';
        return parts.join(' ');
      } else if (lastPart === 'Y') {
        parts[parts.length - 1] = 'Z';
        return parts.join(' ');
      } else if (this.deToZmk[lastPart]) {
        parts[parts.length - 1] = this.deToZmk[lastPart];
        return parts.join(' ');
      }
    }
    
    // Assume standard QWERTY single letter if it's 1 char (except Y/Z which we handled)
    if (input.length === 1 && /[A-X]/i.test(input)) {
        return `&kp ${upperInput}`;
    }

    // Default: return what they typed
    return input;
  }
}
