/* INGLY commerce: inventory-backed guard for physical and custom products.
   Stock omitted/null means unknown/made-to-order; never invent inventory.
   Stock 0 is explicit unavailability, even if the UI was bypassed. */
export const trackedStock = product =>
  Number.isInteger(product?.stock) && product.stock >= 0 ? product.stock : null;

export function reservedUnits(cart = [], productId, exceptIndex = -1) {
  return (Array.isArray(cart) ? cart : []).reduce((n,row,index)=>{
    if(index===exceptIndex) return n;
    if(!['physical','custom'].includes(row?.tipo) || String(row.id)!==String(productId))return n;
    return n + (Number.isFinite(Number(row.q)) ? Math.max(0,Math.floor(Number(row.q))) : 0);
  },0);
}

export function canAddUnits(product,cart=[],requested=1) {
  const q=Number.isFinite(Number(requested)) ? Math.max(1,Math.floor(Number(requested))) : 1;
  const stock=trackedStock(product);
  if(stock===null)return {allowed:true,quantity:q,reason:'untracked'};
  const remaining=Math.max(0,stock-reservedUnits(cart,product.id));
  return {allowed:remaining>0,quantity:Math.min(q,remaining),reason:remaining>0?'available':'out-of-stock'};
}

export function reconcileStock(cart=[], products=[]) {
  const productsById=new Map((products||[]).map(p=>[String(p.id),p]));
  const result=[];
  for(const row of (Array.isArray(cart)?cart:[])){
    if(!['physical','custom'].includes(row?.tipo)){result.push({...row});continue}
    const product=productsById.get(String(row.id));
    if(!product||product.hidden===true)continue;
    const stock=trackedStock(product);
    const requested=Math.max(1,Math.floor(Number(row.q)||1));
    const used=reservedUnits(result,product.id);
    const allowed=stock===null?requested:Math.min(requested,Math.max(0,stock-used));
    if(allowed>0)result.push({...row,q:allowed});
  }
  return result;
}
