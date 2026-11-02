import * as THREE from 'three';

// One artwork slot per castle level. When individual level art is not ready,
// use the matching milestone illustration; GLB is a last-resort fallback.
export const CASTLE_MAX_LEVEL=35;
export const CASTLE_MILESTONES=[
 {min:35,key:'level-35',name:'Amethyst Citadel'},
 {min:29,key:'amethyst',name:'Amethyst Ascent'},
 {min:22,key:'royal',name:'Royal Citadel'},
 {min:15,key:'red',name:'Red Stronghold'},
 {min:8,key:'timber',name:'Timber Bastion'},
 {min:1,key:'frontier',name:'Frontier Fort'}
];
const loader=new THREE.TextureLoader();
const cache=new Map();
const missing=new Set();
const pending=new Map();
function load(key){
 if(cache.has(key))return Promise.resolve(cache.get(key));
 if(missing.has(key))return Promise.resolve(null);
 if(pending.has(key))return pending.get(key);
 const promise=loader.loadAsync('/art/castles/'+key+'.webp').then(texture=>{
  texture.colorSpace=THREE.SRGBColorSpace;
  texture.anisotropy=4;
  cache.set(key,texture);pending.delete(key);return texture;
 }).catch(()=>{missing.add(key);pending.delete(key);return null});
 pending.set(key,promise);return promise;
}
export function castleSpriteTier(level){
 const lv=Math.max(1,Math.min(CASTLE_MAX_LEVEL,Math.floor(Number(level)||1)));
 return CASTLE_MILESTONES.find(t=>lv>=t.min)?.key||'frontier';
}
export async function preloadCastleSprites(){
 // Preload six milestone images only; avoid 35 unnecessary requests on Android.
 // Exact-level images are fetched on demand as a castle is rendered.
 const milestoneKeys=CASTLE_MILESTONES.map(t=>t.key);
 const keys=[...new Set(milestoneKeys)];
 return (await Promise.all(keys.map(load))).filter(Boolean);
}
export function createCastleSprite(level){
 const lv=Math.max(1,Math.min(CASTLE_MAX_LEVEL,Math.floor(Number(level)||1)));
 const key='level-'+lv;
 const fallback=castleSpriteTier(lv);
 const texture=cache.get(key)||cache.get(fallback);
 if(!texture){
  // Missing level art falls back to the existing castle model.
  load(key);
  load(fallback);
  return null;
 }
 if(!cache.has(key))load(key);
 const material=new THREE.MeshBasicMaterial({
  map:texture,transparent:true,alphaTest:.08,side:THREE.DoubleSide,depthWrite:false
 });
 // Preserve source-image proportions so artwork never stretches across upgrades.
 const image=texture.image;
 const aspect=image?.width&&image?.height?image.width/image.height:3.7/4.1;
 const height=4.1;
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(height*aspect,height),material);
 mesh.rotation.y=Math.PI/4;
 mesh.position.set(0,2.05,0);
 mesh.renderOrder=5;
 mesh.userData.isCastleSprite=true;
 mesh.userData.castleLevel=lv;
 mesh.userData.artKey=cache.has(key)?key:fallback;
 return mesh;
}
export function castleSpriteStatus(){return CASTLE_MILESTONES.map(t=>({tier:t.key,loaded:cache.has(t.key)}))}
