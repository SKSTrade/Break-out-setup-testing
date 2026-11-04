const assert=require('node:assert/strict');
const E=require('../engine.js');
const complete={product:'EURUSD',mainState:'healthyBull',officialState:'healthyBull',workingState:'healthyBull',gapMode:'off',gapTrigger:'',tradeDirection:'Long',preOpenDirection:'Bull',rawP:'P1',p3Context:'',nativeQ:'Q3',q2Subtypes:[],rangeEstablished:true,breakoutSessionValid:true,breakConfirmed:true,holdConfirmed:true,extendConfirmed:true,firstRetestValid:true,retestInSession:true,rr:'2',cleanSpaceR:'2.2',reachedRF:'No'};
const t=(updates={})=>E.evaluate({...complete,...updates});
const specs=[
 ['HH P1 Q3',{},1],['HH P2 Q2',{rawP:'P2',nativeQ:'Q2'},.5],['HH P3-PB Q3',{rawP:'P3',p3Context:'PB'},.5],
 ['HH P3-EXT Q2-F+S',{rawP:'P3',p3Context:'EXT',nativeQ:'Q2',q2Subtypes:['F','S']},.25],
 ['HW P2 Q3',{officialState:'weakBull',rawP:'P2'},.5],['WH P3-PB Q3',{mainState:'weakBull',rawP:'P3',p3Context:'PB'},.25],
 ['WW P3-MID Q2',{mainState:'weakBull',officialState:'weakBull',rawP:'P3',p3Context:'MID',nativeQ:'Q2'},0],
 ['opposed HH',{officialState:'healthyBear'},0],['transition excluded',{officialState:'transitionBull'},0],
 ['P4',{rawP:'P4'},0],['Q1',{nativeQ:'Q1'},0]
];
for(const [name,input,want] of specs){const result=t(input);assert.equal(result.finalSize,want,name);}
assert.equal(t({officialState:'healthyBear',workingState:'healthyBull',gapMode:'on',gapTrigger:'gap1',rawP:'P2'}).finalSize,1,'gap on Working');
assert.equal(t({officialState:'healthyBear',workingState:'healthyBull',gapMode:'off',rawP:'P2'}).finalSize,0,'gap off Official');
assert.equal(t({officialState:'healthyBear',workingState:'healthyBull',gapMode:'on',gapTrigger:'',rawP:'P2'}).finalSize,0,'gap missing trigger');
assert.equal(t({product:'GER40',rawP:'P3',p3Context:'PB',nativeQ:'Q3'}).finalSize,.5,'P3 no E');
const zero=t({mainState:'weakBull',officialState:'weakBull',rawP:'P3',p3Context:'MID',nativeQ:'Q2',normalizedR:'2',mfeR:'5'});
assert.equal(zero.validSetup,'Yes');assert.equal(zero.executable,'No');assert.equal(zero.finalSize,0);assert.equal(zero.actualR,0);assert.equal(zero.tp2,'Yes');
const incomplete=t({extendConfirmed:false});assert.equal(incomplete.validSetup,'No');assert.equal(incomplete.finalSize,0);
assert.equal(t({preOpenDirection:'Bear'}).openingContext,'反向順勢');assert.equal(t({preOpenDirection:''}).finalSize,0);
assert.equal(t({nativeQ:'Q2',q2Subtypes:['F','S']}).finalSize,.5,'F+S must NOT be rule1');
assert.equal(t({rawP:'P3',p3Context:'PB',nativeQ:'Q3',officialState:'healthyBear'}).finalSize,0,'conflict rule3 not applicable');
assert.equal(t({normalizedR:'-1',rawP:'P2'}).actualR,-1);
assert.equal(t({rr:'1.4'}).finalSize,0,'RR veto');assert.equal(t({cleanSpaceR:'1.9'}).finalSize,0,'clean-space veto');
assert.equal(t({timeToRF:'1H30M'}).timeToRF,90);assert.equal(t({timeToRF:'1H30M'}).reachedRF,'Yes');
assert.equal(t({mfeR:''}).tp2,'');assert.equal(t({mfeR:'4'}).tp2,'Yes');assert.equal(t({mfeR:'3.99'}).tp2,'No');
assert.equal(t({normalizedR:'0'}).actualR,0);
assert.equal(E.PRODUCTS.XAUUSD.reference,'Asia High / Low');
assert.equal(E.PRODUCTS.EURUSD.session,'London Session');
assert.equal(t().v14ProductionApplied,false);assert.equal(t().eApplied,false);
let n=0;
const states=Object.keys(E.STATES),positions=['P1','P2','P3','P4'],qs=['Q1','Q2','Q3'];
for(const m of states)for(const s of states)for(const direction of ['Long','Short'])for(const rawP of positions)for(const nativeQ of qs)for(const pre of ['Bull','Bear'])for(const gap of ['off','on']){
  const x=t({mainState:m,officialState:s,workingState:s,gapMode:gap,gapTrigger:'gap1',tradeDirection:direction,rawP,p3Context:rawP==='P3'?'PB':'',nativeQ,preOpenDirection:pre});
  assert.ok([0,.25,.5,1].includes(x.baseSize));assert.ok([0,.25,.5,1].includes(x.finalSize));
  assert.ok(x.finalSize<=x.baseSize);assert.equal(x.researchP,rawP);assert.equal(x.eApplied,false);
  if(x.finalSize>0){assert.equal(x.validSetup,'Yes');assert.equal(x.directionPermission,'Yes');}
  if(['transitionBull','transitionBear','t0'].includes(m)||['transitionBull','transitionBear','t0'].includes(s))assert.equal(x.finalSize,0);
  n++;
}
console.log(`PASS ${specs.length} specified scenarios + 22 edge assertions + ${n} matrix combinations; isolation, P3 no E, F+S no downgrade, BHE, 0-size, Gap, veto, RF/TP2.`);
