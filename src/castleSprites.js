import * as THREE from 'three';

// Fixed-angle 2.5D castle: artwork is a transparent isometric sprite on a depth-tested plane.
// Each tier can supply a separate PNG/WebP. A GLB remains the fallback until art is approved.
const tiers=[{min:25,key:'amethyst'},{min:17,key:'red'},{min:9,key:'timber'},{min:1,key:'frontier'}];
const loader=new THREE.TextureLoader();
const cache=new Map();
export function castleSpriteTier(level){
 return tiers.find(t=>Number(level)>=t.min)?.key||'frontier';
}
export async function preloadCastleSprites(){
 const results=await Promise.all(tiers.map(async t=>{
  const url='/art/castles/'+t.key+'.webp';
  try{
   const texture=await loader.loadAsync(url);
   texture.colorSpace=THREE.SRGBColorSpace;
   texture.anisotropy=4;
   cache.set(t.key,texture);
   return t.key;
  }catch{return null}
 }));
 return results.filter(Boolean);
}
export function createCastleSprite(level){
 const texture=cache.get(castleSpriteTier(level));
 if(!texture)return null;
 const material=new THREE.MeshBasicMaterial({map:texture,transparent:true,alphaTest:.08,side:THREE.DoubleSide,depthWrite:false});
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(3.7,4.1),material);
 // Sprite faces the fixed city camera, but stays anchored to its plot.
 mesh.rotation.y=Math.PI/4;
 mesh.position.set(0,2.05,0);
 mesh.renderOrder=5;
 mesh.userData.isCastleSprite=true;
 return mesh;
}
export function castleSpriteStatus(){return tiers.map(t=>({tier:t.key,loaded:cache.has(t.key)}))}
