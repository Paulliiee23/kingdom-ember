import {simulateBattle} from './battleSimulator.js';
export const GUILD_ALLIES=[
{id:'a',name:'Ember Vanguard',army:{infantry:12,archer:6,cavalry:4},joinSeconds:5},
{id:'b',name:'Violet Huntress',army:{infantry:3,archer:15,cavalry:5},joinSeconds:10},
{id:'c',name:'Iron Cavalier',army:{infantry:5,archer:3,cavalry:14},joinSeconds:15}
];
export const RALLY_TARGETS=[
{id:'player',name:'Training Dummy Castle',army:{infantry:8,archer:10,cavalry:6}},
{id:'scout',name:'Border Outpost (Easy)',army:{infantry:6,archer:4,cavalry:2}},
{id:'fortress',name:'Ironhold Fortress (Medium)',army:{infantry:25,archer:18,cavalry:15}},
{id:'citadel',name:'Ashen Citadel (Hard)',army:{infantry:90,archer:80,cavalry:65}},
{id:'guardian',name:'Guardian Monster',army:{infantry:15,archer:20,cavalry:10}}
];
export function guildState(s){s.testGuild??={name:'Ember Alliance',tag:'EMB',rallies:[],reports:[],joined:true,coins:0,helped:[],helpRequests:[]};s.testGuild.rallies??=[];s.testGuild.reports??=[];return s.testGuild}
const targetName=id=>RALLY_TARGETS.find(t=>t.id===id)?.name||'Unknown target';
const allyName=id=>GUILD_ALLIES.find(a=>a.id===id)?.name||id;
const safe=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function rallyPanel(s){
const g=guildState(s),now=Date.now();
return '<section class="rally-lab"><h2>⚔️ Guild Rally Test Lab</h2><p class="muted">Offline simulated allies. Auto-join happens at 5, 10 and 15 seconds. No real players or online attacks.</p>'+
(!g.joined?'<p>Join or create a guild to start rallies.</p>':
'<h3>Allied castles</h3>'+GUILD_ALLIES.map(a=>'<div class="item">'+safe(a.name)+' · '+Object.values(a.army).reduce((x,y)=>x+y,0)+' troops · auto-joins at '+a.joinSeconds+'s</div>').join('')+
'<h3>Create test rally</h3><label>Target <select id="rallyTarget">'+RALLY_TARGETS.map(t=>'<option value="'+t.id+'">'+safe(t.name)+'</option>').join('')+'</select></label>'+
'<label>Preparation <select id="rallyDelay"><option value="30">30 seconds (quick test)</option><option value="60">1 minute</option><option value="300">5 minutes</option></select></label>'+
'<label><input id="rallyAutoJoin" type="checkbox" checked> Automatically join simulated allies</label> <button id="rallyCreate">Set Rally</button>')+
'<h3>Active rallies</h3>'+
(g.rallies.length?g.rallies.map(r=>'<div class="item"><b>'+safe(targetName(r.target))+' · '+safe(r.status)+'</b>'+
'<p>Joined: '+(r.joined.length?r.joined.map(allyName).map(safe).join(', '):'Awaiting allies')+'</p>'+
'<p>'+ (r.status==='marching'?'Arrival':r.status==='waiting'?'Waiting for allies':'Preparation ends')+': '+(r.status==='waiting'?'paused':new Date(r.status==='marching'?r.arrive:r.ready).toLocaleTimeString())+'</p>'+
(r.status==='preparing'?'<p>Remaining: '+Math.max(0,Math.ceil((r.ready-now)/1000))+'s · Auto-join '+(r.autoJoin?'ON':'OFF')+'</p>':'')+
GUILD_ALLIES.filter(a=>!r.joined.includes(a.id)&&['preparing','waiting'].includes(r.status)).map(a=>'<button data-join-rally="'+safe(r.id)+'" data-ally="'+a.id+'">Join '+safe(a.name)+'</button>').join('')+'</div>').join(''):'<p>No active rallies.</p>')+
'<h3>Rally reports</h3>'+(g.reports.length?g.reports.slice(0,12).map(r=>'<div class="item">'+(r.win?'🏆 Victory':'💀 Defeat')+' · '+safe(targetName(r.target))+' · '+r.joined+' allies ('+(r.participants||[]).map(allyName).map(safe).join(', ')+') · '+r.attackPower+' vs '+r.defensePower+'</div>').join(''):'<p>Reports appear when rallies finish.</p>')+'</section>';
}
export function bindRallies(root,s,save,render,notify){
const g=guildState(s);
root.querySelector('#rallyCreate')?.addEventListener('click',()=>{
if(!g.joined)return notify('Join a guild first');
const target=root.querySelector('#rallyTarget').value,delay=Number(root.querySelector('#rallyDelay').value),started=Date.now();
if(!RALLY_TARGETS.some(t=>t.id===target)||![30,60,300].includes(delay))return notify('Invalid rally settings');
g.rallies.push({id:started+'-'+g.rallies.length,target,status:'preparing',joined:[],started,ready:started+delay*1000,autoJoin:root.querySelector('#rallyAutoJoin').checked});
save();render();notify('Rally preparation started. Allies will join automatically if enabled');
});
root.querySelectorAll('[data-join-rally]').forEach(b=>b.addEventListener('click',()=>{
const r=g.rallies.find(x=>x.id===b.dataset.joinRally);
if(r&&['preparing','waiting'].includes(r.status)&&GUILD_ALLIES.some(a=>a.id===b.dataset.ally)&&!r.joined.includes(b.dataset.ally)){
r.joined.push(b.dataset.ally);
if(r.status==='waiting'){r.status='preparing';r.ready=Date.now()+30_000}
save();render();notify(allyName(b.dataset.ally)+' joined the rally')
}
}));
}
export function tickRallies(s,notify,clock=Date.now()){
const g=guildState(s);let changed=false;
for(const r of g.rallies){
r.joined??=[];r.autoJoin??=false;
if(r.status==='preparing'&&r.autoJoin&&g.joined){
const started=Number.isFinite(r.started)?r.started:r.ready-30000;
for(const a of GUILD_ALLIES){
if(clock>=started+a.joinSeconds*1000&&clock<r.ready&&!r.joined.includes(a.id)){
r.joined.push(a.id);changed=true;notify(a.name+' joined your rally');
}
}
}
if(r.status==='preparing'&&clock>=r.ready){
if(!r.joined.length){r.status='waiting';changed=true;notify('Rally waiting for allies');continue}
r.status='marching';r.arrive=clock+30000;changed=true;notify('Rally marching on '+targetName(r.target));
}
if(r.status==='marching'&&clock>=r.arrive){
const army={infantry:10,archer:10,cavalry:10};
for(const id of r.joined){const a=GUILD_ALLIES.find(x=>x.id===id);if(a)for(const [unit,count] of Object.entries(a.army))army[unit]+=count}
const attackBonus=(s.research?.attack||0)*.05+(s.rallyHeroAttackBonus||0)+(s.rallyPetAttackBonus||0);
const defenseBonus=(s.rallyDefenderHeroBonus||0)+(s.rallyDefenderPetBonus||0);
const defender=RALLY_TARGETS.find(t=>t.id===r.target)?.army||RALLY_TARGETS[0].army;
const result=simulateBattle(army,defender,{attackBonus,defenseBonus});
g.reports.unshift({target:r.target,joined:r.joined.length,participants:[...r.joined],...result,time:clock});
r.status='completed';changed=true;notify('Rally completed — check Guild Hall reports');
}
}
if(changed){g.rallies=g.rallies.filter(r=>r.status!=='completed');g.reports=g.reports.slice(0,30)}
return changed;
}
const escapeGuild=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
export function guildHallPanel(s){const g=guildState(s);g.coins??=0;g.helped??=[];g.helpRequests??=[];g.joined??=true;
const directory=[{tag:'EMB',name:'Ember Alliance'},{tag:'STN',name:'Stone Wardens'},{tag:'FRG',name:'Forge Keepers'}];
return '<section class="guild-hall"><h2>🏰 Guild Hall</h2><p class="muted">Offline guild simulation — no shared online membership yet.</p>'+
(g.joined?'<div class="item"><h3>['+escapeGuild(g.tag)+'] '+escapeGuild(g.name)+'</h3><p>Guild Coins: 🪙 '+g.coins.toLocaleString()+'</p><button id="guildLeave">Leave Guild</button></div><h3>Guild Board</h3><div class="item"><p>Welcome to the Guild Hall. Help allies grow and prepare for rallies.</p></div><h3>Guild Help</h3><button id="guildHelpAll">Help All</button>'+GUILD_ALLIES.map(a=>'<div class="item">'+escapeGuild(a.name)+' needs construction help <button data-help-ally="'+a.id+'" '+(g.helped.includes(a.id)?'disabled':'')+'>'+(g.helped.includes(a.id)?'Helped':'Help · +100 coins')+'</button></div>').join('')+'<p class="muted">Demo requests reset when you leave and rejoin. Each request pays once.</p><h3>Guild Shop</h3><div class="item">Training Supplies — 300 Guild Coins <button data-guild-buy="training">Redeem</button></div>':'<h3>Join a guild</h3>'+directory.map(d=>'<div class="item">['+d.tag+'] '+d.name+' <button data-guild-join="'+d.tag+'">Join</button></div>').join('')+'<h3>Create a guild</h3><label>Guild Name <input id="guildName" maxlength="32" placeholder="Guild name"></label><label>Guild Tag <input id="guildTag" maxlength="3" placeholder="ABC"></label><button id="guildCreate">Create Guild</button>')+'</section>'}
export function bindGuildHall(root,s,save,render,notify){const g=guildState(s);const commit=()=>{save();render()};root.querySelector('#guildLeave')?.addEventListener('click',()=>{g.joined=false;g.rallies=[];commit()});root.querySelectorAll('[data-guild-join]').forEach(b=>b.addEventListener('click',()=>{const d={EMB:'Ember Alliance',STN:'Stone Wardens',FRG:'Forge Keepers'};g.tag=b.dataset.guildJoin;g.name=d[g.tag];g.joined=true;g.helped=[];commit()}));root.querySelector('#guildCreate')?.addEventListener('click',()=>{const name=root.querySelector('#guildName').value.trim(),tag=root.querySelector('#guildTag').value.trim().toUpperCase();if(name.length<3||!/^[A-Z0-9]{2,3}$/.test(tag))return notify('Enter a name (3+ characters) and a 2–3 character tag');g.name=name;g.tag=tag;g.joined=true;g.helped=[];commit()});root.querySelectorAll('[data-help-ally]').forEach(b=>b.addEventListener('click',()=>{if(!g.joined||g.helped.includes(b.dataset.helpAlly))return;g.helped.push(b.dataset.helpAlly);g.coins+=100;commit();notify('Guild Help sent · +100 Guild Coins')}));root.querySelector('#guildHelpAll')?.addEventListener('click',()=>{if(!g.joined)return;const available=GUILD_ALLIES.filter(a=>!g.helped.includes(a.id));for(const a of available)g.helped.push(a.id);g.coins+=available.length*100;commit();notify('Helped '+available.length+' allies')});root.querySelectorAll('[data-guild-buy]').forEach(b=>b.addEventListener('click',()=>{if(g.coins<300)return notify('Not enough Guild Coins');g.coins-=300;s.resources.food=(s.resources.food||0)+500;s.resources.wood=(s.resources.wood||0)+500;commit();notify('Training supplies redeemed: 500 food and 500 wood')}))}
