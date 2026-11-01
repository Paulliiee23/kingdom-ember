import * as THREE from 'three';

// Original, runtime-generated 3D castle mesh: curved towers, sloped roof planes,
// recessed archway, stone courses and glazed windows. No external image assets.
export function createRoyalCastleAsset(level=1){
 const root=new THREE.Group();
 const stone=new THREE.MeshStandardMaterial({color:0xd6d0c1,roughness:.91});
 const darkStone=new THREE.MeshStandardMaterial({color:0x8d8a86,roughness:.96});
 const roof=new THREE.MeshStandardMaterial({color:0x28578b,roughness:.52,metalness:.12,side:THREE.DoubleSide});
 const gold=new THREE.MeshStandardMaterial({color:0xdcb76c,metalness:.62,roughness:.34});
 const glass=new THREE.MeshStandardMaterial({color:0x79c4e6,emissive:0x164a73,emissiveIntensity:.5,roughness:.19});
 const door=new THREE.MeshStandardMaterial({color:0x50362b,roughness:.82});
 const add=(geometry,material,x=0,y=0,z=0)=>{const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);return mesh};
 const box=(w,h,d,m,x,y,z)=>add(new THREE.BoxGeometry(w,h,d),m,x,y,z);
 const tower=(x,z,height,radius)=>{
  const profile=[[0,0],[radius*.91,0],[radius,.16],[radius,height-.2],[radius*1.13,height-.2],[radius*1.13,height],[0,height]].map(([r,y])=>new THREE.Vector2(r,y));
  add(new THREE.LatheGeometry(profile,12),stone,x,.24,z);
  add(new THREE.CylinderGeometry(radius*1.25,radius*1.25,.12,12),gold,x,height+.27,z);
  add(new THREE.ConeGeometry(radius*1.43,1.1,12),roof,x,height+.87,z);
  add(new THREE.SphereGeometry(.095,8,6),gold,x,height+1.49,z);
  for(let i=0;i<4;i++){
   const a=i*Math.PI/2;
   const w=add(new THREE.PlaneGeometry(.16,.32),glass,x+Math.sin(a)*(radius+.018),height*.58,z+Math.cos(a)*(radius+.018));
   w.rotation.y=a;
  }
 };
 // Main keep: articulated massing with actual sloped mesh roof, not a roof cube.
 box(1.45,2.2,1.22,stone,0,1.38,-.22);
 box(1.62,.12,1.38,gold,0,2.52,-.22);
 const roofShape=new THREE.BufferGeometry();
 const vertices=new Float32Array([
  -1,2.57,-1.02, 1,2.57,-1.02, 0,3.5,-1.02,
  1,2.57,.58, -1,2.57,.58, 0,3.5,.58,
  -1,2.57,.58,-1,2.57,-1.02,0,3.5,-1.02,
  -1,2.57,.58,0,3.5,-1.02,0,3.5,.58,
  1,2.57,-1.02,1,2.57,.58,0,3.5,.58,
  1,2.57,-1.02,0,3.5,.58,0,3.5,-1.02
 ]);
 roofShape.setAttribute('position',new THREE.BufferAttribute(vertices,3));roofShape.computeVertexNormals();add(roofShape,roof);
 // Four distinct cylindrical turrets.
 for(const x of [-.96,.96])for(const z of [-.96,.96])tower(x,z,1.9+(level>=17?.3:0),.36);
 // Stone courses are physically raised strips, not texture-only blocks.
 for(let y=.48;y<2.38;y+=.34){
  box(1.48,.045,1.27,darkStone,0,y,-.22);
 }
 // Arched doorway: extruded curved silhouette with timber face.
 const shape=new THREE.Shape();shape.moveTo(-.34,0);shape.lineTo(.34,0);shape.lineTo(.34,.64);
 shape.absarc(0,.64,.34,0,Math.PI,false);shape.lineTo(-.34,0);
 const doorway=add(new THREE.ExtrudeGeometry(shape,{depth:.08,bevelEnabled:true,bevelSize:.025,bevelThickness:.02,bevelSegments:2,curveSegments:12}),door,0,.3,.63);
 doorway.rotation.y=0;
 for(const x of [-.45,.45])box(.11,1.02,.13,gold,x,.83,.67);
 for(const x of [-.35,.35])for(const y of [1.55,2.05]){
  const window=add(new THREE.PlaneGeometry(.19,.33),glass,x,y,.397);
  window.material.side=THREE.DoubleSide;
  box(.24,.04,.07,gold,x,y+.19,.42);
 }
 // Stone foundation and battlements.
 box(2.4,.23,2.4,darkStone,0,.13,0);
 for(const side of [-1,1])for(let i=-3;i<=3;i++){
  box(.22,.23,.26,stone,i*.34,1.56,side*1.15);
  box(.26,.23,.22,stone,side*1.15,1.56,i*.34);
 }

 // v0.9.5 architectural detailing: perimeter masonry, reinforced gatehouse,
 // carved buttresses, roof ribs, heraldry and layered tower silhouettes.
 const mortar=new THREE.MeshStandardMaterial({color:0xb2ab9e,roughness:1});
 const slate=new THREE.MeshStandardMaterial({color:0x183b65,roughness:.77,metalness:.03});
 const brass=new THREE.MeshStandardMaterial({color:0xa98239,roughness:.48,metalness:.53});
 const banner=new THREE.MeshStandardMaterial({color:0x5b278d,roughness:.88,side:THREE.DoubleSide});
 const iron=new THREE.MeshStandardMaterial({color:0x343b46,roughness:.6,metalness:.65});
 const addWall=(x,z,w,d)=>{
  box(w,.82,d,stone,x,.58,z);
  box(w+.06,.11,d+.06,darkStone,x,1.03,z);
  for(let i=-Math.floor(w/.28)/2;i<=Math.floor(w/.28)/2;i++)box(.13,.17,d+.08,stone,x+i*.28,1.17,z);
 };
 // Low curtain walls form a courtyard around the keep.
 addWall(0,-1.16,1.65,.18);
 for(const side of [-1,1]){
  addWall(side*1.17,0,.18,1.64);
  addWall(side*.79,1.15,.64,.19);
 }
 // Gatehouse flanks the timber entrance without blocking the original door.
 for(const side of [-1,1]){
  box(.31,1.28,.4,darkStone,side*.53,.86,.98);
  box(.37,.13,.45,stone,side*.53,1.55,.98);
  for(let y=.42;y<1.42;y+=.24)box(.33,.025,.41,mortar,side*.53,y,.98);
  for(let j=0;j<3;j++)box(.22,.15,.18,stone,side*.53,1.72,.82+j*.15);
 }
 // Actual wooden gate planks and iron straps.
 for(let x=-.26;x<=.26;x+=.13)box(.018,.74,.04,mortar,x,.69,.73);
 for(const y of [.42,.9])box(.62,.045,.06,iron,0,y,.76);
 for(const x of [-.18,.18])add(new THREE.SphereGeometry(.035,6,4),brass,x,.67,.8);
 // Stone quoins on each corner of the keep.
 for(const x of [-.7,.7])for(const z of [-.79,.35])for(let y=.4;y<2.45;y+=.29){
  box(.17,.13,.18,y%2>.8?mortar:darkStone,x,y,z);
 }
 // Tower rings, machicolations, slit windows and roof tile ridges.
 for(const x of [-.96,.96])for(const z of [-.96,.96]){
  for(const y of [.5,1.06,1.53])add(new THREE.TorusGeometry(.375,.025,5,16),darkStone,x,y,z).rotation.x=Math.PI/2;
  for(let i=0;i<8;i++){
   const a=i*Math.PI/4;
   const px=x+Math.sin(a)*.39,pz=z+Math.cos(a)*.39;
   const slit=box(.055,.21,.025,iron,px,1.25,pz);slit.rotation.y=a;
   const merlon=box(.16,.17,.17,stone,x+Math.sin(a)*.43,2.18,z+Math.cos(a)*.43);merlon.rotation.y=a;
  }
  for(let i=0;i<8;i++){
   const a=i*Math.PI/4;
   const rib=add(new THREE.CylinderGeometry(.012,.012,.87,5),slate,x+Math.sin(a)*.24,2.57,z+Math.cos(a)*.24);
   rib.rotation.z=Math.sin(a)*.43;rib.rotation.x=-Math.cos(a)*.43;
  }
 }
 // Central keep ornamentation, pilasters and decorative roof bands.
 for(const x of [-.62,.62]){
  box(.13,2.0,.17,darkStone,x,1.5,.42);
  box(.19,.13,.21,brass,x,2.48,.42);
 }
 for(let i=0;i<7;i++)box(.15,.12,.16,stone,(i-3)*.235,2.61,.43);
 box(1.9,.055,.09,brass,0,2.6,.62);
 // Hanging heraldic banners on the front facade.
 for(const x of [-.48,.48]){
  const cloth=add(new THREE.PlaneGeometry(.24,.65),banner,x,1.72,.53);
  cloth.material.side=THREE.DoubleSide;
  box(.3,.04,.12,brass,x,2.09,.54);
  add(new THREE.SphereGeometry(.045,8,6),gold,x,2.09,.62);
 }
 // Entrance lanterns, flagpole and golden finial.
 for(const x of [-.57,.57]){
  box(.07,.25,.07,iron,x,.92,1.23);
  add(new THREE.SphereGeometry(.085,8,6),new THREE.MeshStandardMaterial({color:0xffca78,emissive:0xff912e,emissiveIntensity:1.4}),x,1.08,1.23);
 }
 box(.035,.66,.035,iron,0,4.0,-.22);
 const flag=add(new THREE.PlaneGeometry(.42,.24),banner,.23,4.21,-.22);flag.material.side=THREE.DoubleSide;
 // Higher levels gain secondary decorative roof spires.
 if(level>=10)for(const x of [-.58,.58]){
  add(new THREE.ConeGeometry(.15,.38,8),slate,x,3.05,-.22);
  add(new THREE.SphereGeometry(.055,8,6),gold,x,3.27,-.22);
 }

 root.userData.assetType='royal-castle-mesh-v095-detailed';
 root.userData.level=level;
 return root;
}
