import * as THREE from 'three';

// Purpose-built castle illustration. Transparent 2.5D artwork, generated once per
// castle level and shared by instances; no network dependency or external assets.
const textures=new Map();
const clampLevel=n=>Math.max(1,Math.min(35,Math.floor(Number(n)||1)));
const tiers=[
 {at:1,stone:'#b7a58e',side:'#7e716b',roof:'#6e604d',trim:'#d5b987'},
 {at:8,stone:'#b8ad9c',side:'#7c7776',roof:'#654b45',trim:'#d7b99a'},
 {at:15,stone:'#c8b9a9',side:'#837b80',roof:'#9c3b52',trim:'#e3bf80'},
 {at:22,stone:'#d8d4d4',side:'#868c9e',roof:'#516ea5',trim:'#e6c988'},
 {at:29,stone:'#d9d4eb',side:'#8986b2',roof:'#6850a2',trim:'#c3c7fc'},
 {at:35,stone:'#e7e1f7',side:'#8e87b7',roof:'#6640ad',trim:'#d6c7ff'}
];
function poly(c,pts,fill,stroke='#3b3449',line=3){
 c.beginPath();c.moveTo(...pts[0]);for(const p of pts.slice(1))c.lineTo(...p);
 c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=line;c.stroke();}
}
function stroke(c,pts,color,width=3){c.beginPath();c.moveTo(...pts[0]);for(const p of pts.slice(1))c.lineTo(...p);c.strokeStyle=color;c.lineWidth=width;c.stroke();}
function stoneWall(c,x,y,w,h,p){
 const face=c.createLinearGradient(x,y,x+w,y+h);face.addColorStop(0,p.stone);face.addColorStop(1,p.side);
 c.fillStyle=face;c.fillRect(x,y,w,h);c.strokeStyle='#4a4254';c.lineWidth=3;c.strokeRect(x,y,w,h);
 c.save();c.beginPath();c.rect(x+2,y+2,w-4,h-4);c.clip();
 for(let row=0;row<Math.ceil(h/22);row++){
  const yy=y+row*22;stroke(c,[[x,yy],[x+w,yy]],'#716a79',1.2);
  for(let col=0;col<Math.ceil(w/45);col++){
   const xx=x+col*45+(row%2)*22;
   stroke(c,[[xx,yy],[xx,Math.min(y+h,yy+22)]],'#7a7280',1);
  }
 }c.restore();
}
function tower(c,x,y,w,h,p,level,front=false){
 const side=22;
 poly(c,[[x+w,y],[x+w+side,y-17],[x+w+side,y+h-17],[x+w,y+h]],p.side);
 stoneWall(c,x,y,w,h,p);
 // Turret battlements grow into ornamental crenellations at higher levels.
 for(let i=0;i<Math.floor(w/20);i++){
  const bx=x+i*20;c.fillStyle=p.stone;c.fillRect(bx,y-13,13,18);
  stroke(c,[[bx,y-13],[bx+13,y-13]],p.trim,2);
 }
 if(level>=8){
  poly(c,[[x-15,y-7],[x+w+12,y-7],[x+w/2,y-75-(level>=29?17:0)]],p.roof,p.trim,4);
  poly(c,[[x+w+12,y-7],[x+w+side+10,y-24],[x+w/2,y-75-(level>=29?17:0)]],p.side,p.trim,2);
  stroke(c,[[x+w/2,y-76],[x+w/2,y-102]],p.trim,3);
  if(level>=15)poly(c,[[x+w/2,y-101],[x+w/2+29,y-91],[x+w/2,y-80]],p.roof,p.trim,2);
 }
 if(front){
  for(let yy=y+36;yy<y+h-20;yy+=60){
   c.fillStyle='#27344d';c.fillRect(x+w/2-9,yy,18,35);
   c.fillStyle='#a5c9eb';c.fillRect(x+w/2-5,yy+4,10,25);
   stroke(c,[[x+w/2,yy+4],[x+w/2,yy+29]],p.trim,2);
  }
 }
}
function crystal(c,x,y,size){
 poly(c,[[x,y-size],[x+size*.56,y-size*.15],[x,y+size],[x-size*.56,y-size*.15]],'#a5a7f7','#f4edff',3);
 poly(c,[[x,y-size],[x+size*.56,y-size*.15],[x,y+size]],'#6850d2',null);
 stroke(c,[[x,y-size],[x,y+size]],'#e7d6ff',3);
}
function drawCastle(c,level){
 const p=[...tiers].reverse().find(t=>level>=t.at);
 const tier=[...tiers].reverse().findIndex(t=>level>=t.at);
 c.clearRect(0,0,768,896);c.lineJoin='round';c.lineCap='round';
 const ground=c.createRadialGradient(390,712,12,390,712,315);
 ground.addColorStop(0,'rgba(25,24,42,.35)');ground.addColorStop(1,'rgba(25,24,42,0)');
 c.fillStyle=ground;c.fillRect(30,590,710,250);
 // Isometric stone foundation and perimeter terrace.
 poly(c,[[78,681],[388,795],[708,668],[398,557]],'#9b978e');
 poly(c,[[78,681],[388,795],[388,824],[78,708]],'#68646d');
 poly(c,[[388,795],[708,668],[708,697],[388,824]],'#565460');
 for(let i=0;i<9;i++)stroke(c,[[118+i*28,692+i*8],[375+i*8,769-i*10]],'#d0c8b4',1);
 // Rear defensive walls and turrets, visible over the central keep.
 tower(c,145,374,91,258,p,level);
 tower(c,526,357,91,264,p,level);
 stoneWall(c,192,442,389,224,p);
 // Main keep with offset wings for a layered castle silhouette.
 poly(c,[[244,380],[404,312],[565,378],[408,447]],p.roof,p.trim,5);
 poly(c,[[244,380],[408,447],[408,604],[244,536]],p.side);
 poly(c,[[408,447],[565,378],[565,536],[408,604]],p.stone);
 stoneWall(c,281,404,245,231,p);
 for(let i=0;i<5;i++){
  const x=302+i*44;
  poly(c,[[x,396],[x+29,396],[x+29,420],[x,420]],p.stone,p.trim,2);
 }
 // Roof apex and central tower become taller as levels progress.
 const rise=level>=29?85:level>=22?60:level>=15?35:0;
 tower(c,349,299-rise,108,171+rise,p,level,true);
 // Side wings and crenellated foreground ramparts.
 tower(c,175,483,116,177,p,level,true);
 tower(c,488,480,116,181,p,level,true);
 stoneWall(c,258,575,265,123,p);
 for(let x=263;x<523;x+=33){
  c.fillStyle=p.stone;c.fillRect(x,560,22,25);
  stroke(c,[[x,560],[x+22,560]],p.trim,2);
 }
 // Gatehouse: inset arched entrance, warm torches, portcullis.
 poly(c,[[345,696],[345,640],[355,612],[382,602],[409,612],[419,640],[419,696]],'#2b2639',p.trim,6);
 poly(c,[[355,693],[355,644],[363,626],[382,617],[401,626],[409,644],[409,693]],'#513c3b','#2c2735',2);
 for(let x=362;x<=404;x+=10)stroke(c,[[x,634],[x,692]],'#c9b28b',2);
 for(let y=645;y<690;y+=14)stroke(c,[[355,y],[409,y]],'#c9b28b',2);
 for(const x of [321,444]){
  poly(c,[[x-7,637],[x,621],[x+7,637],[x,648]],'#ffd29b','#c26b35',2);
 }
 // Heraldic banners at red tier and above.
 if(level>=15)for(const x of [250,514]){
  stroke(c,[[x,445],[x,552]],p.trim,5);
  poly(c,[[x+3,454],[x+39,465],[x+39,531],[x+21,520],[x+3,530]],p.roof,p.trim,3);
  stroke(c,[[x+21,470],[x+21,507]],'#f4e2bd',4);
 }
 // Royal crowns and stained-glass windows.
 if(level>=22){
  poly(c,[[363,285-rise],[373,265-rise],[383,285-rise],[394,263-rise],[405,285-rise],[414,277-rise],[409,303-rise],[367,303-rise]],p.trim,'#f6e5b9',3);
  for(const x of [321,463]){
   poly(c,[[x-11,493],[x-11,459],[x,447],[x+11,459],[x+11,493]],'#91bde9',p.trim,3);
   stroke(c,[[x,452],[x,489]],'#e9f5ff',2);
  }
 }
 // Crystalline towers at endgame levels.
 if(level>=29){
  for(const [x,y,size] of [[193,349,37],[570,333,37],[404,181-rise,50]])crystal(c,x,y,size);
  for(const x of [314,454])crystal(c,x,564,17);
 }
 if(level>=35){
  poly(c,[[355,214-rise],[385,150-rise],[415,214-rise],[385,244-rise]],'#d5b5ff','#fff1ff',5);
  stroke(c,[[385,153-rise],[385,236-rise]],'#fff6ff',5);
  for(const x of [129,633])crystal(c,x,521,32);
 }
 // Every level gets visible progression, not only milestone levels.
 const badges=Math.min(5,Math.floor((level-1)%7/1.4));
 for(let i=0;i<badges;i++){
  const x=316+i*33;
  poly(c,[[x,572],[x+9,567],[x+18,572],[x+18,583],[x,583]],p.trim,'#73677c',1);
 }
}
export function createRoyalCastleArtwork(level){
 const lv=clampLevel(level);
 let texture=textures.get(lv);
 if(!texture){
  if(typeof document==='undefined')return null;
  const canvas=document.createElement('canvas');canvas.width=768;canvas.height=896;
  const ctx=canvas.getContext('2d');if(!ctx)return null;
  drawCastle(ctx,lv);
  texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  texture.anisotropy=4;texture.generateMipmaps=true;texture.minFilter=THREE.LinearMipmapLinearFilter;
  textures.set(lv,texture);
 }
 const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,alphaTest:.06,depthWrite:false}));
 sprite.scale.set(4.25,4.96,1);sprite.position.set(0,2.48,0);sprite.renderOrder=6;
 sprite.userData.isCastleSprite=true;sprite.userData.castleLevel=lv;sprite.userData.artKey='royal-generated-'+lv;
 return sprite;
}
