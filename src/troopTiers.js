export const TROOP_TIERS=[1,2,3,4,5,6,7];
export function troopTierUnlocked(state,tier){if(tier===1)return true;const trees=state.researchTrees||{};return tier<=5?(trees.military?.level||0)>=tier-1:(trees.military?.level||0)>=4&&(trees.advancedMilitary?.level||0)>=tier-5}
export function troopTierRequirement(tier){return tier===1?'Available from the beginning':tier<=5?'Military research level '+(tier-1):'Advanced Military research level '+(tier-5)+' (Military IV required)'}
export function troopTierCost(unit,tier,count=10){const base={infantry:{food:30,gold:15},archer:{food:25,wood:20,gold:20},cavalry:{food:45,gold:40}}[unit];if(!base)return null;const multiplier=Math.pow(2,tier-1);return Object.fromEntries(Object.entries(base).map(([k,v])=>[k,Math.ceil(v*count*multiplier)]))}
export function troopTierDuration(unit,tier){return (unit==='cavalry'?35000:20000)*Math.pow(1.5,tier-1)}
export function tierTroops(state){state.tierTroops??={};for(const unit of ['infantry','archer','cavalry']){state.tierTroops[unit]??={};for(let tier=2;tier<=7;tier++)state.tierTroops[unit][tier]??=0}return state.tierTroops}
export function finishTierTraining(state,job){tierTroops(state)[job.unit][job.tier]=(tierTroops(state)[job.unit][job.tier]||0)+job.count}
