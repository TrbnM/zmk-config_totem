import re
import json
import os

keymap_path = '../config/totem.keymap'
output_path = 'public/keymap.json'

with open(keymap_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Parse macros
macros = {}
for line in content.splitlines():
    match = re.match(r'^\s*#define\s+(\w+)\s+(.+?)\s*(//.*)?$', line)
    if match:
        name = match.group(1)
        value = match.group(2).strip()
        macros[name] = value

# 2. Parse layers
layers = []
# Find keymap block
start = content.find('keymap {')
if start != -1:
    depth = 0
    in_keymap = False
    keymap_content = ""
    for i in range(start, len(content)):
        if content[i] == '{':
            depth += 1
            if depth == 1:
                in_keymap = True
        elif content[i] == '}':
            depth -= 1
            if depth == 0 and in_keymap:
                keymap_content = content[start+8:i]
                break
                
    # Now find layers in keymap_content
    layer_matches = re.finditer(r'([a-zA-Z0-9_\+\-]+)\s*{', keymap_content)
    for l_match in layer_matches:
        layer_name = l_match.group(1).strip()
        
        # find end of layer
        l_start = l_match.end()
        l_depth = 1
        l_end = -1
        for i in range(l_start, len(keymap_content)):
            if keymap_content[i] == '{':
                l_depth += 1
            elif keymap_content[i] == '}':
                l_depth -= 1
                if l_depth == 0:
                    l_end = i
                    break
                    
        if l_end != -1:
            layer_content = keymap_content[l_start:l_end]
            bindings_match = re.search(r'bindings\s*=\s*<([^>]+)>', layer_content, re.DOTALL)
            bindings = []
            if bindings_match:
                b_content = bindings_match.group(1)
                b_content = re.sub(r'//.*', '', b_content) # remove comments
                b_content = re.sub(r'\s+', ' ', b_content).strip()
                tokens = b_content.split(' ')
                i = 0
                while i < len(tokens):
                    tok = tokens[i]
                    if not tok:
                        i += 1
                        continue
                    if tok.startswith('&'):
                        if tok in ['&kp', '&mo', '&to', '&out', '&ext_power']:
                            if i + 1 < len(tokens):
                                bindings.append(tok + ' ' + tokens[i+1])
                                i += 2
                            else:
                                bindings.append(tok)
                                i += 1
                        elif tok in ['&mt', '&lt', '&hm']:
                            if i + 2 < len(tokens):
                                bindings.append(tok + ' ' + tokens[i+1] + ' ' + tokens[i+2])
                                i += 3
                            else:
                                bindings.append(tok)
                                i += 1
                        elif tok in ['&bt']:
                            if i + 1 < len(tokens) and tokens[i+1] == 'BT_CLR':
                                bindings.append('&bt BT_CLR')
                                i += 2
                            elif i + 1 < len(tokens) and tokens[i+1] == 'BT_NXT':
                                bindings.append('&bt BT_NXT')
                                i += 2
                            elif i + 1 < len(tokens) and tokens[i+1] == 'BT_PRV':
                                bindings.append('&bt BT_PRV')
                                i += 2
                            elif i + 2 < len(tokens) and tokens[i+1] == 'BT_SEL':
                                bindings.append('&bt BT_SEL ' + tokens[i+2])
                                i += 3
                            else:
                                bindings.append(tok)
                                i += 1
                        else:
                            bindings.append(tok)
                            i += 1
                    else:
                        bindings.append(tok)
                        i += 1
            layers.append({
                'name': layer_name,
                'bindings': bindings
            })

    # 3. Parse Combos
    combos = []
    combos_start = content.find('combos {')
    if combos_start != -1:
        c_depth = 0
        in_combos = False
        combos_content = ""
        for i in range(combos_start, len(content)):
            if content[i] == '{':
                c_depth += 1
                if c_depth == 1:
                    in_combos = True
            elif content[i] == '}':
                c_depth -= 1
                if c_depth == 0 and in_combos:
                    combos_content = content[combos_start+8:i]
                    break
        
        combo_matches = re.finditer(r'([a-zA-Z0-9_\+\-]+)\s*{([^}]+)}', combos_content, re.DOTALL)
        for c_match in combo_matches:
            c_name = c_match.group(1).strip()
            c_body = c_match.group(2)
            
            # parse timeout
            timeout_match = re.search(r'timeout-ms\s*=\s*<(\d+)>', c_body)
            timeout = int(timeout_match.group(1)) if timeout_match else 50
            
            # parse key-positions
            keys_match = re.search(r'key-positions\s*=\s*<([^>]+)>', c_body)
            key_positions = []
            if keys_match:
                keys_str = keys_match.group(1)
                keys_str = re.sub(r'//.*', '', keys_str).strip()
                key_positions = [int(k) for k in keys_str.split(' ') if k.strip().isdigit()]
                
            # parse bindings
            bindings_match = re.search(r'bindings\s*=\s*<([^>]+)>', c_body)
            binding = ""
            if bindings_match:
                b_str = bindings_match.group(1)
                b_str = re.sub(r'//.*', '', b_str).strip()
                binding = b_str
                
            combos.append({
                'name': c_name,
                'timeout': timeout,
                'keyPositions': key_positions,
                'binding': binding
            })

output_dir = os.path.dirname(output_path)
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

with open(output_path, 'w', encoding='utf-8') as f:
    json.dump({'macros': macros, 'layers': layers, 'combos': combos}, f, indent=2)

print(f"Generated {output_path} with {len(layers)} layers and {len(combos)} combos.")
