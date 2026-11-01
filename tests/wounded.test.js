import test from 'node:test';
import assert from 'node:assert/strict';
import {routeTierWounded,restoreWounded} from '../src/woundedTroops.js';
const state=()=>({resources:{gold:10000},troops:{infantry:0,archer:0,cavalry:0},infirmaryWounded:{infantry:0,archer:0,cavalry:0},sanctuaryWounded:{infantry:0,archer:0,cavalry:0}});
test('tier 7 wounded return as tier 7',()=>{const s=state();routeTierWounded(s,'infantry',7,5,50,25);assert.equal(restoreWounded(s,'infirmary',10),5);assert.equal(s.tierTroops.infantry[7],5);assert.equal(s.troops.infantry,0)});
test('tier 1 wounded return as tier 1',()=>{const s=state();routeTierWounded(s,'archer',1,3,50,25);restoreWounded(s,'infirmary',10);assert.equal(s.troops.archer,3)});
test('hospital overflow preserves tier in sanctuary',()=>{const s=state();routeTierWounded(s,'cavalry',6,8,3,25);assert.equal(s.infirmaryWounded.cavalry,3);assert.equal(s.sanctuaryWounded.cavalry,5);restoreWounded(s,'sanctuary',20);assert.equal(s.tierTroops.cavalry[6],5)});
test('below castle 25 overflow is lost',()=>{const s=state();const result=routeTierWounded(s,'infantry',4,8,3,24);assert.equal(result.lost,5);assert.equal(s.sanctuaryWounded.infantry,0)});
test('gold limits healing without duplicating troops',()=>{const s=state();s.resources.gold=20;routeTierWounded(s,'infantry',3,5,10,25);assert.equal(restoreWounded(s,'infirmary',10),2);assert.equal(s.tierTroops.infantry[3],2);assert.equal(s.infirmaryWounded.infantry,3)});
