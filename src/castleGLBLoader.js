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
// Distinct visual upgrade tiers, applied to cloned meshes (never the shared source).
function castleTier(level){
 const lv=Math.max(1,Math.floor(Number(level)||1));
 if(lv>=25)return {name:'Imperial',roof:0x612a86,stone:0xf0e5d4,metal:0xf1c35e,scale:1.15,spires:4};
 if(lv>=20)return {name:'Royal',roof:0x742c72,stone:0xe3d7c8,metal:0xe6b85b,scale:1.12,spires:4};
 if(lv>=15)return {name:'Citadel',roof:0x8c4532,stone:0xd3c4b2,metal:0xd7a45d,scale:1.08,spires:4};
 if(lv>=10)return {name:'Fortress',roof:0x315b79,stone:0xc5c2b8,metal:0xc6a15a,scale:1.05,spires:2};
 if(lv>=5)return {name:'Stronghold',roof:0x345c75,stone:0xbdb8ac,metal:0xa58c62,scale:1.02,spires:2};
 return {name:'Keep',roof:0x28578b,stone:0xd6d0c1,metal:0xb89c65,scale:1,spires:0};
}
export function createCastleGLBInstance(level=1){
 if(!source)return null;
 const castle=source.clone(true);
 const tier=castleTier(level);
 // Clone materials before modifying them: upgrades must not recolour other castles.
 castle.traverse(obj=>{
  if(!obj.isMesh)return;
  const recolour=(material)=>{
   const m=material.clone();
   if(!m.color)return m;
   const name=(obj.name+' '+(m.name||'')).toLowerCase();
   if(/roof|tile|spire|cone|turret|blue/.test(name))m.color.setHex(tier.roof);
   else if(/gold|trim|ornament|metal|accent/.test(name))m.color.setHex(tier.metal);
   else if(/stone|wall|brick|plaster|masonry/.test(name))m.color.setHex(tier.stone);
   else if(level>=15&&m.color.b>m.color.r*1.18&&m.color.b>m.color.g*1.08)m.color.setHex(tier.roof);
   return m;
  };
  obj.material=Array.isArray(obj.material)?obj.material.map(recolour):recolour(obj.material);
 });
 // Auto-fit to the existing 2.4 x 2.4 plot while retaining original proportions.
 const bounds=new THREE.Box3().setFromObject(castle);
 const size=bounds.getSize(new THREE.Vector3());
 if(!size.x||!size.y||!size.z)return null;
 const scale=Math.min(2.35/size.x,2.35/size.z,4.1/size.y);
 castle.scale.multiplyScalar(scale*tier.scale);
 const fitted=new THREE.Box3().setFromObject(castle);
 const center=fitted.getCenter(new THREE.Vector3());
 castle.position.set(-center.x,.25-fitted.min.y,-center.z);
 castle.userData.assetType='royal-castle-glb-v095';
 // Upgrade appearance comes from the loaded mesh materials and size; no runtime castle geometry.\n castle.userData.castleTier=tier.name;
 castle.userData.level=level;
 return castle;
}
export function royalCastleGLBReady(){return Boolean(source);}
