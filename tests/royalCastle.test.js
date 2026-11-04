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
test('castle uses level-specific GLB meshes with procedural fallback',()=>{
 const loader=readFileSync(new URL('../src/castleGLBLoader.js',import.meta.url),'utf8');
 for(const name of ['castle-1-8.glb','castle-9-16.glb','castle-17-24.glb','castle-25-30.glb'])assert.ok(loader.includes(name));
 assert.match(main,/loadTierCastle\(level\)/);
 assert.match(main,/emberFortress\(g,level,unified,3\.45\)/);
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

test('castle footprint prevents overlapping plots and migrates older saves',()=>{
 assert.ok(main.includes('function buildingHalfSize(b)'));
 assert.ok(main.includes('function migrateCastleFootprint()'));
 assert.ok(main.includes('migrateCastleFootprint();'));
});
