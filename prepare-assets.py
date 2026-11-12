from pathlib import Path
import re, subprocess, sys, urllib.request
root = Path(__file__).parent
assets = root / 'dist' / 'assets'
for family, stem in [('Cormorant+Garamond:wght@500', 'cormorant'), ('Manrope:wght@400;500', 'manrope')]:
    request = urllib.request.Request('https://fonts.googleapis.com/css2?family=' + family + '&display=swap', headers={'User-Agent': 'Mozilla/5.0'})
    css = urllib.request.urlopen(request).read().decode('utf-8')
    urls = list(dict.fromkeys(re.findall(r'url\((https://[^)]+)\)', css)))
    for i, url in enumerate(urls):
        name = f'{stem}-{i}.' + url.split('?')[0].rsplit('.', 1)[-1]
        target = assets / name
        if not target.exists(): urllib.request.urlretrieve(url, target)
        css = css.replace(url, './assets/' + name)
    (root / 'dist' / f'{stem}.css').write_text(css, encoding='utf-8')
    print(stem, len(urls))
sys.path.insert(0, str(root / '.tools'))
import imageio_ffmpeg
ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
source = root / '.tools' / 'florist-original.mp4'
def run(args):
    subprocess.run([ffmpeg, '-hide_banner', '-loglevel', 'error', '-y', *args], check=True)
common = ['-c:v', 'libx264', '-preset', 'medium', '-crf', '27', '-pix_fmt', 'yuv420p', '-movflags', '+faststart']
run(['-ss','2','-i',str(source),'-t','11','-an','-vf','scale=1600:-2',*common,str(assets / 'florist.mp4')])
run(['-ss','2','-i',str(source),'-t','11','-an','-vf','crop=810:1440:1430:0,scale=640:-2',*common,str(assets / 'florist-mobile.mp4')])
run(['-ss','3','-i',str(source),'-frames:v','1','-vf','scale=1920:-2','-q:v','3',str(assets / 'florist-poster.jpg')])
for path in assets.glob('*'):
    if 'original' not in path.name: print(path.name, path.stat().st_size)
