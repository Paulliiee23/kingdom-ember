import * as THREE from 'three';

// Shared 2.5D art layer. Transparent, depth-tested sprites are attached to
// existing gameplay objects, preserving selection, building footprints and saves.
const loader=new THREE.TextureLoader();
const cache=new Map();
const pending=new Map();
const missing=new Set();
const base='/art/buildings/';
function safeKey(key){return /^[a-z][a-z0-9-]*$/.test(key)?key:null}
export function loadBuildingSprite(key){
 key=safeKey(key);if(!key)return Promise.resolve(null);
 if(cache.has(key))return Promise.resolve(cache.get(key));
 if(missing.has(key))return Promise.resolve(null);
 if(pending.has(key))return pending.get(key);
 const task=loader.loadAsync(base+key+'.webp').then(texture=>{
  texture.colorSpace=THREE.SRGBColorSpace;
  texture.anisotropy=4;
  cache.set(key,texture);pending.delete(key);return texture;
 }).catch(()=>{missing.add(key);pending.delete(key);return null});
 pending.set(key,task);return task;
}
export function createBuildingSprite(key,{width=2.55,height=3.2}={}){
 const texture=cache.get(key);if(!texture)return null;
 const material=new THREE.MeshBasicMaterial({
  map:texture,transparent:true,alphaTest:.08,depthWrite:false,side:THREE.DoubleSide
 });
 const sprite=new THREE.Mesh(new THREE.PlaneGeometry(width,height),material);
 sprite.rotation.y=Math.PI/4;
 sprite.position.y=height/2+.12;
 sprite.renderOrder=4;
 sprite.userData.ember2D=true;
 return sprite;
}
export function availableBuildingSprites(){return [...cache.keys()]}
