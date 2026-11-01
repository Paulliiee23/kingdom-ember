export const COUNTERS={infantry:'archer',archer:'cavalry',cavalry:'infantry'};
export const BASE_POWER={infantry:10,archer:13,cavalry:19};
export const FORMATIONS={balanced:{attack:1,defense:1},shield:{attack:.92,defense:1.2},volley:{attack:1.14,defense:.91},flank:{attack:1.09,defense:.96}};
export function tierPower(tier){return Math.pow(1.7,Math.max(0,tier-1))}
export function simulateBattle(attacker,defender,{formation='balanced',attackBonus=0,defenseBonus=0}={}){
 const f=FORMATIONS[formation]||FORMATIONS.balanced;
 const groups=(army)=>Object.entries(army).flatMap(([unit,value])=>{if(!BASE_POWER[unit])return [];if(typeof value==='number')return value>0?[{unit,tier:1,count:value}]:[];return Object.entries(value||{}).filter(([,n])=>n>0).map(([tier,count])=>({unit,tier:Number(tier),count}))});
 const a=groups(attacker),d=groups(defender);const score=(own,enemy,bonus,modifier)=>own.reduce((sum,g)=>{const enemyCount=enemy.reduce((n,e)=>n+e.count,0);const vulnerable=enemy.filter(e=>COUNTERS[g.unit]===e.unit).reduce((n,e)=>n+e.count,0);const counter=enemyCount?1+.3*vulnerable/enemyCount:1;return sum+g.count*BASE_POWER[g.unit]*tierPower(g.tier)*counter},0)*(1+bonus)*modifier;
 const attackPower=score(a,d,attackBonus,f.attack),defensePower=score(d,a,defenseBonus,f.defense);const win=attackPower>=defensePower;
 const casualtyRate=Math.min(.85,Math.max(.04,(win?.12:.38)*(defensePower/Math.max(1,attackPower))**.3));
 const losses={};for(const g of a){const n=Math.min(g.count,Math.ceil(g.count*casualtyRate));(losses[g.unit]??={})[g.tier]=n}
 return {win,attackPower:Math.round(attackPower),defensePower:Math.round(defensePower),casualtyRate,losses,counters:COUNTERS,formation};
}
