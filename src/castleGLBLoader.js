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
 if(lv>=35)return {name:'Amethyst Citadel',roof:0x612a86,stone:0xf0e5d4,metal:0xf1c35e,scale:1.15,spires:4};
 if(lv>=29)return {name:'Amethyst Ascent',roof:0x612a86,stone:0xf0e5d4,metal:0xf1c35e,scale:1.13,spires:4};
 if(lv>=22)return {name:'Royal Citadel',roof:0x69428c,stone:0xe3d7c8,metal:0xe6b85b,scale:1.11,spires:4};
 if(lv>=15)return {name:'Red Stronghold',roof:0x742c72,stone:0xe3d7c8,metal:0xe6b85b,scale:1.12,spires:4};
 if(lv>=8)return {name:'Timber Bastion',roof:0x8c4532,stone:0xd3c4b2,metal:0xd7a45d,scale:1.08,spires:4};
 return {name:'Frontier Fort',roof:0x93602d,stone:0xbcb0a0,metal:0xb89c65,scale:1,spires:0};
}
export function createCastleGLBInstance(level=1){
 if(!source)return null;
 const castle=source.clone(true);
 const tier=castleTier(level);
 // Clone materials before modifying them: upgrades must not recolour other castles.
 castle.traverse(obj=>{
  if(!obj.isMesh)return;
  const part=obj.name.toLowerCase();
  if((part.includes('tier35_')&&level<35)||(part.includes('tier29_')&&level<29)||(part.includes('tier22_')&&level<22)||(part.includes('tier15_')&&level<15)||(part.includes('tier8_')&&level<8)||(part.includes('tier25_')&&level<25)||(part.includes('tier17_')&&level<17)||(part.includes('tier9_')&&level<9)){obj.visible=false;return}

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

// Level-specific castle assets. Keep the original Royal Castle model and procedural
// geometry as fallbacks until the new meshes have been verified in the browser.
const tierFiles=['castle-1-8.glb','castle-9-16.glb','castle-17-24.glb','castle-25-30.glb'];
const tierCache=new Map();
function tierFile(level){
 const lv=Math.max(1,Number(level)||1);
 return tierFiles[lv>=25?3:lv>=17?2:lv>=9?1:0];
}
export async function loadTierCastle(level){
 const file=tierFile(level);
 if(!tierCache.has(file)){
  const request=loader.loadAsync('/models/'+file).then(gltf=>gltf.scene).catch(error=>{
   tierCache.delete(file);
   throw error;
  });
  tierCache.set(file,request);
 }
 const original=await tierCache.get(file);
 const model=original.clone(true);
 model.traverse(obj=>{if(obj.isMesh){obj.castShadow=true;obj.receiveShadow=true;}});
 const bounds=new THREE.Box3().setFromObject(model);
 const size=bounds.getSize(new THREE.Vector3());
 if(!size.x||!size.y||!size.z)throw new Error('Empty castle model: '+file);
 const scale=Math.min(3.4/size.x,3.4/size.z,5.5/size.y);
 model.scale.multiplyScalar(scale);
 const fitted=new THREE.Box3().setFromObject(model);
 const center=fitted.getCenter(new THREE.Vector3());
 model.position.set(-center.x,.02-fitted.min.y,-center.z);
 model.userData.assetType=file;
 return model;
}
export function royalCastleGLBReady(){return Boolean(source);}
