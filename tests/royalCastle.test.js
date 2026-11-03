import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const castle=readFileSync(new URL('../src/royalCastleArtwork.js',import.meta.url),'utf8');
const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const sprites=readFileSync(new URL('../src/castleSprites.js',import.meta.url),'utf8');

test('royal castle has all six architectural tiers through level 35',()=>{
 for(const at of [1,8,15,22,29,35]){
  assert.match(castle,new RegExp('at:'+at+'\\b'));
 }
 assert.match(castle,/export function createRoyalCastleArtwork\(level\)/);
 assert.match(castle,/clampLevel\(level\)/);
});
test('castle uses dedicated 2.5D illustration instead of generic building art',()=>{
 assert.match(main,/createCastleSprite\(level\)\|\|createRoyalCastleArtwork\(level\)/);
 assert.match(main,/foundation\.receiveShadow=true/);
 assert.match(main,/g\.userData\.building=b/);
});
test('castle art is positioned at ground level with no stretched imported sprite',()=>{
 assert.match(castle,/sprite\.position\.set\(0,2\.48,0\)/);
 assert.match(sprites,/mesh\.position\.set\(0,height\/2,0\)/);
 assert.match(sprites,/height\*aspect/);
});
test('downloaded castle art refreshes the visible city automatically',()=>{
 assert.match(sprites,/onCastleArtworkReady/);
 assert.match(main,/onCastleArtworkReady\(\(\)=>/);
});
