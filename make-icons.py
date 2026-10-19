from PIL import Image, ImageDraw
from pathlib import Path
import math
folder=Path('dist/icons')
folder.mkdir(exist_ok=True)
image=Image.new('RGB',(1024,1024),'#365b42')
draw=ImageDraw.Draw(image)
for i in range(8):
    a=i*math.pi/4
    x,y=512+178*math.cos(a),512+178*math.sin(a)
    draw.ellipse((x-93,y-93,x+93,y+93),fill='#d8debd')
draw.ellipse((410,410,614,614),fill='#d8debd')
draw.ellipse((467,467,557,557),fill='#dc956f')
for size,name in [(192,'icon-192.png'),(512,'icon-512.png'),(180,'apple-touch-icon.png')]:
    image.resize((size,size),Image.Resampling.LANCZOS).save(folder/name)
