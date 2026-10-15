import assert from 'node:assert/strict';
import {trackedStock,reservedUnits,canAddUnits,reconcileStock} from '../assets/js/stock-guards.js';
const products=[
 {id:1,hidden:false,stock:2},
 {id:2,hidden:false,stock:0},
 {id:3,hidden:false,stock:null},
 {id:4,hidden:true,stock:5}
];
assert.equal(trackedStock(products[0]),2);
assert.equal(trackedStock(products[2]),null,'Unknown stock cannot be invented');
assert.equal(trackedStock({stock:-1}),null);
assert.deepEqual(canAddUnits(products[1],[],1),{allowed:false,quantity:0,reason:'out-of-stock'});
assert.equal(canAddUnits(products[0],[],20).quantity,2,'Cannot add above tracked stock');
assert.equal(canAddUnits(products[2],[],20).quantity,20,'Untracked made-to-order quantity not capped');
const current=[{tipo:'physical',id:1,q:1},{tipo:'custom',id:1,q:1},{tipo:'digital',id:1,q:1}];
assert.equal(reservedUnits(current,1),2,'Physical and custom variants share stock, not digital');
assert.equal(canAddUnits(products[0],current,1).allowed,false);
assert.equal(reservedUnits(current,1,0),1,'Current row can be excluded from its own cap');
const restored=reconcileStock([
 {tipo:'physical',id:1,q:5},{tipo:'custom',id:1,q:4},
 {tipo:'physical',id:2,q:1},{tipo:'physical',id:4,q:1},
 {tipo:'digital',id:90,q:1},{tipo:'material',id:15,q:3},
 {tipo:'physical',id:3,q:7}
],products);
assert.deepEqual(restored.map(x=>[x.tipo,x.id,x.q]),[
 ['physical',1,2],['digital',90,1],['material',15,3],['physical',3,7]
],'Restore caps stock, removes unavailable/hidden physical goods and preserves nonphysical and untracked goods');
console.log('✔ Shop stock guard: out-of-stock rejection, variant-shared cap, persisted cart and checkout reconciliation');
