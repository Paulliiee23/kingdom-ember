export const RESEARCH_TREES=[
['economy','🌾','Economy'],['defence','🛡️','Defence'],['military','⚔️','Military'],['hunting','🐉','Hunting'],
['advancedEconomy','🌿','Advanced Economy'],['advancedDefence','🏰','Advanced Defence'],['advancedMilitary','🗡️','Advanced Military'],['advancedHunting','🏹','Advanced Hunting'],
['eliteEconomy','💰','Elite Economy'],['eliteHunting','🐲','Elite Hunting'],['eliteMilitary','👑','Elite Military'],
['mythicJewels','💎','Mythic Jewels'],['mythicHeroes','✨','Mythic Heroes'],
['unifiedEconomy','🌍','Unified Economy'],['unifiedMilitary','⚜️','Unified Military'],
['pets','🐾','Pets'],['advancedPets','🐾','Advanced Pets']
];

const EMBLEM_FAMILIES={
economy:{mark:'🌾',color:'#a7c875',name:'Economy'},
defence:{mark:'🛡️',color:'#88b6d9',name:'Defence'},
military:{mark:'⚔️',color:'#e7a47e',name:'Military'},
hunting:{mark:'🐉',color:'#83c4a8',name:'Hunting'},
jewels:{mark:'💎',color:'#bd9fff',name:'Jewels'},
heroes:{mark:'👑',color:'#e8b7f5',name:'Heroes'},
pets:{mark:'🐾',color:'#8bd9d0',name:'Pets'}
};
function emblemInfo(id){
const family=id.includes('Economy')||id==='economy'?'economy':id.includes('Defence')||id==='defence'?'defence':id.includes('Military')||id==='military'?'military':id.includes('Hunting')||id==='hunting'?'hunting':id==='mythicJewels'?'jewels':id==='pets'||id==='advancedPets'?'pets':'heroes';
const rank=id.startsWith('advanced')?1:id.startsWith('elite')?2:id.startsWith('unified')?3:id.startsWith('mythic')?4:0;
return {...EMBLEM_FAMILIES[family],rank,family};
}
export function researchEmblem(id){
const e=emblemInfo(id),accent=e.rank===4?'#e6c2ff':e.rank>=2?'#e6c17b':e.color;
const crowns=['','✦','✦ ✦','✦ ✦ ✦','✧ ✦ ✧'];
return '<span role="img" aria-label="'+e.name+' '+['base','advanced','elite','unified','mythic'][e.rank]+' emblem" style="display:inline-flex;vertical-align:middle;flex:none;width:64px;height:70px;align-items:center;justify-content:center;position:relative;margin-right:10px;background:radial-gradient(circle at 45% 30%,#35314d,#121320 75%);border:2px solid '+accent+';border-radius:'+(e.rank>=3?'18px 18px 24px 24px':'50% 50% 42% 42%')+';box-shadow:0 0 '+(e.rank*3+4)+'px '+accent+'66,inset 0 0 12px #0009"><span style="position:absolute;top:2px;font-size:9px;letter-spacing:1px;color:'+accent+'">'+crowns[e.rank]+'</span><span style="font-size:29px;filter:drop-shadow(0 2px 3px #000)">'+e.mark+'</span><span style="position:absolute;bottom:3px;font-size:9px;color:'+accent+';font-weight:800;letter-spacing:1px">'+['I','II','III','IV','✦'][e.rank]+'</span></span>';
}

export function ensureResearchTrees(state){state.researchTrees??={};for(const [id] of RESEARCH_TREES)state.researchTrees[id]??={level:0};return state.researchTrees}
const required={advancedEconomy:'economy',advancedDefence:'defence',advancedMilitary:'military',advancedHunting:'hunting',eliteEconomy:'advancedEconomy',eliteHunting:'advancedHunting',eliteMilitary:'advancedMilitary',unifiedEconomy:'eliteEconomy',unifiedMilitary:'eliteMilitary',advancedPets:'pets'};
export function renderResearchTrees(state,researchDefs,researchCost,costText,afford){const trees=ensureResearchTrees(state);let html='<h2>🔬 Institute Research Trees</h2><p>17 research trees. Advance through foundation, Advanced, Elite and Unified research. Progress saves with your kingdom.</p>';for(const [id,icon,name] of RESEARCH_TREES){const t=trees[id],prev=required[id],castleLevel=Math.max(0,...(state.buildings||[]).filter(b=>b.type==='castle').map(b=>b.level)),castleLocked=(id==='pets'||id==='advancedPets')&&castleLevel<14,locked=castleLocked||(prev&&(trees[prev]?.level||0)<1),done=t.level>=5,price={gold:200*(t.level+1)*(t.level+1),stone:120*(t.level+1)};html+='<div class="item"><div style="display:flex;align-items:center">'+researchEmblem(id)+'<strong>'+name+'</strong></div><p>Tree progress: '+t.level+'/5'+(prev?' · Requires '+RESEARCH_TREES.find(x=>x[0]===prev)[2]+' Lv.1':'')+(castleLocked?' · Castle 14 required':'')+'</p><small>'+costText(price)+'</small><br/><button data-tree-research="'+id+'" '+(locked||done||!afford(price)?'disabled':'')+'>'+(done?'Completed':locked?'Locked':'Research next node')+'</button></div>'}html+='<h3>⚔️ Existing Military Research</h3><p>Legacy army upgrades remain available; they still require an Academy.</p>';for(const [key,r] of Object.entries(researchDefs)){const lvl=state.research[key],cost=researchCost(key);html+='<div class="item"><strong>'+r.icon+' '+r.name+' Lv.'+lvl+'</strong><p>'+r.description+' · Bonus '+lvl*5+'%</p><small>'+costText(cost)+'</small><br/><button data-research="'+key+'" '+(!afford(cost)||!state.buildings.some(b=>b.type==='academy')||state.jobs.some(j=>j.kind==='research')?'disabled':'')+'>Research ('+(20+lvl*15)+'s)</button></div>'}html+='<p>Mythic Heroes and Mythic Jewels tree levels are separate from their existing prototype unlocks, which remain available until prerequisites are integrated.</p>';return html}
export function bindResearchTrees(root,state,save,refresh,rerender,notify){const trees=ensureResearchTrees(state);root.querySelectorAll('[data-tree-research]').forEach(b=>b.onclick=()=>{const id=b.dataset.treeResearch,t=trees[id],prev=required[id];if(!t||t.level>=5||(prev&&(trees[prev]?.level||0)<1))return;const castleLevel=Math.max(0,...(state.buildings||[]).filter(b=>b.type==='castle').map(b=>b.level));if((id==='pets'||id==='advancedPets')&&castleLevel<14)return notify('Castle level 14 required');const cost={gold:200*(t.level+1)*(t.level+1),stone:120*(t.level+1)};if(Object.entries(cost).some(([k,v])=>(state.resources[k]||0)<v))return notify('Not enough resources');for(const [k,v] of Object.entries(cost))state.resources[k]-=v;t.level++;save();refresh();rerender();notify('Research node completed')})}
