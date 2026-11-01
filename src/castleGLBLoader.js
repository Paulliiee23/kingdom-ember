import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// A single shared asset is cloned for every castle instance.
// The source GLB lives at public/models/Royal_Castle_v095.glb.
const url='/models/Royal_Castle_v095.glb';
let source=null, pending=null, failed=false;
const loader=new GLTFLoader();
export function preloadRoyalCastle(){
 if(source)return Promise.resolve(source);
 if(failed)return Promise.reject(new Error('Castle GLB unavailable'));
 if(!pending)pending=loader.loadAsync(url).then(gltf=>{
   source=gltf.scene;
   source.traverse(obj=>{if(obj.isMesh){obj.castShadow=true;obj.receiveShadow=true;}});
   return source;
 }).catch(error=>{failed=true;console.warn('Castle GLB could not load; using procedural fallback:',error);throw error;});
 return pending;
}
export function createCastleGLBInstance(level=1){
 if(!source)return null;
 const castle=source.clone(true);
 // Auto-fit to the existing 2.4 x 2.4 plot while retaining original proportions.
 const bounds=new THREE.Box3().setFromObject(castle);
 const size=bounds.getSize(new THREE.Vector3());
 if(!size.x||!size.y||!size.z)return null;
 const scale=Math.min(2.35/size.x,2.35/size.z,4.1/size.y);
 castle.scale.multiplyScalar(scale);
 const fitted=new THREE.Box3().setFromObject(castle);
 const center=fitted.getCenter(new THREE.Vector3());
 castle.position.set(-center.x,.25-fitted.min.y,-center.z);
 castle.userData.assetType='royal-castle-glb-v095';
 castle.userData.level=level;
 return castle;
}
export function royalCastleGLBReady(){return Boolean(source);}
