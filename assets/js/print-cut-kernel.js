/* INGLY Print & Cut — original, local-only contour kernel.
   Physical dimensions are millimetres. A preview is NOT a calibrated machine job.
   This code does not access files or the network. */

const finite = (value,name,min,max) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n < min || n > max) throw new RangeError(name + ' fuori limite');
  return n;
};

export function alphaMask(rgba,width,height,threshold=48){
  const w=finite(width,'larghezza',1,1600), h=finite(height,'altezza',1,1600);
  const t=finite(threshold,'soglia',0,255);
  if(!rgba || rgba.length!==w*h*4)throw new Error('Buffer RGBA non valido');
  const mask=new Uint8Array(w*h);
  for(let i=0;i<mask.length;i++)mask[i]=rgba[i*4+3]>=t?1:0;
  return mask;
}

/* Exact squared Euclidean distance transform (Felzenszwalb–Huttenlocher),
   O(width*height); avoids a quadratic brush loop on large images. */
function edt1d(f,n){
  const v=new Int32Array(n), z=new Float64Array(n+1), out=new Float64Array(n);
  let k=0;v[0]=0;z[0]=-Infinity;z[1]=Infinity;
  for(let q=1;q<n;q++){
    let s;
    do{
      const p=v[k];
      s=((f[q]+q*q)-(f[p]+p*p))/(2*(q-p));
      if(s<=z[k])k--;else break;
    }while(k>=0);
    k++;v[k]=q;z[k]=s;z[k+1]=Infinity;
  }
  k=0;
  for(let q=0;q<n;q++){
    while(z[k+1]<q)k++;
    out[q]=(q-v[k])**2+f[v[k]];
  }
  return out;
}

export function dilate(mask,width,height,radius){
  const w=finite(width,'larghezza',1,1600),h=finite(height,'altezza',1,1600);
  const r=finite(radius,'margine pixel',0,100);
  if(!mask||mask.length!==w*h)throw new Error('Maschera non valida');
  if(r===0)return Uint8Array.from(mask);
  const BIG=1e12,temp=new Float64Array(w*h),input=new Float64Array(Math.max(w,h));
  for(let y=0;y<h;y++){
    for(let x=0;x<w;x++)input[x]=mask[y*w+x]?0:BIG;
    const d=edt1d(input,w);
    for(let x=0;x<w;x++)temp[y*w+x]=d[x];
  }
  const result=new Uint8Array(w*h),r2=r*r;
  for(let x=0;x<w;x++){
    for(let y=0;y<h;y++)input[y]=temp[y*w+x];
    const d=edt1d(input,h);
    for(let y=0;y<h;y++)result[y*w+x]=d[y]<=r2?1:0;
  }
  return result;
}

export function padMask(mask,w,h,pad){
  const p=Math.ceil(finite(pad,'padding',0,120));
  const outW=w+2*p,outH=h+2*p,out=new Uint8Array(outW*outH);
  for(let y=0;y<h;y++)out.set(mask.subarray(y*w,(y+1)*w),(y+p)*outW+p);
  return {mask:out,width:outW,height:outH,padding:p};
}

const pointKey=(x,y)=>x+','+y;
const signedArea=pts=>pts.reduce((sum,p,i)=>{
  const q=pts[(i+1)%pts.length];return sum+p[0]*q[1]-q[0]*p[1];
},0)/2;

/* Raster boundary edges face clockwise around the opaque pixels.
   Clockwise outer loops have positive area; interior holes negative area. */
