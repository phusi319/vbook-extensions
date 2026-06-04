import zipfile
import os
import sys

def make_plugin_zip(ext_dir, output_zip):
    with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zf:
        zf.write(os.path.join(ext_dir, 'plugin.json'), 'plugin.json')
        icon = os.path.join(ext_dir, 'icon.png')
        if os.path.exists(icon):
            zf.write(icon, 'icon.png')
        src_dir = os.path.join(ext_dir, 'src')

        
        for f in sorted(os.listdir(src_dir)):
            zf.write(os.path.join(src_dir, f), 'src/' + f)

if __name__ == '__main__':
    make_plugin_zip(sys.argv[1], sys.argv[2])
