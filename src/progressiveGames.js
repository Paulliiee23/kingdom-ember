// Offline playtest simulation only. No payments, odds claims, or multiplayer jackpot.
export const BASE_JACKPOT=1000;
export function jackpotState(state){
 const p=state.progressiveGames??={eliteUnlocked:false,pools:{},history:[],bossChests:0};
 p.pools??={};p.history??=[];p.bossChests??=0;
 for(const game of ['labyrinth','tycoon'])for(const mode of ['normal','elite']){
  const key=game+':'+mode;
  p.pools[key]??={value:BASE_JACKPOT*(mode==='elite'?10:1),spins:0,wins:0};
 }
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
 // Simulated playtest odds, not a real-money product.
 const jackpot=random()<.01;
 const reward=jackpot?pool.value:0;
 if(jackpot){state.resources.gems=(state.resources.gems||0)+reward;pool.value=BASE_JACKPOT*factor;pool.wins++}
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
 const p=jackpotState(state),item=game==='labyrinth'?'labyrinthKeys':'tycoonTokens';
 return '<h3>'+ (game==='labyrinth'?'Ember Labyrinth':'Royal Tycoon') +' — Progressive Jackpot</h3><p>Available '+item+': '+(state.specialItems?.[item]||0)+'</p><p>Playtest simulation: no real-money purchases. Jackpot odds 1% per play; Tycoon Boss chance 20% (chests ×1 70%, ×2 25%, ×3 5% on boss).</p>'+
 ['normal','elite'].map(mode=>{const pool=p.pools[game+':'+mode];return '<div class="item"><strong>'+ (mode==='elite'?'Elite (10×)':'Normal')+'</strong> · Jackpot: '+pool.value.toLocaleString()+' gems · Plays: '+pool.spins+' · Wins: '+pool.wins+'<p><button data-progressive-mode="'+mode+'" '+(mode==='elite'&&!p.eliteUnlocked?'disabled':'')+'>Play '+mode+' (1 '+item+')</button></p></div>'}).join('')+
 (!p.eliteUnlocked?'<button id="testEliteUnlock">Simulate maximum-price pack purchase — unlock Elite (free test)</button>':'<p>Elite unlocked for testing ✓</p>')+
 (game==='tycoon'?'<p>Boss gem chests earned: '+p.bossChests+' (reward inventory counter)</p>':'')+
 '<p>Jackpots grow by 25 gems per Normal play and 250 per Elite play. Each jackpot resets independently after a win.</p>';
}
