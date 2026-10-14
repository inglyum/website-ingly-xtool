#!/usr/bin/env python3
"""INGLY DESIGN: one-time import of commissioned 3x3/2x2 material-category contact sheets.

This is a static visual-content importer. It does NOT install Medusa or alter
INGLY's cart/pricing/publish engine. It only creates generated WebP files and
assigns image metadata to existing catalog IDs.
"""
from __future__ import annotations
from pathlib import Path
from io import BytesIO
import json, os, hashlib, time, urllib.request
from PIL import Image, ImageOps, ImageEnhance, ImageFilter

ROOT=Path(__file__).resolve().parents[1]
IMGROOT=ROOT/'img'/'ingly-visual'
def sheet(key: str) -> Image.Image:
    url=os.environ.get(key, '').strip()
    if not url.startswith('https://pikaso.cdnpk.net/'):
        raise RuntimeError(f'{key}: temporary signed creation URL required')
    req=urllib.request.Request(url,headers={'User-Agent':'INGLY-Asset-Importer/1.0'})
    error=None
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req,timeout=50) as response:
                body=response.read()
            image=Image.open(BytesIO(body)).convert('RGB')
            if min(image.size)<600: raise RuntimeError(f'Contact sheet too small: {image.size}')
            return image
        except Exception as exc:
            error=exc
            time.sleep(2+attempt*3)
    raise RuntimeError(f'Cannot fetch {key}: {error}')

def tile(source: Image.Image, n: int, index: int):
    w,h=source.size
    row,col=divmod(index,n)
    cw=w/n; ch=h/n
    pad=int(min(cw,ch)*.025)
    box=(round(col*cw)+pad,round(row*ch)+pad,
         round((col+1)*cw)-pad,round((row+1)*ch)-pad)
    crop=source.crop(box)
    return ImageEnhance.Contrast(crop).enhance(1.04)

CATEGORIES=[
 ('casa','Casa e arredamento','huJrx5lvqL',0,3),
 ('eventi','Eventi e ricorrenze','huJrx5lvqL',1,3),
 ('animali','Animali','huJrx5lvqL',2,3),
 ('accessori','Accessori','huJrx5lvqL',3,3),
 ('b2b','Aziendale e B2B','huJrx5lvqL',4,3),
 ('bambini','Bambini','huJrx5lvqL',5,3),
 ('stagionale','Stagionale','huJrx5lvqL',6,3),
 ('digitale','Digitale','huJrx5lvqL',7,3),
 ('custom','Personalizzazioni su richiesta','huJrx5lvqL',8,3),
 ('materiali','Materiali','6AmMDeoiJO',0,2),
 ('tecnologie','Tecnologie','6AmMDeoiJO',1,2),
 ('limited','Edizioni limitate','6AmMDeoiJO',2,2),
 ('nuova-ms3k34dc','Supereroi e Anime','6AmMDeoiJO',3,2),
]
MATERIALS=[
 ('legno','Legno','jUW6iSmLD0',0,3),
 ('plexiglass','Plexiglass','jUW6iSmLD0',1,3),
 ('metallo','Metallo','jUW6iSmLD0',2,3),
 ('pelle','Pelle','jUW6iSmLD0',3,3),
 ('vetro','Vetro','jUW6iSmLD0',4,3),
 ('bamboo','Bambù','jUW6iSmLD0',5,3),
 ('mdf','MDF e compensato','jUW6iSmLD0',6,3),
 ('pla','PLA e PETG','jUW6iSmLD0',7,3),
 ('tessuto','Tessuto','jUW6iSmLD0',8,3),
]

