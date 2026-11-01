// Android alpha update checker. APK installs always require user confirmation.
const REPO='Paulliiee23/kingdom-ember';
const VERSION='0.9.5-alpha.1';
const RELEASES='https://github.com/'+REPO+'/releases';
function newer(a,b){
 const parts=s=>s.replace(/^v/,'').split('-')[0].split('.').map(v=>Number(v)||0);
 const x=parts(a),y=parts(b);
 for(let i=0;i<3;i++){if((x[i]||0)!==(y[i]||0))return (x[i]||0)>(y[i]||0)}
 return false;
}
export function installAndroidUpdater(){
 const android=Boolean(window.Capacitor?.isNativePlatform?.() && window.Capacitor?.getPlatform?.()==='android');
 if(!android)return;
 const banner=document.createElement('div');
 banner.id='emberAndroidUpdate';
 banner.setAttribute('role','status');
 Object.assign(banner.style,{position:'fixed',top:'72px',left:'50%',transform:'translateX(-50%)',zIndex:'99999',maxWidth:'min(92vw,420px)',padding:'12px 15px',background:'#192231',border:'1px solid #cda65b',borderRadius:'10px',color:'#f6e8ce',boxShadow:'0 8px 30px #0008',font:'14px sans-serif',display:'none'});
 document.body.appendChild(banner);
 const show=(message,link)=>{
  banner.replaceChildren();
  const label=document.createElement('span');label.textContent=message;banner.append(label);
  if(link){const a=document.createElement('a');a.href=link;a.target='_blank';a.rel='noopener noreferrer';a.textContent=' View update';a.style.color='#e5c47e';banner.append(a)}
  const close=document.createElement('button');close.textContent=' ×';close.setAttribute('aria-label','Dismiss update notice');close.style.marginLeft='10px';close.onclick=()=>banner.style.display='none';banner.append(close);
  banner.style.display='block';
 };
 // Release is optional: no network access never blocks gameplay.
 fetch('https://api.github.com/repos/'+REPO+'/releases/latest',{headers:{Accept:'application/vnd.github+json'}})
 .then(r=>{if(!r.ok)throw Error('Release metadata unavailable');return r.json()})
 .then(data=>{
   const tag=String(data.tag_name||'');
   if(!newer(tag,VERSION))return;
   const apk=(data.assets||[]).find(a=>/\.apk$/i.test(a.name||''));
   show('Kingdom Ember '+tag+' is available.',apk?.browser_download_url||data.html_url||RELEASES);
 }).catch(()=>{ /* Offline and unpublished releases are expected during alpha. */ });
}
