import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader=new GLTFLoader();
const cache=new Map();
const files={tycoon:'/models/tycoon.glb',labyrinth:'/models/labyrinth.glb'};
export function loadActivityModel(type){
 const url=files[type];
 if(!url)return Promise.reject(new Error('Unknown activity model '+type));
 if(!cache.has(type))cache.set(type,loader.loadAsync(url).then(g=>g.scene).catch(e=>{cache.delete(type);throw e;}));
 return cache.get(type).then(source=>{
  const model=source.clone(true);
  model.traverse(obj=>{
   if(!obj.isMesh)return;
   obj.castShadow=true;obj.receiveShadow=true;
   obj.material=Array.isArray(obj.material)?obj.material.map(m=>m.clone()):obj.material.clone();
  });
  const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3());
  if(!size.x||!size.y||!size.z)throw new Error('Empty GLB: '+url);
  model.scale.multiplyScalar(Math.min(2.25/size.x,2.25/size.z,3.4/size.y));
  const fitted=new THREE.Box3().setFromObject(model),center=fitted.getCenter(new THREE.Vector3());
  model.position.set(-center.x,.22-fitted.min.y,-center.z);
  model.userData.activityAsset=type;
  return model;
 });
}
