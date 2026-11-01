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
 root.userData.assetType='royal-castle-mesh-v1';
 root.userData.level=level;
 return root;
}
