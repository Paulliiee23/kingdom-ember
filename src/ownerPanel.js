// Kingdom Ember v0.9.4 — offline single-player developer controls.
// Never ship this module as multiplayer authorization: all online grants must be server-verified.
export function installOwnerPanel({state,save,redraw,refresh,notify}) {
  const backupKey='kingdomEmberOwnerBackup_v094';
  const limits={building:30,research:25,kingdom:100,troops:1000000,resources:100000000};
  const snapshot=()=>{if(!localStorage.getItem(backupKey))localStorage.setItem(backupKey,JSON.stringify(state));};
  const complete=(message)=>{save();redraw();refresh();notify(message);};
  const overlay=document.createElement('section');
  overlay.id='emberOwnerPanel';
  overlay.setAttribute('aria-label','Owner testing controls');
  overlay.style.cssText='position:fixed;z-index:99999;right:12px;top:70px;width:min(360px,calc(100vw - 24px));max-height:76vh;overflow:auto;background:#171025;color:#f8efff;border:1px solid #9b6bd5;border-radius:16px;padding:16px;box-shadow:0 12px 50px #0009;font:14px system-ui;display:none';
  const toggle=document.createElement('button');
  toggle.textContent='♛ OWNER';toggle.title='Local single-player test tools';
  toggle.style.cssText='position:fixed;z-index:99998;right:12px;top:12px;background:#59248b;color:white;border:1px solid #a876dd;border-radius:12px;padding:12px;font-weight:700;cursor:pointer';
  document.body.append(overlay);
  const bottomToggle=document.querySelector('#ownerBottomButton');
  const ownerToggle=bottomToggle||toggle;
  if(!bottomToggle)document.body.append(toggle);
  ownerToggle.onclick=()=>{const open=overlay.style.display==='none';overlay.style.display=open?'block':'none';ownerToggle.setAttribute('aria-expanded',String(open));};
  const button=(label,fn)=>{const el=document.createElement('button');el.textContent=label;el.style.cssText='background:#67339d;color:white;border:1px solid #b48bd7;border-radius:9px;padding:10px;margin:4px;cursor:pointer';el.onclick=()=>{try{fn();}catch(error){console.error(error);notify('Owner action failed; save unchanged where possible');}};overlay.append(el);};
  const maxBuildings=()=>{for(const b of state.buildings||[])b.level=Math.max(b.level||1,limits.building);};
  const maxResearch=()=>{for(const k of Object.keys(state.research||{}))state.research[k]=limits.research;};
  const maxTroops=()=>{for(const k of Object.keys(state.troops||{}))state.troops[k]=limits.troops;};
  const maxResources=()=>{for(const k of Object.keys(state.resources||{}))state.resources[k]=limits.resources;};
  const finishJobs=()=>{for(const j of state.jobs||[]){if(j.kind==='train'&&j.unit)state.troops[j.unit]=(state.troops[j.unit]||0)+(j.count||0);else if(j.kind==='research'&&j.key in state.research)state.research[j.key]=(state.research[j.key]||0)+1;else if(j.kind==='upgrade'){const b=state.buildings.find(b=>b.x===j.x&&b.z===j.z);if(b)b.level=Math.min(limits.building,(b.level||1)+1);}}state.jobs=[];};
  const action=(fn,message)=>{snapshot();fn();complete(message);};
  const title=document.createElement('h2');title.textContent='♛ Kingdom Ember 0.9.4 — Owner';title.style.margin='0 0 8px';overlay.append(title);
  const note=document.createElement('p');note.textContent='OFFLINE TEST ONLY. The first owner action saves a restore point. Finish buttons only complete active jobs; they do not grant levels or bypass normal build/research costs.';overlay.append(note);
  button('✕ Close',()=>overlay.style.display='none');
  button('🛡️ Activate 1-hour Test Shield',()=>action(()=>{state.shieldSystem??={until:0,inventory:{}};state.shieldSystem.until=Date.now()+3600000;},'Test shield active for 1 hour — check the castle dome'));
  button('🛡️ Remove Test Shield',()=>action(()=>{state.shieldSystem??={until:0,inventory:{}};state.shieldSystem.until=0;},'Test shield removed'));
  button('💎 Refill Resources',()=>action(maxResources,'Treasury refilled'));
  button('🏗️ Finish Build / Upgrade',()=>action(()=>{const jobs=(state.jobs||[]).filter(j=>j.kind==='upgrade');for(const j of jobs){const b=state.buildings.find(b=>b.x===j.x&&b.z===j.z);if(b)b.level=Math.min(limits.building,(b.level||1)+1)}state.jobs=state.jobs.filter(j=>j.kind!=='upgrade');},'Construction timers completed — normal progression preserved'));
  button('📜 Finish Research',()=>action(()=>{const jobs=(state.jobs||[]).filter(j=>j.kind==='research');for(const j of jobs)if(Object.prototype.hasOwnProperty.call(state.research,j.key))state.research[j.key]=(state.research[j.key]||0)+1;state.jobs=state.jobs.filter(j=>j.kind!=='research');for(const j of state.treeResearchJobs||[]){state.researchTrees??={};state.researchTrees[j.id]??={level:0};state.researchTrees[j.id].level=Math.max(state.researchTrees[j.id].level,j.level)}state.treeResearchJobs=[];},'Research timers completed — normal progression preserved'));
  button('⚔️ Finish Training',()=>action(()=>{const jobs=(state.jobs||[]).filter(j=>j.kind==='train');for(const j of jobs)if(j.unit){if(j.tier>1){state.tierTroops??={};state.tierTroops[j.unit]??={};state.tierTroops[j.unit][j.tier]=(state.tierTroops[j.unit][j.tier]||0)+(j.count||0)}else state.troops[j.unit]=(state.troops[j.unit]||0)+(j.count||0)}state.jobs=state.jobs.filter(j=>j.kind!=='train');},'Training completed'));
  button('↶ Restore original owner backup',()=>{const raw=localStorage.getItem(backupKey);if(!raw)return notify('No owner backup exists');if(!confirm('Restore original backup? Current progress will be overwritten.'))return;const restored=JSON.parse(raw);Object.keys(state).forEach(k=>delete state[k]);Object.assign(state,restored);complete('Original backup restored');});
}
