// Tycoon route playback. All rewards come from the existing playProgressive
// economy; movement is a presentation of one completed token use.
let active=null;
const points=[[9,70],[30,32],[53,63],[74,33],[95,39]];
export function stopTycoon(){
 if(!active)return;
 clearTimeout(active.timer);active=null;
}
export function installTycoonRoute(panel,{play,onFinish}){
 stopTycoon();
 const root=panel.querySelector('[data-tycoon-route]');
 if(!root)return;
 const runner=root.querySelector('[data-tycoon-runner]');
 const status=root.querySelector('[data-tycoon-status]');
 const start=panel.querySelector('[data-progressive-mode]');
 const auto=panel.querySelector('[data-ember-auto]');
 const stop=panel.querySelector('[data-tycoon-stop]');
 const speed=panel.querySelector('[data-tycoon-speed]');
 let multiplier=1;
 function controls(running){
  start.disabled=running;auto.disabled=running;stop.disabled=!running;
 }
 function reset(){runner.style.left=points[0][0]+'%';runner.style.top=points[0][1]+'%';}
 reset();controls(false);
 speed?.addEventListener('click',()=>{
  multiplier=multiplier===1?3:1;speed.textContent='×'+multiplier+' SPEED';
 });
 stop?.addEventListener('click',()=>{
  stopTycoon();controls(false);status.textContent='Stopped';reset();
 });
 function begin(repeat){
  if(active)return;
  const result=play();
  if(!result?.ok){status.textContent=result?.reason||'No tokens available';controls(false);return}
  const balance=panel.querySelector('.ember-play-balance strong');
  if(balance)balance.textContent=Math.max(0,(Number(balance.textContent.replace(/,/g,''))||0)-1).toLocaleString();
  const run={timer:null};active=run;controls(true);status.textContent='Exploring treasure path…';
  let index=0;
  function step(){
   if(active!==run)return;
   if(!root.isConnected){stopTycoon();return}
   index++;
   if(index>=points.length){
    status.textContent=result.jackpot?'💎 Jackpot!':result.bossChests?'🎁 Bonus chest!':'🎁 Reward collected';
    onFinish?.(result);
    if(repeat){
     run.timer=setTimeout(()=>{
      if(active!==run)return;
      if(!root.isConnected){stopTycoon();return}
      active=null;reset();begin(true);
     },Math.round(650/multiplier));
    }else{active=null;controls(false);reset()}
    return;
   }
   runner.style.transition='left '+(550/multiplier)+'ms ease-in-out, top '+(550/multiplier)+'ms ease-in-out';
   runner.style.left=points[index][0]+'%';runner.style.top=points[index][1]+'%';
   root.querySelectorAll('.tycoon-tile').forEach((tile,i)=>tile.classList.toggle('tycoon-tile-active',i===index));
   run.timer=setTimeout(step,Math.round(680/multiplier));
  }
  run.timer=setTimeout(step,Math.round(250/multiplier));
 }
 start?.addEventListener('click',e=>{e.stopImmediatePropagation();begin(false)},true);
 auto?.addEventListener('click',e=>{e.stopImmediatePropagation();begin(true)},true);
}
