import test from 'node:test';
import assert from 'node:assert/strict';
import {offensiveAction,FURY_DURATION_MS,furyRemaining} from '../src/battleFury.js';
const at=1_700_000_000_000;
test('player attack removes shield and triggers Fury',()=>{const s={shieldSystem:{until:at+60000,inventory:{}}};const x=offensiveAction(s,{kind:'attack',target:'player',at});assert.equal(x.shieldDropped,true);assert.equal(s.shieldSystem.until,0);assert.equal(furyRemaining(s,at),FURY_DURATION_MS)});
test('player scouting triggers Fury',()=>{const s={};assert.equal(offensiveAction(s,{kind:'scout',target:'player',at}).fury,true)});
test('guardian and monster actions do not trigger Fury',()=>{const s={shieldSystem:{until:at+60000}};assert.equal(offensiveAction(s,{kind:'attack',target:'monster',at}).fury,false);assert.equal(offensiveAction(s,{kind:'scout',target:'guardian',at}).fury,false);assert.equal(s.shieldSystem.until,at+60000)});
test('repeated hostile action extends but never shortens Fury',()=>{const s={};offensiveAction(s,{kind:'attack',target:'player',at});offensiveAction(s,{kind:'scout',target:'player',at:at+2000});assert.equal(furyRemaining(s,at+2000),FURY_DURATION_MS);offensiveAction(s,{kind:'attack',target:'player',at:at+1000});assert.equal(s.fury.until,at+2000+FURY_DURATION_MS)});
