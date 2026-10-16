/* INGLY navigation — pure browser link policy.
   Preserve native browser behavior for modified clicks, tabs, downloads,
   fragments, external destinations and paths outside the Pages base. */
export function routeClickTarget(event,anchor,{base,baseURI,origin}={}){
  if(!event||!anchor||event.defaultPrevented||event.button!==0||
    event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return null;
  if(anchor.hasAttribute('download')||anchor.hasAttribute('data-no-spa'))return null;
  const target=(anchor.getAttribute('target')||'').trim().toLowerCase();
  if(target&&target!=='_self')return null;
  const href=(anchor.getAttribute('href')||'').trim();
  if(!href||href==='#'||href.startsWith('?'))return null;
  const legacy=href.startsWith('#/');
  if(href.startsWith('#')&&!legacy)return null;
  const root=String(base||'/').replace(/\/*$/,'/');
  let destination;
  try{
    destination=legacy
      ? new URL(href.slice(2),new URL(root,origin))
      : new URL(href,baseURI);
  }catch(_){return null}
  if(destination.origin!==origin||!destination.pathname.startsWith(root))return null;
  // Native anchors (including fragments on other pages) must keep working.
  if(destination.hash)return null;
  const relative=destination.pathname.slice(root.length).replace(/^\/+|\/+$/g,'');
  const segments=relative?relative.split('/'):[];
  return {segments,query:destination.search.slice(1),path:destination.pathname};
}
