import test from 'node:test';
import assert from 'node:assert/strict';
import {guildState,tickRallies,RALLY_TARGETS,GUILD_ALLIES} from '../src/guildRallies.js';
const setup=(target='player',autoJoin=true)=>{
const s={research:{attack:0}};
const g=guildState(s);g.rallies.push({id:'test',target,status:'preparing',joined:[],started:100000,ready:130000,autoJoin});return {s,g};
};
test('all three simulated guild members join in order',()=>{
const {s,g}=setup();const messages=[];
assert.equal(tickRallies(s,x=>messages.push(x),104999),false);
tickRallies(s,x=>messages.push(x),105000);assert.deepEqual(g.rallies[0].joined,['a']);
tickRallies(s,x=>messages.push(x),110000);assert.deepEqual(g.rallies[0].joined,['a','b']);
tickRallies(s,x=>messages.push(x),115000);assert.deepEqual(g.rallies[0].joined,['a','b','c']);
assert.equal(new Set(g.rallies[0].joined).size,3);
});
test('auto join can be disabled for manual rally tests',()=>{
const {s,g}=setup('player',false);tickRallies(s,()=>{},115000);assert.deepEqual(g.rallies[0].joined,[]);
tickRallies(s,()=>{},130000);assert.equal(g.rallies[0].status,'waiting');
});
test('rally launches, resolves, and creates participant report',()=>{
const {s,g}=setup('scout');tickRallies(s,()=>{},130000);
assert.equal(g.rallies[0].status,'marching');
assert.deepEqual(g.rallies[0].joined,['a','b','c']);
tickRallies(s,()=>{},160000);
assert.equal(g.rallies.length,0);assert.equal(g.reports.length,1);
assert.equal(g.reports[0].target,'scout');
assert.deepEqual(g.reports[0].participants,['a','b','c']);
});
test('dummy targets have distinct defender strengths',()=>{
assert.equal(RALLY_TARGETS.length,5);
const strengths=RALLY_TARGETS.map(t=>Object.values(t.army).reduce((a,b)=>a+b,0));
assert.ok(strengths[1]<strengths[2]);assert.ok(strengths[2]<strengths[3]);
assert.equal(GUILD_ALLIES.length,3);
});
test('old saved rallies do not automatically recruit allies',()=>{
const {s,g}=setup();delete g.rallies[0].autoJoin;tickRallies(s,()=>{},115000);assert.deepEqual(g.rallies[0].joined,[]);
});
