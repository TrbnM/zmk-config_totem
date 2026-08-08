# ZMK Config for TOTEM Keyboard

This project contains the [ZMK](https://zmk.dev/) firmware configuration for the **TOTEM**, a 38-key column-staggered split keyboard.

## Project Overview

- **Keyboard:** TOTEM (Split, 38 keys)
- **Controllers:** Seeed XIAO BLE (default) or RP2040.
- **Firmware:** ZMK
- **Main Configuration:** `config/totem.keymap`
- **Hardware Definition:** `config/boards/shields/totem/`

## Directory Structure

- `config/`: Main ZMK configuration directory.
  - `totem.keymap`: The user-defined keyboard layout and behaviors.
  - `totem.conf`: Global configuration options (e.g., Bluetooth, deep sleep).
  - `west.yml`: ZMK manifest file defining dependencies.
  - `boards/shields/totem/`: The shield definition for the TOTEM hardware.
    - `totem.dtsi`: Devicetree include file for matrix and pin mapping.
    - `totem_left.overlay` / `totem_right.overlay`: Side-specific hardware overrides.
- `.github/workflows/build.yml`: GitHub Actions workflow for automated firmware building.
- `build.yaml`: Configuration for the build workflow, specifying targets.

## Building and Flashing

### Automated Build (Recommended)
1. Push changes to your GitHub repository.
2. Navigate to the **Actions** tab.
3. Download the `firmware.zip` from the latest successful run.
4. Flash the `.uf2` files to each half (Reset twice to enter bootloader mode).

### Local Build
To build locally, you need a ZMK development environment set up.
```bash
# Build left half
west build -b xiao_ble -- -DSHIELD=totem_left

# Build right half
west build -b xiao_ble -- -DSHIELD=totem_right
```

## Customization

### Keymap
Edit `config/totem.keymap` to change the layout. The file uses standard ZMK Devicetree syntax.
- **Layers:** Defined in the `keymap` node.
- **Behaviors:** Includes customized `hm` (homerow mods) and `lt` (layer-tap) configurations.
- **Combos:** Can be added to the `combos` node.

### Connectivity & Power
Edit `config/totem.conf` for settings like:
- `CONFIG_ZMK_SLEEP=y` (Enable deep sleep)
- `CONFIG_ZMK_IDLE_SLEEP_TIMEOUT=3600000` (Sleep timeout in ms)

## Resources
- [TOTEM Hardware Repository](https://github.com/GEIGEIGEIST/totem)
- [ZMK Documentation](https://zmk.dev/docs)
- [Keycodes Reference](https://zmk.dev/docs/codes)
