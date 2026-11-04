const assert=require('node:assert/strict');
const E=require('../engine.js');
const base={product:'GBPUSD',mainState:'healthyBull',officialState:'healthyBull',workingState:'healthyBull',gapMode:'off',gapTrigger:'',tradeDirection:'Long',preOpenDirection:'Bear',rawP:'P2',p3Context:'',nativeQ:'Q3',q2Subtypes:[],rangeEstablished:true,breakoutSessionValid:true,breakConfirmed:true,holdConfirmed:true,extendConfirmed:true,firstRetestValid:true,retestInSession:true,entryInSession:true,londonBreakoutIntact:true,priorRetestOccurred:false,nyRebreak:false,};
const run=(overrides={})=>E.evaluate({...base,...overrides});
function valid(label, updates, expectedSize=1){const r=run(updates);assert.equal(r.validSetup,'Yes',label+' Valid Setup');assert.equal(r.finalSize,expectedSize,label+' size');return r;}
function invalid(label,updates,reason){const r=run(updates);assert.equal(r.validSetup,'No',label);assert.equal(r.finalSize,0,label);if(reason)assert.ok(r.skipReason.includes(reason),label+' skipReason '+r.skipReason);return r;}
const london=valid('A London break London BHE London Retest/Entry',{bheCompletedSession:'London',entrySession:'London'});
assert.equal(london.breakoutSession,'London Session');
const later=valid('B London break London BHE NY first retest/entry',{bheCompletedSession:'London',entrySession:'New York'});
assert.equal(later.bheCompletedSession,'London');assert.equal(later.entrySession,'New York');
valid('C London break NY BHE NY first retest/entry',{bheCompletedSession:'New York',entrySession:'New York'});
invalid('D NY BHE London Entry impossible',{bheCompletedSession:'New York',entrySession:'London'},'BHE喺NY');
invalid('E Already retested London NY second retest invalid',{bheCompletedSession:'London',entrySession:'New York',priorRetestOccurred:true},'已有較早Retest');
invalid('F London sweep NY fresh breakout invalid',{bheCompletedSession:'New York',entrySession:'New York',nyRebreak:true},'NY重新Breakout');
invalid('G Original London breakout invalidated before NY',{bheCompletedSession:'London',entrySession:'New York',londonBreakoutIntact:false},'原London Breakout已失效');
invalid('H Break only in NY, not London',{bheCompletedSession:'New York',entrySession:'New York',breakoutSessionValid:false},'Breakout唔喺');
invalid('I NY ended, late Entry',{bheCompletedSession:'London',entrySession:'New York',entryInSession:false},'NY結束');
invalid('J no first retest',{bheCompletedSession:'London',entrySession:'New York',firstRetestValid:false});
invalid('K BHE incomplete',{bheCompletedSession:'London',entrySession:'New York',extendConfirmed:false});
invalid('L No entry session specified',{bheCompletedSession:'London',entrySession:''},'Session選項');
invalid('M No BHE session specified',{bheCompletedSession:'',entrySession:'New York'},'Session選項');
invalid('N Retest out of London/NY',{bheCompletedSession:'London',entrySession:'New York',retestInSession:false});
const zero=valid('O Valid 0-size despite NY entry',{bheCompletedSession:'London',entrySession:'New York',mainState:'weakBull',officialState:'weakBull',rawP:'P3',p3Context:'PB',nativeQ:'Q2',normalizedR:'2',mfeR:'4'},0);
assert.equal(zero.status,'Valid 0-size Setup');assert.equal(zero.actualR,0);assert.equal(zero.tp2,'Yes');
const noE=valid('P P3 cannot promote in NY',{bheCompletedSession:'New York',entrySession:'New York',rawP:'P3',p3Context:'PB'},.5);assert.equal(noE.researchP,'P3');assert.equal(noE.eApplied,false);
valid('Q F+S no V1.4 downgrade in NY',{bheCompletedSession:'New York',entrySession:'New York',nativeQ:'Q2',rawP:'P3',p3Context:'EXT',q2Subtypes:['F','S']},.25);
// FX/XAU products all mirror allowed session behavior.
for(const product of ['EURUSD','GBPUSD','USDCHF','XAUUSD']){
  const r=valid('FX '+product,{product,bheCompletedSession:'New York',entrySession:'New York'});
  assert.equal(r.breakoutSession,'London Session');
}
// HSI/GER40 original Session remains the only permitted timeframe, independent of the new FX checkboxes.
for(const product of ['HSI','GER40']){
  const native=E.PRODUCTS[product].session;
  valid('Legacy '+product,{product,bheCompletedSession:native,entrySession:native,entryInSession:false,londonBreakoutIntact:false,priorRetestOccurred:true,nyRebreak:true});
  invalid('Nonoriginal session '+product,{product,bheCompletedSession:'London',entrySession:'New York'},'Session選項');
}
// Historical data migration: when fields entirely absent, the old London-only setup still calculates.
const legacy=valid('Old V0.1.1 CSV still London-only',{});assert.equal(legacy.entrySession,'London');assert.equal(legacy.bheCompletedSession,'London');
// No product-specific override of Core Market State / Risk veto.
invalid('Gap ON not qualified',{gapMode:'on',gapTrigger:'',workingState:'healthyBull',bheCompletedSession:'London',entrySession:'New York'},'Structural Gap');
const retired=run({bheCompletedSession:'London',entrySession:'New York',rr:1.2,cleanSpaceR:0.5});assert.equal(retired.finalSize,1);assert.equal(retired.hardVeto,'No');
const veto=run({bheCompletedSession:'London',entrySession:'New York',manualVeto:true});assert.equal(veto.finalSize,0);assert.equal(veto.hardVeto,'Yes');
assert.equal(run({bheCompletedSession:'New York',entrySession:'New York',mfeR:5}).v14ProductionApplied,false);
console.log('PASS FX/XAU London→NY scenarios A–Q, 4 products, HSI/GER40 isolation, old records, 0-size, P3, F+S, veto.');
