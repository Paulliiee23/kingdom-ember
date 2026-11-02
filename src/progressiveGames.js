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
 const p=jackpotState(state),lab=game==='labyrinth',item=lab?'labyrinthKeys':'tycoonTokens';
 const title=lab?'Ember Labyrinth':'Royal Tycoon';
 const count=state.specialItems?.[item]||0;
 const history=p.history.filter(h=>h.game===game).slice(0,5);
 const n=x=>Number(x||0).toLocaleString();
 const tokenIcon='<img class="kingdom-currency-icon" src="/art/ui/kingdom_ember_token.png" alt="Token" onerror="this.replaceWith(document.createTextNode(\'🎟️\'))">';
 const starIcon='<img class="kingdom-currency-icon" src="/art/ui/kingdom_ember_star.png" alt="Star" onerror="this.replaceWith(document.createTextNode(\'⭐\'))">';
 return `<section class="progressive-game progressive-game--${game}" aria-label="${title}">
 <div class="progressive-hero">
  <div class="progressive-eyebrow">${lab?'EXPLORE · SURVIVE · DISCOVER':'BUILD · COLLECT · WIN'}</div>
  <h3>${lab?'🌀':'🎲'} ${title}</h3>
  <p>${lab?'Enter the ancient chambers and uncover the Ember treasury.':'Run your royal enterprise and uncover treasure from the Tycoon Boss.'}</p>
  <div class="progressive-wallet"><span>${lab?starIcon:tokenIcon} Available ${lab?'keys':'tokens'}</span><strong>${n(count)}</strong></div>
 </div>
 <div class="ember-stage" data-ember-stage="${game}" aria-label="3D ${game} environment"></div>
 <div class="progressive-modes">${['normal','elite'].map(mode=>{
 const elite=mode==='elite',pool=p.pools[game+':'+mode],locked=elite&&!p.eliteUnlocked;
 return `<div class="progressive-mode ${elite?'progressive-mode--elite':''}">
 <div class="progressive-mode-heading"><strong>${elite?'💎 Elite':'⚔️ Normal'}</strong><span>${elite?'10× rewards':'Standard rewards'}</span></div>
 <div class="progressive-prize"><small>Current gem jackpot</small><strong>${starIcon} ${n(pool.value)}</strong></div>
 <div class="progressive-stats"><span>Plays: ${n(pool.spins)}</span><span>Jackpots won: ${n(pool.wins)}</span></div>
 <button data-progressive-mode="${mode}" ${locked||count<1?'disabled':''}>${locked?'🔒 Elite locked':count<1?'Need 1 '+(lab?'key':'token'):'▶ Play '+(elite?'Elite':'Normal')}</button>
 </div>`}).join('')}</div>
 ${!p.eliteUnlocked?'<button id="testEliteUnlock">🔓 Unlock Elite for free playtesting</button>':'<p>💎 Elite mode unlocked</p>'}
 ${!lab?'<div class="progressive-boss"><strong>👑 Tycoon Boss vault</strong><p>Boss gem chests collected: '+n(p.bossChests)+'</p><small>Each play has a 20% chance to award 1–3 boss chests.</small></div>':'<div class="progressive-boss"><strong>🗝️ Labyrinth expedition</strong><p>Spend a key to claim gold and seek the progressive gem jackpot.</p></div>'}
 <details class="progressive-history"><summary>Recent expeditions and rewards</summary>${history.length?history.map(h=>'<p>'+(h.mode==='elite'?'💎 Elite':'⚔️ Normal')+' · '+(h.jackpot?'Jackpot '+n(h.jackpot)+' gems':lab?'250 gold base reward':'200 stone base reward')+(h.bossChests?' · '+h.bossChests+' boss chests':'')+'</p>').join(''):'<p>No plays yet. Your history will appear here.</p>'}</details>
 <p class="muted">Offline simulation only. No real-money purchases. Jackpot chance: 1% per play; pools increase by 25 gems (Normal) or 250 gems (Elite).</p>
 </section>`;
}
