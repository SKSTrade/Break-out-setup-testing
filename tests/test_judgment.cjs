const assert=require('node:assert/strict');
const E=require('../engine.js');
const J=require('../judgment.js');
const x={product:'EURUSD',mainTF:'4H',secondaryTF:'1H',entryTF:'15M',mainState:'healthyBull',officialState:'healthyBull',workingState:'healthyBull',gapMode:'off',gapTrigger:'',tradeDirection:'Long',preOpenDirection:'Bull',rawP:'P1',p3Context:'',nativeQ:'Q3',q2Subtypes:[],bheCompletedSession:'London',entrySession:'London',rangeEstablished:true,breakoutSessionValid:true,breakConfirmed:true,holdConfirmed:true,extendConfirmed:true,firstRetestValid:true,retestInSession:true,entryInSession:true,londonBreakoutIntact:true,rr:'2',cleanSpaceR:'2.2',retestVsReclaim:'hold'};
let count=0;
for(const m of Object.keys(E.STATES))for(const s of Object.keys(E.STATES))for(const tradeDirection of ['Long','Short'])for(const rawP of ['P1','P2','P3','P4'])for(const nativeQ of ['Q1','Q2','Q3'])for(const gapMode of ['off','on']){
  const input={...x,mainState:m,officialState:s,workingState:s,tradeDirection,rawP,p3Context:rawP==='P3'?'PB':'',nativeQ,gapMode,gapTrigger:gapMode==='on'?'gap1':''};
  const d=E.evaluate(input),v=J.build(input,d);
  assert.equal(v.finalSize,d.finalSize);
  assert.equal(v.sections.length,4);
  assert.ok(v.sections.flatMap(s=>s.rows).some(([k])=>k==='Enhancement E / P2-E'));
  assert.ok(v.sections.flatMap(s=>s.rows).some(([k])=>k==='原V1.4 E／Rule 1–4'));
  assert.ok(v.explanations.length>=3);
  assert.ok(!v.sections.flatMap(s=>s.rows).some(([k,val])=>String(val).includes('undefined')));
  assert.ok(Object.isFrozen(E));
  assert.equal(d.researchP,input.rawP);
  assert.equal(d.eApplied,false);
  count++;
}
const conflict=J.build({...x,officialState:'healthyBear'},E.evaluate({...x,officialState:'healthyBear'}));
assert.ok(conflict.relationship.includes('方向衝突'));
const weak=J.build({...x,mainState:'weakBull',officialState:'weakBull',rawP:'P3',p3Context:'MID',nativeQ:'Q2'},E.evaluate({...x,mainState:'weakBull',officialState:'weakBull',rawP:'P3',p3Context:'MID',nativeQ:'Q2'}));
assert.equal(weak.finalSize,0);
assert.ok(weak.explanations.some(e=>e.includes('Hypothetical')));
const veto=J.build({...x,manualVeto:true},E.evaluate({...x,manualVeto:true}));
assert.equal(veto.finalSize,0);
assert.ok(veto.explanations.some(e=>e.includes('Hard Veto')));
console.log(`PASS ${count} state/P/Q/direction/gap judgment combinations + conflict + valid-zero + veto`);
