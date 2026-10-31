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
  document.body.append(toggle,overlay);
  toggle.onclick=()=>{overlay.style.display=overlay.style.display==='none'?'block':'none';};
  const button=(label,fn)=>{const el=document.createElement('button');el.textContent=label;el.style.cssText='background:#67339d;color:white;border:1px solid #b48bd7;border-radius:9px;padding:10px;margin:4px;cursor:pointer';el.onclick=()=>{try{fn();}catch(error){console.error(error);notify('Owner action failed; save unchanged where possible');}};overlay.append(el);};
  const maxBuildings=()=>{for(const b of state.buildings||[])b.level=Math.max(b.level||1,limits.building);};
  const maxResearch=()=>{for(const k of Object.keys(state.research||{}))state.research[k]=limits.research;};
  const maxTroops=()=>{for(const k of Object.keys(state.troops||{}))state.troops[k]=limits.troops;};
  const maxResources=()=>{for(const k of Object.keys(state.resources||{}))state.resources[k]=limits.resources;};
  const finishJobs=()=>{for(const j of state.jobs||[]){if(j.kind==='train'&&j.unit)state.troops[j.unit]=(state.troops[j.unit]||0)+(j.count||0);else if(j.kind==='research'&&j.key in state.research)state.research[j.key]=(state.research[j.key]||0)+1;else if(j.kind==='upgrade'){const b=state.buildings.find(b=>b.x===j.x&&b.z===j.z);if(b)b.level=Math.min(limits.building,(b.level||1)+1);}}state.jobs=[];};
  const action=(fn,message)=>{snapshot();fn();complete(message);};
  const title=document.createElement('h2');title.textContent='♛ Kingdom Ember 0.9.4 — Owner';title.style.margin='0 0 8px';overlay.append(title);
  const note=document.createElement('p');note.textContent='OFFLINE TEST ONLY. The first owner action saves a restore point. Hero equipment and player sponsorship are not yet implemented.';overlay.append(note);
  button('✕ Close',()=>overlay.style.display='none');
  button('💎 Refill Resources',()=>action(maxResources,'Treasury refilled'));
  button('🏰 Max Buildings (Lv 30)',()=>action(()=>{maxBuildings();state.jobs=state.jobs.filter(j=>j.kind!=='upgrade');},'Buildings maxed to level 30'));
  button('📜 Max Research',()=>action(()=>{maxResearch();state.jobs=state.jobs.filter(j=>j.kind!=='research');},'Research maxed'));
  button('⚔️ Max Troops',()=>action(()=>{maxTroops();state.jobs=state.jobs.filter(j=>j.kind!=='train');},'Troops maxed'));
  button('⭐ Max Kingdom Level',()=>action(()=>{state.level=limits.kingdom;state.xp=0;},'Kingdom level maxed'));
  button('⏱ Complete Build / Research / Train',()=>action(finishJobs,'Queued jobs completed'));
  button('🔷 Unified Citadel +1',()=>action(()=>{const castle=state.buildings.find(b=>b.type==='castle');if(!castle)throw Error('No castle');castle.level=Math.max(castle.level,30);state.castleUnifiedLevel=(Number(state.castleUnifiedLevel)||0)+1;},'Unified Citadel stage increased'));
  button('👑 MAX EVERYTHING',()=>{if(!confirm('Max all current systems? Your original save will be backed up on first use.'))return;action(()=>{maxBuildings();maxResearch();maxTroops();maxResources();state.level=limits.kingdom;state.xp=0;state.jobs=[];},'All available systems maxed');});
  button('↶ Restore original owner backup',()=>{const raw=localStorage.getItem(backupKey);if(!raw)return notify('No owner backup exists');if(!confirm('Restore original backup? Current progress will be overwritten.'))return;const restored=JSON.parse(raw);Object.keys(state).forEach(k=>delete state[k]);Object.assign(state,restored);complete('Original backup restored');});
}