def write_asset(source: Image.Image, kind: str, ident: str):
    sub='categories' if kind=='category' else 'materials'
    stem=('cat-' if kind=='category' else 'material-')+ident
    dest=IMGROOT/sub
    dest.mkdir(parents=True,exist_ok=True)
    originals=[(960,640,''),(800,533,'-800'),(400,267,'-400')]
    files=[]
    for w,h,suffix in originals:
        image=ImageOps.fit(source,(w,h),Image.Resampling.LANCZOS)
        image=image.filter(ImageFilter.UnsharpMask(radius=1.2,percent=75,threshold=3))
        path=dest/(stem+suffix+'.webp')
        image.save(path,'WEBP',quality=83 if w==960 else 79,method=6)
        rel=path.relative_to(ROOT).as_posix()
        files.append({'url':rel,'width':w,'height':h,'bytes':path.stat().st_size,
          'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
    return files

def main():
    sources={'jUW6iSmLD0':sheet('MATERIAL_SHEET_URL'),
             'huJrx5lvqL':sheet('CATEGORY_SHEET_URL'),
             '6AmMDeoiJO':sheet('SPECIAL_CATEGORY_SHEET_URL')}
    categories=json.loads((ROOT/'data/categories.json').read_text())
    materials=json.loads((ROOT/'data/materiali.json').read_text())
    cat_lookup={x['id']:x for x in categories}
    mat_lookup={x['id']:x for x in materials['materiali']}
    catalog={'schemaVersion':'1.0.0','catalogVersion':'2026-10-14','source':'AI-generated INGLY photo reference sheets',
             'medusaInspired':{'imageEntity':'ProductImage','categoryEntity':'ProductCategory',
                               'keys':['url','rank','metadata','handle','status']},
             'assets':[]}
    for kind,entries,lookup in [('category',CATEGORIES,cat_lookup),('material',MATERIALS,mat_lookup)]:
        for ident,label,creation,index,n in entries:
            if ident not in lookup:raise RuntimeError(f'Missing production {kind} id {ident}')
            files=write_asset(tile(sources[creation],n,index),kind,ident)
            item=lookup[ident]
            item['previousSampleImage']=item.get('img','')
            item['img']=files[0]['url']
            item['assetKind']='illustrative-example'
            item['isDemo']=True
            item['replaceable']=True
            item['sourceUrl']=f'https://www.magnific.com/app/creation/{creation}'
            item['licenseStatus']='AI-generated illustration; not proof of real INGLY production'
            item['altIT']=label+' — esempio fotografico illustrativo, non prodotto realizzato da INGLY'
            item['altEN']=label+' — illustrative product photograph, not original INGLY work'
            item['imageMeta']={'width':960,'height':640,'objectFit':'cover','focalPoint':{'x':50,'y':50}}
            catalog['assets'].append({'id':ident,'entity':kind,'handle':ident,
                'url':files[0]['url'],'images':files,
                'rank':0,'metadata':{
                  'altIT':item['altIT'],'altEN':item['altEN'],
                  'assetKind':'illustrative-example','isDemo':True,'replaceable':True,
                  'sourceUrl':item['sourceUrl'],'licenseStatus':item['licenseStatus']}})
    (ROOT/'data/categories.json').write_text(json.dumps(categories,ensure_ascii=False,indent=2)+'\n')
    (ROOT/'data/materiali.json').write_text(json.dumps(materials,ensure_ascii=False,indent=2)+'\n')
    (ROOT/'data/ingly-visual-assets.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n')
    config_path=ROOT/'data/config.json'
    cfg=json.loads(config_path.read_text())
    if cfg.get('heroImageDemo',True):
        cfg['heroImage']='img/ingly-visual/categories/cat-custom.webp'
        cfg['heroImageAlt']={'it':'Personalizzazioni originali: immagine illustrativa','en':'Creative customizations: illustrative photo'}
        cfg['heroImageDemo']=True
        cfg['heroImageKind']='illustrative-example'
        config_path.write_text(json.dumps(cfg,ensure_ascii=False,indent=2)+'\n')
    # Unique new paths are safe even without changing the existing service worker key.
    print(f'Generated {len(catalog["assets"])} photo subjects / {len(catalog["assets"])*3} image files')
if __name__=='__main__': main()
