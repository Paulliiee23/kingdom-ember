// Offline playtest simulation only. No payments, odds claims, or multiplayer jackpot.
export const BASE_JACKPOT=1000;
export const ELITE_BASE_JACKPOT=1000000;
const ELITE_JUMP_NORMAL_THRESHOLD=1000000;
const ELITE_JUMP_VALUE=10000000;
const AUTO_GROWTH_INTERVAL_MS=60000;
const AUTO_GROWTH_NORMAL=25;
const AUTO_GROWTH_ELITE=250;
const MAX_OFFLINE_GROWTH_MS=24*60*60*1000;
function synchronizeElite(p,game){
 const normal=p.pools[game+':normal'],elite=p.pools[game+':elite'];
 if(!normal||!elite)return;
 // Reaching the Normal milestone permanently raises the Elite minimum for this game.
 if(normal.value>=ELITE_JUMP_NORMAL_THRESHOLD)elite.milestoneUnlocked=true;
 const floor=elite.milestoneUnlocked?ELITE_JUMP_VALUE:ELITE_BASE_JACKPOT;
 elite.value=Math.max(floor,Number(elite.value)||0);
}
export function jackpotState(state,now=Date.now()){
 const p=state.progressiveGames??={eliteUnlocked:false,pools:{},history:[],bossChests:0};
 p.pools??={};p.history??=[];p.bossChests??=0;
 for(const game of ['labyrinth','tycoon'])for(const mode of ['normal','elite']){
  const key=game+':'+mode;
  p.pools[key]??={value:mode==='elite'?ELITE_BASE_JACKPOT:BASE_JACKPOT,spins:0,wins:0};
  const pool=p.pools[key];
  // Migrate old test saves, which previously started Elite at 10,000.
  if(mode==='elite')pool.value=Math.max(ELITE_BASE_JACKPOT,Number(pool.value)||0);
  if(!Number.isFinite(pool.lastGrowthAt))pool.lastGrowthAt=now;
  const elapsed=Math.max(0,Math.min(MAX_OFFLINE_GROWTH_MS,now-pool.lastGrowthAt));
  const steps=Math.floor(elapsed/AUTO_GROWTH_INTERVAL_MS);
  if(steps>0){
   pool.value+=steps*(mode==='elite'?AUTO_GROWTH_ELITE:AUTO_GROWTH_NORMAL);
   pool.lastGrowthAt+=steps*AUTO_GROWTH_INTERVAL_MS;
  }
 }
 for(const game of ['labyrinth','tycoon'])synchronizeElite(p,game);
 return p;
}
export function unlockEliteForTesting(state){jackpotState(state).eliteUnlocked=true}
export function playProgressive(state,game,mode='normal',random=Math.random){
 if(!['labyrinth','tycoon'].includes(game)||!['normal','elite'].includes(mode))return {ok:false,reason:'Invalid mode'};
 const p=jackpotState(state);
 if(mode==='elite'&&!p.eliteUnlocked)return {ok:false,reason:'Elite is locked'};
 const item=game==='labyrinth'?'labyrinthKeys':'tycoonTokens';
 state.specialItems??={};if((state.specialItems[item]||0)<1)return {ok:false,reason:'Not enough '+item};
 state.specialItems[item]--;
 const key=game+':'+mode,pool=p.pools[key],factor=mode==='elite'?10:1;
 pool.spins++;pool.value+=25*factor;
 synchronizeElite(p,game);
 // Simulated playtest odds, not a real-money product.
 const jackpot=random()<.01;
 const reward=jackpot?pool.value:0;
 if(jackpot){state.resources.gems=(state.resources.gems||0)+reward;pool.value=mode==='elite'?(pool.milestoneUnlocked?ELITE_JUMP_VALUE:ELITE_BASE_JACKPOT):BASE_JACKPOT;pool.wins++}
 synchronizeElite(p,game);
 let bossChests=0;
 if(game==='tycoon'&&random()<.2){
  const roll=random();bossChests=roll<.7?1:roll<.95?2:3;
  p.bossChests+=bossChests;
 }
 const normalReward=game==='labyrinth'?{gold:250}:{stone:200};
 for(const [resource,amount] of Object.entries(normalReward))state.resources[resource]=(state.resources[resource]||0)+amount*factor;
 p.history.unshift({game,mode,jackpot:reward,bossChests,at:Date.now()});p.history.length=Math.min(p.history.length,30);
 return {ok:true,jackpot:reward,bossChests,pool:pool.value,mode,game};
}
export function progressivePanel(state,game){
 const p=jackpotState(state),lab=game==='labyrinth',item=lab?'labyrinthKeys':'tycoonTokens';
 const title=lab?'Ember Labyrinth':'Royal Tycoon',count=state.specialItems?.[item]||0;
 const n=x=>Number(x||0).toLocaleString();
 const icon=lab?'/art/ui/kingdom_ember_star.svg':'/art/ui/kingdom_ember_token.svg';
 const history=p.history.filter(h=>h.game===game).slice(0,4);
 return `<section class="ember-play-screen ${lab?'ember-play-lab':'ember-play-tycoon'}" data-ember-game="${game}" data-active-mode="normal" aria-label="${title}">
  <header class="ember-play-top"><div><span class="ember-play-subtitle">${lab?'ANCIENT RUINS':'ROYAL TREASURE PATH'}</span><h3>${title}</h3></div><div class="ember-play-balance"><img src="${icon}" alt=""><strong>${n(count)}</strong></div></header>
  <div class="ember-play-world">
   <div class="ember-play-landscape">
    <div class="ember-play-moon"></div>
    <div class="ember-play-cliff ember-play-cliff-left"></div><div class="ember-play-cliff ember-play-cliff-right"></div>
    <div class="ember-play-path"></div>
    <div class="ember-play-destination">${lab?'🐉':'💠'}</div>
    <div class="ember-play-avatar">${lab?'⚔️':'👑'}</div>
    <div class="ember-play-treasure">🧰<span>💎</span></div>
    <div class="ember-play-stage" data-ember-stage="${game}" aria-label="${game} animated stage"></div>
   </div>
   <div class="ember-play-jackpot"><span>💎 PROGRESSIVE JACKPOT</span><strong data-jackpot-value>${n(p.pools[game+':normal'].value)}</strong></div>
  </div>
  <div class="ember-play-controls">
   <div class="ember-play-mode-picker" role="group" aria-label="Play mode"><button type="button" data-ember-select-mode="normal" class="is-active" aria-pressed="true">Normal</button><button type="button" data-ember-select-mode="elite" aria-pressed="false" ${!p.eliteUnlocked?'disabled':''}>Elite ${p.eliteUnlocked?'':'🔒'}</button></div>
   <div class="ember-play-use"><div class="ember-play-mode-info" data-ember-mode-info>Normal · 1 ${lab?'star':'token'} per use</div><button type="button" class="ember-play-use-button" data-progressive-mode="normal" ${count<1?'disabled':''}>USE <span><img src="${icon}" alt=""> 1</span></button><button type="button" class="ember-play-auto" data-ember-auto>Auto Use ×3</button></div>
  </div>
  <div class="ember-play-footer"><span>${lab?'Explore the ruins and defeat the boss':'Advance along the treasure path'}</span><span>Offline playtest · no purchases</span></div>
  ${!p.eliteUnlocked?'<button type="button" id="testEliteUnlock" class="ember-play-unlock">Unlock Elite (free testing)</button>':''}
  <details class="ember-play-details"><summary>Rewards, odds and recent plays</summary><p>1% simulated jackpot chance per use. ${lab?'Base reward: 250 gold.':'Base reward: 200 stone. Boss chance: 20%.'} Elite rewards are 10×.</p><p>Normal jackpot: ${n(p.pools[game+':normal'].value)} · Elite jackpot: ${n(p.pools[game+':elite'].value)}</p>${history.length?history.map(h=>'<p>'+(h.mode==='elite'?'Elite':'Normal')+' · '+(h.jackpot?'💎 '+n(h.jackpot):'Standard reward')+'</p>').join(''):'<p>No plays yet.</p>'}</details>
 </section>`;
}