export function traceOutlines(mask,w,h,{minArea=3,maxLoops=200}={}){
  if(!mask||mask.length!==w*h)throw new Error('Maschera non valida');
  const edges=[], from=new Map();
  function edge(ax,ay,bx,by){
    const id=edges.length, direction=bx>ax?0:by>ay?1:bx<ax?2:3;
    edges.push({a:[ax,ay],b:[bx,by],direction});
    const k=pointKey(ax,ay);
    if(!from.has(k))from.set(k,[]);
    from.get(k).push(id);
  }
  const get=(x,y)=>x>=0&&x<w&&y>=0&&y<h&&mask[y*w+x];
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(get(x,y)){
    if(!get(x,y-1))edge(x,y,x+1,y);
    if(!get(x+1,y))edge(x+1,y,x+1,y+1);
    if(!get(x,y+1))edge(x+1,y+1,x,y+1);
    if(!get(x-1,y))edge(x,y+1,x,y);
  }
  const used=new Uint8Array(edges.length),out=[];
  for(let start=0;start<edges.length;start++){
    if(used[start])continue;
    const first=edges[start].a,pts=[first];let id=start,closed=false;
    for(let steps=0;steps<=edges.length;steps++){
      const e=edges[id];if(used[id])break;used[id]=1;
      const [x,y]=e.b;
      if(x===first[0]&&y===first[1]){closed=true;break}
      pts.push(e.b);
      const candidates=(from.get(pointKey(x,y))||[]).filter(n=>!used[n]);
      if(!candidates.length)break;
      // Prefer the clockwise turn when boundaries meet at one pixel corner.
      candidates.sort((a,b)=>{
        const rank=n=>{const t=(edges[n].direction-e.direction+4)%4;return t===1?0:t===0?1:t===3?2:3};
        return rank(a)-rank(b);
      });
      id=candidates[0];
    }
    if(!closed||pts.length<3)continue;
    // Remove collinear raster corners without moving the outline.
    const clean=pts.filter((p,i)=>{
      const a=pts[(i+pts.length-1)%pts.length],b=pts[(i+1)%pts.length];
      return (p[0]-a[0])*(b[1]-p[1])!==(p[1]-a[1])*(b[0]-p[0]);
    });
    if(clean.length>=3&&signedArea(clean)>=minArea)out.push(clean);
    if(out.length>maxLoops)throw new Error('Troppe sagome separate: semplifica il file sorgente');
  }
  return out.sort((a,b)=>signedArea(b)-signedArea(a));
}

const fmt=n=>Number(n.toFixed(3)).toString();
export function cutSvg({contours,widthPx,heightPx,pixelMm,imageHref='',imageWidthPx=0,imageHeightPx=0,paddingPx=0,includePrint=false}){
  const scale=finite(pixelMm,'mm per pixel',0.0001,100);
  const w=finite(widthPx,'larghezza raster',1,2000)*scale;
  const h=finite(heightPx,'altezza raster',1,2000)*scale;
  if(!Array.isArray(contours)||!contours.length)throw new Error('Nessun contorno trovato');
  const paths=contours.map(loop=>'M '+loop.map(pt=>fmt(pt[0]*scale)+' '+fmt(pt[1]*scale)).join(' L ')+' Z');
  const safeImage=includePrint&&/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(imageHref)?imageHref:'';
  const print=safeImage?'<g id="INGLY_PRINT"><image href="'+safeImage+'" x="'+fmt(paddingPx*scale)+'" y="'+fmt(paddingPx*scale)+'" width="'+fmt(imageWidthPx*scale)+'" height="'+fmt(imageHeightPx*scale)+'"/></g>':'';
  return '<?xml version="1.0" encoding="UTF-8"?>\n'+
   '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="'+fmt(w)+'mm" height="'+fmt(h)+'mm" viewBox="0 0 '+fmt(w)+' '+fmt(h)+'">'+
   '<title>INGLY Print &amp; Cut — sagoma dimensionale</title>'+
   '<desc>Contorno da immagine alpha; verificare dimensioni, materiale, kerf e calibrazione della macchina prima del taglio.</desc>'+
   print+'<g id="INGLY_CUT" fill="none" stroke="#ff304a" stroke-width="0.1" stroke-linejoin="round">'+
   paths.map(d=>'<path d="'+d+'"/>').join('')+'</g></svg>';
}
