import * as THREE from 'three';

// Original Kingdom Ember stage art. Gameplay rewards remain controlled by progressiveGames.js.
const instances=new WeakMap();
export function mountFantasyStages(root=document){
 for(const host of root.querySelectorAll('[data-ember-stage]')){
  if(instances.has(host))continue;
  const type=host.dataset.emberStage;
  const scene=new THREE.Scene();
  scene.background=new THREE.Color(type==='tycoon'?0x172e66:0x302039);
  scene.fog=new THREE.FogExp2(type==='tycoon'?0x172e66:0x302039,.025);
  const camera=new THREE.PerspectiveCamera(42,2,.1,160);
  camera.position.set(12,13,19);camera.lookAt(0,1,0);
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  host.appendChild(renderer.domElement);
  host.title='Drag to rotate the scene. Pinch with two fingers to zoom.';
  const ambient=new THREE.HemisphereLight(0xc4d7ff,0x49344c,2.1);scene.add(ambient);
  const key=new THREE.DirectionalLight(type==='tycoon'?0x87cfff:0xffb8a1,3.3);
  key.position.set(-5,12,8);scene.add(key);
  const gold=new THREE.MeshStandardMaterial({color:0xe6b457,metalness:.55,roughness:.3});
  const stone=new THREE.MeshStandardMaterial({color:type==='tycoon'?0x527ed0:0x857486,roughness:.85});
  const dark=new THREE.MeshStandardMaterial({color:type==='tycoon'?0x244c9c:0x51435c,roughness:.8});
  const crystal=new THREE.MeshStandardMaterial({color:type==='tycoon'?0xff4edb:0x5ff4e7,emissive:type==='tycoon'?0x9b1688:0x169eaa,emissiveIntensity:1.4,metalness:.3,roughness:.18});
  function mesh(geo,mat,x,y,z){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);scene.add(m);return m}
  function block(x,y,z,w,h,d,mat=stone){return mesh(new THREE.BoxGeometry(w,h,d),mat,x,y,z)}
  function pillar(x,z,h){mesh(new THREE.CylinderGeometry(.38,.46,h,8),stone,x,h/2,z);block(x,h+.13,z,1,.26,1,gold)}
  const animated=[];
  const route=[];
  const fx=[];
  function ring(x,y,z,r,material){
    const m=mesh(new THREE.TorusGeometry(r,.06,8,28),material,x,y,z);
    m.rotation.x=-Math.PI/2;return m;
  }
  function sparkle(x,y,z){
    const m=mesh(new THREE.OctahedronGeometry(.13),crystal,x,y,z);
    fx.push({m,y,phase:Math.random()*6.28});
  }
  if(type==='tycoon'){
   for(let i=0;i<12;i++){
    const a=i*.49;
    const x=-8+i*1.5,z=Math.sin(a)*2.7;
    block(x,-.6,z,3.1,1.2,3.1,i%3===0?dark:stone);
    block(x,.08,z,2.8,.18,2.8,stone);
    if(i>0){const prevX=-8+(i-1)*1.5;block((prevX+x)/2,.15,(Math.sin((i-1)*.49)*2.7+z)/2,1.7,.12,.55,gold)}
    route.push(new THREE.Vector3(x,.2,z));
    ring(x,.2,z,.7,gold);
    sparkle(x+.5,1.4,z);
    const p=mesh(new THREE.OctahedronGeometry(.44),crystal,x,1.2,z);animated.push([p,i]);
    for(const side of [-1,1])mesh(new THREE.ConeGeometry(.2,.72,6),stone,x+side*1.1,.54,z-1);
   }
   for(const x of [-7,7])for(const z of [-4,4])pillar(x,z,2);
   const pawn=new THREE.Group();scene.add(pawn);
   const robe=new THREE.Mesh(new THREE.ConeGeometry(.35,.9,9),new THREE.MeshStandardMaterial({color:0xc753bc}));
   robe.position.y=.5;pawn.add(robe);
   const face=new THREE.Mesh(new THREE.SphereGeometry(.24,12,10),gold);
   face.position.y=1.06;pawn.add(face);
   pawn.position.copy(route[0]);animated.push([pawn,0]);
  }else{
   block(0,-.6,0,17,1,13,dark);
   block(0,-.04,0,15,.2,11,stone);
   for(const x of [-7,7])for(const z of [-5,5])pillar(x,z,5.8);
   for(const x of [-4,0,4]){pillar(x,-5,4);pillar(x,5,4)}
   for(const z of [-3,0,3]){pillar(-7,z,4);pillar(7,z,4)}
   for(let i=0;i<8;i++){
    const a=i*Math.PI/4;
    const p=mesh(new THREE.OctahedronGeometry(.4),crystal,Math.cos(a)*3,1.1,Math.sin(a)*3);
    animated.push([p,i]);
   }
   // Boss body, horns, wings, eyes, and tail: original low-poly stage placeholder.
   const boss=new THREE.Group();scene.add(boss);boss.position.set(0,.7,-2);
   const bossMat=new THREE.MeshStandardMaterial({color:0x4b5969,metalness:.35,roughness:.48});
   const body=new THREE.Mesh(new THREE.IcosahedronGeometry(1.55,1),bossMat);body.scale.set(1.3,.8,1);boss.add(body);
   const head=new THREE.Mesh(new THREE.IcosahedronGeometry(.82,1),bossMat);head.position.set(0,.7,1.2);boss.add(head);
   for(const s of [-1,1]){
    const horn=new THREE.Mesh(new THREE.ConeGeometry(.26,1.2,6),gold);horn.position.set(s*.6,1.6,1.2);boss.add(horn);
    const wing=new THREE.Mesh(new THREE.ConeGeometry(1.7,3.6,3),dark);
    wing.rotation.z=s*.9;wing.position.set(s*1.9,.6,-.3);boss.add(wing);
    const eye=new THREE.Mesh(new THREE.SphereGeometry(.13,8,8),crystal);eye.position.set(s*.36,.8,1.83);boss.add(eye);
   }
   animated.push([boss,0]);
   for(let i=0;i<3;i++){
     const hero=new THREE.Group();scene.add(hero);
     const coat=new THREE.Mesh(new THREE.CylinderGeometry(.24,.4,.95,8),new THREE.MeshStandardMaterial({color:[0x5778c4,0xba5684,0x5caa88][i]}));
     coat.position.y=.5;hero.add(coat);
     const face=new THREE.Mesh(new THREE.SphereGeometry(.25,10,8),gold);
     face.position.y=1.12;hero.add(face);
     const weapon=new THREE.Mesh(new THREE.BoxGeometry(.07,1.25,.07),gold);
     weapon.position.set(.35,.9,-.12);hero.add(weapon);
     hero.position.set((i-1)*1.5,.15,3.4+Math.abs(i-1)*.4);
     animated.push([hero,i+2]);
   }
   for(const x of [-5.5,5.5])for(const z of [-3.8,3.8]){ring(x,.15,z,.75,gold);sparkle(x,1.3,z)}
  }
  // Controlled orbit: drag to rotate, pinch to zoom. The scene cannot fly away.
  let orbitYaw=.5,orbitPitch=.48,orbitRadius=type==='tycoon'?29:23;
  const orbitTarget=new THREE.Vector3(0,1,0);
  const pointers=new Map();
  let previousPinch=null;
  const setCamera=()=>{
    const horizontal=Math.cos(orbitPitch)*orbitRadius;
    camera.position.set(orbitTarget.x+Math.sin(orbitYaw)*horizontal,
      orbitTarget.y+Math.sin(orbitPitch)*orbitRadius,
      orbitTarget.z+Math.cos(orbitYaw)*horizontal);
    camera.lookAt(orbitTarget);
  };
  setCamera();
  const pointerDown=e=>{host.setPointerCapture?.(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});previousPinch=null};
  const pointerMove=e=>{
    if(!pointers.has(e.pointerId))return;
    const prev=pointers.get(e.pointerId);
    const dx=THREE.MathUtils.clamp(e.clientX-prev.x,-30,30);
    const dy=THREE.MathUtils.clamp(e.clientY-prev.y,-30,30);
    pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pointers.size===1){
      orbitYaw-=dx*.0035;
      orbitPitch=THREE.MathUtils.clamp(orbitPitch+dy*.0025,.25,.95);
    }else if(pointers.size===2){
      const a=[...pointers.values()];
      const distance=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);
      if(previousPinch!==null)orbitRadius=THREE.MathUtils.clamp(orbitRadius+(previousPinch-distance)*.035,15,39);
      previousPinch=distance;
    }
    setCamera();
  };
  const pointerUp=e=>{pointers.delete(e.pointerId);previousPinch=null};
  host.addEventListener('pointerdown',pointerDown);
  host.addEventListener('pointermove',pointerMove);
  host.addEventListener('pointerup',pointerUp);
  host.addEventListener('pointercancel',pointerUp);
  host.addEventListener('lostpointercapture',pointerUp);
  let active=true,last=0;
  const observer=new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight;if(w&&h){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}});observer.observe(host);
  function frame(t){
   if(!active)return;
   if(!host.isConnected){
    active=false;observer.disconnect();
    host.removeEventListener('pointerdown',pointerDown);
    host.removeEventListener('pointermove',pointerMove);
    host.removeEventListener('pointerup',pointerUp);
    host.removeEventListener('pointercancel',pointerUp);
    host.removeEventListener('lostpointercapture',pointerUp);
    scene.traverse(o=>{if(o.isMesh){o.geometry?.dispose();for(const m of (Array.isArray(o.material)?o.material:[o.material]))m?.dispose()}});
    renderer.dispose();instances.delete(host);return
   }
   if(t-last>30){
    for(const [m,i] of animated){
      if(m.type==='Group'&&type==='tycoon'&&route.length>1){
        const u=(t*.00012)%(route.length-1),j=Math.floor(u);
        m.position.lerpVectors(route[j],route[j+1],u-j);
        m.position.y=.2+Math.sin(t*.004)*.08;
      }else if(m.type==='Group'){
        m.position.y=(i===0?.7:.15)+Math.sin(t*.0015+i)*.08;
      }else{
        m.rotation.y=t*.0003+i;
        m.position.y=1.1+Math.sin(t*.0015+i)*.12;
      }
    }
    for(const s of fx){s.m.rotation.y=t*.0009;s.m.position.y=s.y+Math.sin(t*.002+s.phase)*.22}
    renderer.render(scene,camera);last=t;
   }
   requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);instances.set(host,{renderer});
 }
}
export function observeFantasyStages(){
 const mo=new MutationObserver(()=>mountFantasyStages());
 mo.observe(document.getElementById('app')||document.body,{childList:true,subtree:true});
 mountFantasyStages();
}
