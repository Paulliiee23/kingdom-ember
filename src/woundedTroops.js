import {tierTroops} from './troopTiers.js';
const UNITS=['infantry','archer','cavalry'];
export function woundedCount(s,place){return UNITS.reduce((n,u)=>n+(s[place]?.[u]||0),0)}
export function routeTierWounded(s,unit,tier,count,capacity,castleLevel){
 if(!UNITS.includes(unit)||!Number.isInteger(tier)||tier<1||tier>7||!Number.isSafeInteger(count)||count<0)throw Error('Invalid wounded troop record');
 if(!count)return {hospital:0,sanctuary:0,lost:0};
 const room=Math.max(0,capacity-woundedCount(s,'infirmaryWounded'));
 const hospital=Math.min(count,room),overflow=count-hospital,sanctuary=castleLevel>=25?overflow:0;
 for(const [place,n] of [['infirmary',hospital],['sanctuary',sanctuary]])if(n){
  const key=place+'Wounded',tierKey=place+'TierWounded';
  s[key]??={};s[key][unit]=(s[key][unit]||0)+n;
  if(tier>1){s[tierKey]??={};s[tierKey][unit]??={};s[tierKey][unit][tier]=(s[tierKey][unit][tier]||0)+n}
 }
 return {hospital,sanctuary,lost:overflow-sanctuary};
}
export function restoreWounded(s,place,goldPerTroop){
 const key=place+'Wounded',tierKey=place+'TierWounded',available=woundedCount(s,key);
 let remaining=Math.min(available,Math.floor((s.resources?.gold||0)/goldPerTroop));
 const restored=remaining;if(!restored)return 0;
 s.resources.gold-=restored*goldPerTroop;
 for(const unit of UNITS){
  const tiers=s[tierKey]?.[unit]||{};
  for(const tier of Object.keys(tiers).sort((a,b)=>Number(b)-Number(a))){
   const count=Math.min(remaining,tiers[tier],s[key]?.[unit]||0);
   tiers[tier]-=count;s[key][unit]-=count;tierTroops(s)[unit][tier]+=count;remaining-=count;
  }
  const basic=Math.min(remaining,s[key]?.[unit]||0);
  s[key][unit]-=basic;s.troops[unit]=(s.troops[unit]||0)+basic;remaining-=basic;
 }
 return restored-remaining;
}
