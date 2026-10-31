// Kingdom Ember owner tools — LOCAL SINGLE-PLAYER PROTOTYPE ONLY.
// This is NOT authentication. Do not expose these controls in multiplayer.
// Multiplayer grants must be checked and executed by an authenticated server.
export function installOwnerPanel({state,save,redraw,refresh,notify}) {
  const LIMITS={building:25,research:25,kingdom:100,troops:1000000,resources:100000000};
  const backup=()=>{const key='kingdomEmberOwnerBackup';if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(state));};
  const finish=(message)=>{save();redraw();refresh();render();notify(message);};
  const overlay=document.createElement('section');
  overlay.id='emberOwnerPanel';
  overlay.setAttribute('aria-label','Owner developer controls');
  overlay.style.cssText='position:fixed;z-index:99999;right:12px;top:75px;width:min(360px,calc(100vw - 24px));max-height:75vh;overflow:auto;background:#171025;color:#f8efff;border:1px solid #9b6bd5;border-radius:16px;padding:16px;box-shadow:0 12px 50px #0009;font:14px system-ui;display:none';
  document.body.append(overlay);
  const toggle=document.createElement('button');
  toggle.textContent='♛ OWNER';
  toggle.title='Local prototype owner tools — not multiplayer permissions';
  toggle.style.cssText='position:fixed;z-index:99998;right:12px;top:12px;background:#59248b;color:white;border:1px solid #a876dd;border-radius:12px;padding:12px;font-weight:700;cursor:pointer';
  document.body.append(toggle);
  toggle.onclick=()=>{overlay.style.display=overlay.style.display==='none'?'block':'none';render();};
  const action=(name,fn)=>{const b=document.createElement('button');b.textContent=name;b.style.cssText='background:#67339d;color:#fff;border:1px solid #b48bd7;border-radius:9px;padding:10px;margin:4px;cursor:pointer';b.onclick=fn;overlay.append(b);};
  function render(){
    overlay.replaceChildren();
    const heading=document.createElement('h2');heading.textContent='♛ Kingdom Control Panel';heading.style.margin='0 0 8px';overlay.append(heading);
    const warning=document.createElement('p');warning.textContent='Local single-player developer tools. No account authentication or online sponsorship yet.';warning.style.opacity='.8';overlay.append(warning);
    action('✕ Close',()=>overlay.style.display='none');
    action('💎 Refill Resources',()=>{backup();for(const k of Object.keys(state.resources))state.resources[k]=LIMITS.resources;finish('Royal treasury replenished');});
    action('🏰 Max Buildings',()=>{backup();for(const b of state.buildings)b.level=LIMITS.building;state.jobs=state.jobs.filter(j=>j.kind!=='upgrade');finish('All existing buildings at level '+LIMITS.building);});
    action('📜 Max Research',()=>{backup();for(const k of Object.keys(state.research))state.research[k]=LIMITS.research;state.jobs=state.jobs.filter(j=>j.kind!=='research');finish('Research maxed');});
    action('⚔️ Max Troops',()=>{backup();for(const k of Object.keys(state.troops))state.troops[k]=LIMITS.troops;state.jobs=state.jobs.filter(j=>j.kind!=='train');finish('Army reinforced');});
    action('⭐ Max Kingdom Level',()=>{backup();state.level=LIMITS.kingdom;state.xp=0;finish('Kingdom level maxed');});
    action('⏱ Finish Timers',()=>{backup();for(const j of state.jobs){if(j.kind==='train')state.troops[j.unit]=(state.troops[j.unit]||0)+j.count;else if(j.kind==='research'&&j.key in state.research)state.research[j.key]++;else if(j.kind==='upgrade'){const b=state.buildings.find(b=>b.x===j.x&&b.z===j.z);if(b)b.level++;}}state.jobs=[];finish('Construction, research and training completed');});
    action('👑 MAX EVERYTHING',()=>{if(!confirm('Max all current buildings, research, troops, level and resources? A one-time backup will be saved.'))return;backup();for(const b of state.buildings)b.level=LIMITS.building;for(const k of Object.keys(state.research))state.research[k]=LIMITS.research;for(const k of Object.keys(state.troops))state.troops[k]=LIMITS.troops;for(const k of Object.keys(state.resources))state.resources[k]=LIMITS.resources;state.level=LIMITS.kingdom;state.xp=0;state.jobs=[];finish('Royal max upgrade complete!');});
    action('↶ Restore pre-owner backup',()=>{const raw=localStorage.getItem('kingdomEmberOwnerBackup');if(!raw)return notify('No backup exists yet');if(!confirm('Restore your pre-owner save? Current progress will be replaced.'))return;const restored=JSON.parse(raw);for(const key of Object.keys(state))delete state[key];Object.assign(state,restored);finish('Backup restored');});
    const note=document.createElement('p');note.textContent='Hero gear and sponsorship will be enabled when those systems exist in this build. Caps are prototype values, not final game balance.';note.style.opacity='.8';overlay.append(note);
  }
  render();
}
