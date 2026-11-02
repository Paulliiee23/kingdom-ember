import * as THREE from 'three';

// Deterministic, offline 2.5D architectural illustrations.
// One texture per building/level combination; no downloads, random placement or save changes.
const cache = new Map();
const palettes = {
 castle:['#e4d7c5','#ad9b8d','#75446f'],
 farm:['#e8d6aa','#b59b73','#9a653d'],
 lumber:['#c8a47a','#79573d','#6c4635'],
 quarry:['#d5d2c7','#8e8b83','#63738c'],
 mine:['#bcb8ad','#77736d','#5c547a'],
 barracks:['#d7c5b6','#9c8c80','#874453'],
 academy:['#ded3c6','#a69c96','#644f9b']
};
const classFor = type => /farm|lumber|quarry|mine/.test(type)?'industry':/barracks|infirmary|workshop/.test(type)?'military':/academy|institute|heroMonument|laby/.test(type)?'scholar':/bank|vault|gemBank/.test(type)?'treasury':'civic';
const typeRoof = {industry:'#806448',military:'#7c384c',scholar:'#4c598c',treasury:'#84643c',civic:'#536f82'};
function seeded(seed){let n=seed>>>0;return ()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;}}
function hashType(type){let h=2166136261;for(const c of type){h=Math.imul(h^c.charCodeAt(0),16777619);}return h>>>0;}
function line(ctx,x1,y1,x2,y2,color,width=2){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();}
const stageColor = level => level>=29?'#713ba0':level>=22?'#674d9b':level>=15?'#a33d48':level>=8?'#78533d':'#946a42';
function polygon(ctx,points,color,stroke='#594e50'){
 ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);
 for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);
 ctx.closePath();ctx.fillStyle=color;ctx.fill();
 ctx.strokeStyle=stroke;ctx.lineWidth=3;ctx.stroke();
}
function block(ctx,x,y,w,h,front,side,top){
 polygon(ctx,[[x,y],[x+w,y],[x+w,y+h],[x,y+h]],front);
 const face=ctx.createLinearGradient(x,y,x+w,y+h);face.addColorStop(0,'rgba(255,250,226,.24)');face.addColorStop(1,'rgba(52,40,49,.16)');ctx.fillStyle=face;ctx.fillRect(x+2,y+2,w-4,h-4);
 for(let row=1;row<h/19;row++){line(ctx,x+3,y+row*19,x+w-3,y+row*19,'rgba(76,58,54,.14)',1);}
 for(let row=0;row<h/19;row++)for(let col=1;col<4;col++){const xx=x+(col+(row%2)*.5)*w/4;if(xx<x+w-4)line(ctx,xx,y+row*19,xx,y+(row+1)*19,'rgba(88,66,56,.10)',1);}
 polygon(ctx,[[x+w,y],[x+w+30,y-21],[x+w+30,y+h-21],[x+w,y+h]],side);
 polygon(ctx,[[x,y],[x+30,y-21],[x+w+30,y-21],[x+w,y]],top);
}
function roof(ctx,x,y,w,h,color){
 polygon(ctx,[[x-15,y],[x+w+16,y],[x+w/2+18,y-h]],color);
 ctx.save();ctx.beginPath();ctx.moveTo(x-15,y);ctx.lineTo(x+w+16,y);ctx.lineTo(x+w/2+18,y-h);ctx.closePath();ctx.clip();
 for(let row=0;row<9;row++){const yy=y-h+row*16;line(ctx,x-20,yy,x+w+30,yy,'rgba(247,225,190,.24)',2);for(let col=0;col<12;col++){const xx=x-15+col*23+(row%2)*11;line(ctx,xx,yy,xx+7,yy+12,'rgba(32,26,49,.24)',1);}}ctx.restore();
 polygon(ctx,[[x+w+16,y],[x+w+38,y-18],[x+w/2+18,y-h]],'#44365a');
 polygon(ctx,[[x-15,y],[x+8,y-18],[x+w/2+18,y-h]],'#8d7194');
}
function windowPane(ctx,x,y,glow){
 ctx.fillStyle='#b99753';ctx.fillRect(x-5,y-5,35,51);
 ctx.fillStyle=glow;ctx.fillRect(x,y,25,41);
 ctx.fillStyle='#e9c878';ctx.fillRect(x+11,y,3,41);ctx.fillRect(x,y+19,25,3);
}
function spire(ctx,x,y,roofColor,crystal=false){
 block(ctx,x-20,y,40,90,'#c8b8ac','#968b8e','#f4e5cf');
 roof(ctx,x-25,y,50,65,roofColor);
 if(crystal){polygon(ctx,[[x,y-79],[x+13,y-105],[x+24,y-79],[x+12,y-58]],'#b67cff','#f1d3ff');}
}
function drawArt(ctx,type,level){
 const castle=type==='castle',lv=Math.max(1,Math.min(35,Math.floor(Number(level)||1)));
 const family=classFor(type);
 const pal=palettes[type]||[family==='treasury'?'#e6d8b5':'#dcd0c0','#a69a8e',typeRoof[family]];
 const roofColor=castle?stageColor(lv):pal[2];
 const ornament=lv>=8,royal=lv>=22,crystal=lv>=29;
 ctx.clearRect(0,0,512,640);
 ctx.lineJoin='round';ctx.lineCap='round';
 const rand=seeded(hashType(type)+lv*7919);
 // Warm ambient occlusion under the architecture; canvas remains transparent.
 const halo=ctx.createRadialGradient(253,486,18,253,486,216);halo.addColorStop(0,'rgba(39,26,37,.30)');halo.addColorStop(1,'rgba(39,26,37,0)');ctx.fillStyle=halo;ctx.fillRect(36,385,443,194);
 // A grounded isometric plinth with enough negative space for the shadow.
 polygon(ctx,[[54,505],[249,555],[462,489],[262,440]],'#847b73','#6b645e');
 polygon(ctx,[[54,505],[249,555],[249,578],[54,526]],'#6d6661');
 polygon(ctx,[[249,555],[462,489],[462,510],[249,578]],'#554e50');
 // Fine stone grain is deterministic, avoiding flicker between redraws.
 for(let i=0;i<280;i++){const x=76+rand()*370,y=452+rand()*99;ctx.fillStyle=rand()>.5?'rgba(240,229,205,.13)':'rgba(38,31,37,.12)';ctx.fillRect(x,y,1+rand()*3,1+rand()*2);}
 ctx.fillStyle='rgba(35,27,31,.22)';ctx.beginPath();ctx.ellipse(259,490,156,36,-.14,0,Math.PI*2);ctx.fill();
 // Behind the building, add turrets or type-specific tall structures.
 if(castle){
  spire(ctx,127,343,roofColor,crystal);
  spire(ctx,359,328,roofColor,crystal);
 }else if(type==='farm'){
  block(ctx,350,359,50,114,pal[0],pal[1],pal[0]);roof(ctx,345,355,55,54,roofColor);
 }else if(type==='mine'){
  block(ctx,359,327,38,144,pal[1],pal[1],pal[0]);
 }else if(type==='lumber'){
  for(let i=0;i<4;i++){ctx.fillStyle='#775034';ctx.fillRect(342+i*12,420-i*8,13,68);}
 }else if(type==='academy'||family==='scholar'){
  spire(ctx,362,342,roofColor,lv>=20);
 }else if(type==='barracks'||family==='military'){
  spire(ctx,362,355,roofColor,false);
 }
 const width=castle?225:202, left=castle?128:141, top=castle?300:325, height=castle?180:152;
 block(ctx,left,top,width,height,pal[0],pal[1],'#f4e5d2');
 // Layered main roof silhouette, angled consistently with the scene.
 roof(ctx,left-6,top+4,width+9,castle?107:85,roofColor);
 if(castle){
  block(ctx,202,230,100,108,pal[0],pal[1],pal[0]);
  roof(ctx,191,232,117,94,roofColor);
  if(ornament){spire(ctx,120,402,roofColor,crystal);spire(ctx,375,395,roofColor,crystal);}
  if(royal){roof(ctx,203,220,105,75,roofColor);windowPane(ctx,238,271,'#a9c9fa');}
 }else if(type==='quarry'){
  for(let i=0;i<5;i++)block(ctx,83+i*49,465-(i%2)*10,38,30,'#c6c2b9','#85817d','#e2ded6');
 }else if(type==='farm'){
  for(let i=0;i<6;i++){ctx.strokeStyle='#d5b35b';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(85+i*22,485);ctx.lineTo(72+i*22,438);ctx.stroke();}
 }else if(type==='lumber'){
  for(let i=0;i<4;i++)block(ctx,89+i*36,466,28,23,'#9b704a','#5c3d2e','#bb8b5b');
 }else if(type==='barracks'||family==='military'){
  polygon(ctx,[[104,358],[133,367],[133,433],[104,424]],'#a34448');
 }else if(family==='treasury'){
  for(const x of [105,136,167]){ctx.fillStyle='#cba95e';ctx.fillRect(x,455,24,29);ctx.fillStyle='#f0d487';ctx.fillRect(x+5,448,14,7);}
 }else if(family==='scholar'){
  for(const x of [96,131]){ctx.fillStyle='#d3bb80';ctx.fillRect(x,438,22,50);ctx.fillStyle='#674f8c';ctx.fillRect(x+4,443,14,35);}
 }
 // Repeated windows and a legible central door.
 for(const x of [left+36,left+width-61])windowPane(ctx,x,top+57,lv>=15?'#f5d79a':'#89b6c9');
 ctx.fillStyle='#4a3440';ctx.fillRect(left+width/2-19,top+height-68,43,68);
 ctx.strokeStyle='#c9a361';ctx.lineWidth=5;ctx.strokeRect(left+width/2-19,top+height-68,43,68);
 // Painted timber beams and carved masonry lintels.
 for(const x of [left+9,left+width-14]){line(ctx,x,top+12,x,top+height-11,'rgba(84,55,44,.35)',7);line(ctx,x+3,top+12,x+3,top+height-11,'rgba(245,211,156,.35)',2);}
 if(lv>=5){
  ctx.fillStyle='#d5b66d';ctx.fillRect(left-5,top+height-13,width+16,11);
  ctx.fillRect(left-4,top+7,width+13,8);
 }
 if(lv>=15){
  for(const x of [left+14,left+width-13]){
   ctx.fillStyle='#d8b365';ctx.fillRect(x,top-5,9,110);
   ctx.fillStyle=roofColor;ctx.fillRect(x-5,top+15,18,49);
  }
 }
 if(royal&&castle){
  polygon(ctx,[[247,141],[263,113],[279,141],[263,170]],crystal?'#c78aff':'#e8bf74','#f1d9b5');
  ctx.fillStyle='#efc979';ctx.fillRect(259,165,7,44);
 }
 if(castle&&lv>=29){
  for(const x of [158,338]){polygon(ctx,[[x-9,320],[x,302],[x+9,320],[x,338]],'#a96be0','#e8c7ff');}
 }
 if(lv>=35&&castle){
  polygon(ctx,[[246,72],[266,26],[288,72],[268,120]],'#ce95ff','#f4d6ff');
  for(const x of [111,381])polygon(ctx,[[x-10,243],[x,216],[x+11,243],[x,262]],'#ba7aff','#efcaff');
 }
}
export function createIsometricArtwork(type,level=1,{width=2.6,height=3.4}={}){
 const lv=Math.max(1,Math.min(35,Math.floor(Number(level)||1)));
 const key=type+':'+lv;
 let texture=cache.get(key);
 if(!texture){
  if(typeof document==='undefined')return null;
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=640;
  const ctx=canvas.getContext('2d');if(!ctx)return null;
  drawArt(ctx,type,lv);
  texture=new THREE.CanvasTexture(canvas);
  texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
  texture.generateMipmaps=true;texture.minFilter=THREE.LinearMipmapLinearFilter;
  cache.set(key,texture);
 }
 // Sprite faces the camera when the player rotates the isometric view.
 const mat=new THREE.SpriteMaterial({map:texture,transparent:true,alphaTest:.08,depthWrite:false});
 const mesh=new THREE.Sprite(mat);
 mesh.scale.set(width,height,1);mesh.position.y=height/2+.12;mesh.renderOrder=4;
 mesh.userData.ember2D=true;mesh.userData.artKey=key;
 return mesh;
}
