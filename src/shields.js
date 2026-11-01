import {furyRemaining} from './battleFury.js';
export const SHIELD_OPTIONS=[
{hours:4,label:'4 hours',gems:100},{hours:8,label:'8 hours',gems:180},
{hours:12,label:'12 hours',gems:260},{hours:24,label:'1 day',gems:1000},
{hours:72,label:'3 days',gems:3500},{hours:168,label:'7 days',gems:10000},
{hours:336,label:'14 days',gems:24000},{hours:720,label:'30 days',gems:40000}
];
export function shieldState(state){state.shieldSystem??={until:0,inventory:{}};return state.shieldSystem}
export function shieldRemaining(state,time=Date.now()){return Math.max(0,shieldState(state).until-time)}
export function shieldTime(ms){const s=Math.ceil(ms/1000),d=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.floor(s%3600/60),sec=s%60;return (d?d+'d ':'')+String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0')}
export function shieldPanel(state){const sh=shieldState(state),active=shieldRemaining(state)>0;return '<h2>🛡️ Castle Shields</h2><div class="item"><strong>'+(active?'🟣 Shield active':'⚠️ Castle unshielded')+'</strong><p>Time remaining: <strong id="shieldCountdown">'+(active?shieldTime(shieldRemaining(state)):'00:00:00')+'</strong></p><p>Expires: '+(active?new Date(sh.until).toLocaleString():'—')+'</p></div><p>Buy shields with gems, then activate them from your inventory. Activating a new shield replaces the current expiry (it does not stack).</p><h3>💎 Gem Shield Store</h3>'+SHIELD_OPTIONS.map(o=>'<div class="item"><strong>🛡️ '+o.label+' Shield</strong><p>💎 '+o.gems.toLocaleString()+' gems · Owned: '+(sh.inventory[o.hours]||0)+'</p><button data-shield-buy="'+o.hours+'">Buy</button> <button data-shield-use="'+o.hours+'" '+(!sh.inventory[o.hours]?'disabled':'')+'>Activate</button></div>').join('')+shieldDesignPanel(state)+'<p>Offline testing: protection status is saved locally. Real multiplayer attacks must validate shields on the game server.</p>'}
export function bindShields(root,state,save,refresh,rerender,notify){bindShieldDesigns(root,state,save,rerender,notify);const sh=shieldState(state);root.querySelectorAll('[data-shield-buy]').forEach(b=>b.onclick=()=>{const o=SHIELD_OPTIONS.find(v=>v.hours===Number(b.dataset.shieldBuy));if(!o||state.resources.gems<o.gems)return notify('Not enough gems');state.resources.gems-=o.gems;sh.inventory[o.hours]=(sh.inventory[o.hours]||0)+1;save();refresh();rerender();notify(o.label+' shield purchased')});root.querySelectorAll('[data-shield-use]').forEach(b=>b.onclick=()=>{const o=SHIELD_OPTIONS.find(v=>v.hours===Number(b.dataset.shieldUse));if(!o||!sh.inventory[o.hours])return;if(furyRemaining(state)>0)return notify('Cannot activate a shield during Battle Fury');sh.inventory[o.hours]--;sh.until=Date.now()+o.hours*3600000;save();refresh();rerender();notify(o.label+' shield activated')})}

export const SHIELD_DESIGNS=[
{id:'classic',name:'Royal Barrier',icon:'🛡️',color:'#a7c7ff',source:'default'},
{id:'violet',name:'Violet Aegis',icon:'💜',color:'#a875ff',source:'event'},
{id:'dragon',name:'Dragonfire Ward',icon:'🐉',color:'#f58a4b',source:'pack'},
{id:'frost',name:'Frostguard Dome',icon:'❄️',color:'#76e2ff',source:'event'},
{id:'ember',name:'Ember Crown',icon:'👑',color:'#ffce72',source:'pack'}
];
export function shieldCosmetics(state){const x=shieldState(state);x.designs??=['classic'];x.selectedDesign??='classic';return x}
export function grantShieldDesign(state,id){const x=shieldCosmetics(state);if(!SHIELD_DESIGNS.some(d=>d.id===id))return false;if(x.designs.includes(id))return false;x.designs.push(id);return true}
export function shieldDesignPanel(state){const x=shieldCosmetics(state);return '<h3>🎨 Shield Appearance</h3><p>Shield designs are permanent cosmetics. They do not affect shield duration or protection strength.</p>'+SHIELD_DESIGNS.map(d=>'<div class="item"><strong>'+d.icon+' '+d.name+'</strong><p>'+(d.source==='default'?'Free base design':d.source==='event'?'Event reward':'Special pack')+' · '+(x.designs.includes(d.id)?'Owned':'Locked')+'</p><button data-shield-design="'+d.id+'" '+(!x.designs.includes(d.id)?'disabled':'')+'>'+(x.selectedDesign===d.id?'Equipped':'Equip')+'</button></div>').join('')}
export function bindShieldDesigns(root,state,save,rerender,notify){root.querySelectorAll('[data-shield-design]').forEach(b=>b.onclick=()=>{const x=shieldCosmetics(state),id=b.dataset.shieldDesign;if(!x.designs.includes(id))return;x.selectedDesign=id;save();rerender();notify('Shield appearance equipped')})}
