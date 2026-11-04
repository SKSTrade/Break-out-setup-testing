/* Break out setup testing | Research V0.1
 * PURE rules engine — no reference to Master Trade V1.4 production/shadow functions.
 * Dual H/W only, Raw P only, V1.3 Base Matrix, explicit Setup/Hard veto checks.
 */
(function(root,factory){
  const engine=factory();
  if(typeof module==='object' && module.exports) module.exports=engine;
  root.BreakoutEngine=engine;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const STATES={
    healthyBull:{label:'Healthy Bull｜健康升勢',kind:'H',bias:'up'},
    weakBull:{label:'Weak Bull｜弱升勢',kind:'W',bias:'up'},
    transitionBull:{label:'Transition Bull｜轉換偏升',kind:'T',bias:'up'},
    t0:{label:'T0｜轉換中性',kind:'T0',bias:null},
    transitionBear:{label:'Transition Bear｜轉換偏跌',kind:'T',bias:'down'},
    weakBear:{label:'Weak Bear｜弱跌勢',kind:'W',bias:'down'},
    healthyBear:{label:'Healthy Bear｜健康跌勢',kind:'H',bias:'down'}
  };
  const PRODUCTS={
    HSI:{reference:'OPR',session:'HSI Opening Session',family:'HSI OPR Breakout'},
    GER40:{reference:'POR',session:'GER40 European Opening Session',family:'GER40 POR Breakout'},
    EURUSD:{reference:'Asia High / Low',session:'London Session',family:'FX Asia Range Breakout'},
    GBPUSD:{reference:'Asia High / Low',session:'London Session',family:'FX Asia Range Breakout'},
    USDCHF:{reference:'Asia High / Low',session:'London Session',family:'FX Asia Range Breakout'},
    XAUUSD:{reference:'Asia High / Low',session:'London Session',family:'XAU Asia Range Breakout'}
  };
  const SIZES=[0,0.25,0.5,1];
  const FX_XAU=new Set(['EURUSD','GBPUSD','USDCHF','XAUUSD']);
  const isFxXau=product=>FX_XAU.has(product);
  const Q2_SUBTYPES=['R','F','S','D','RR','Structured'];
  const RESEARCH_PERIOD=['2024-07-01','2026-06-30'];
  function toNumber(value){if(value===null||value===undefined||String(value).trim()==='')return null;const n=Number(value);return Number.isFinite(n)?n:null;}
  function duration(value){const s=String(value??'').trim().toUpperCase().replace(/\s+/g,'');if(!s)return null;if(/^\d+$/.test(s))return Number(s);const m=s.match(/^(?:(\d+)H)?(?:(\d+)M)?$/);if(!m||(!m[1]&&!m[2]))return NaN;return Number(m[1]||0)*60+Number(m[2]||0);}
  function durationText(value){if(value===null||!Number.isFinite(Number(value)))return '';const n=Number(value);return `${Math.floor(n/60)}H ${String(n%60).padStart(2,'0')}M`;}
  function isConfirmed(state){return STATES[state]&&['H','W'].includes(STATES[state].kind);}
  function judge({gapMode,officialState,workingState,gapTrigger}){
    const gapOn=gapMode==='on';
    return {source:gapOn?'Working':'Official',effective:gapOn?workingState:officialState,gapQualified:!gapOn||['gap1','gap2'].includes(gapTrigger)};
  }
  function permission(main,secondary,trade){
    return Boolean(isConfirmed(main)&&isConfirmed(secondary)&&STATES[main].bias===STATES[secondary].bias&&STATES[main].bias===(trade==='Long'?'up':'down'));
  }
  function context(preOpen,main,secondary,trade){
    if(!['Bull','Bear'].includes(preOpen)||!permission(main,secondary,trade))return '';
    return (preOpen==='Bull'?'up':'down')===(trade==='Long'?'up':'down')?'順向順勢':'反向順勢';
  }
  function baseSize(main,secondary,trade,rawP,q){
    if(!permission(main,secondary,trade)||!['P1','P2','P3','P4'].includes(rawP)||!['Q1','Q2','Q3'].includes(q)||rawP==='P4'||q==='Q1')return 0;
    const doubleHealthy=STATES[main].kind==='H'&&STATES[secondary].kind==='H';
    const premium=rawP==='P1'||rawP==='P2';
    if(doubleHealthy){return premium?(q==='Q3'?1:0.5):(q==='Q3'?0.5:0.25);}
    return premium?(q==='Q3'?0.5:0.25):(q==='Q3'?0.25:0);
  }
  function evaluate(input){
    const {mainState,officialState,workingState,gapMode,gapTrigger,tradeDirection,preOpenDirection,rawP,nativeQ}=input;
    const j=judge({gapMode,officialState,workingState,gapTrigger});
    const allowed=permission(mainState,j.effective,tradeDirection);
    const openingContext=context(preOpenDirection,mainState,j.effective,tradeDirection);
    const bhe=Boolean(input.breakConfirmed&&input.holdConfirmed&&input.extendConfirmed);
    const pComplete=rawP!=='P3'||['PB','MID','EXT'].includes(input.p3Context);
    // London must originate the Break; NY may ONLY complete the same BHE/first retest.
    // HSI / GER40 retain their previous opening-session window.
    const fx=isFxXau(input.product);
    const breakoutSession=PRODUCTS[input.product]?.session||'';
    // Compatibility with V0.1.1 London-only records; new forms provide explicit selections.
    const bheSession=input.bheCompletedSession===undefined?(fx?'London':breakoutSession):input.bheCompletedSession;
    const entrySession=input.entrySession===undefined?(fx?'London':breakoutSession):input.entrySession;
    const sessionChoicesValid=fx?
      (['London','New York'].includes(bheSession)&&['London','New York'].includes(entrySession)):
      (bheSession===breakoutSession&&entrySession===breakoutSession);
    const bheBeforeOrDuringEntry=!fx||bheSession==='London'||entrySession==='New York';
    const entryInSession=!fx||input.entryInSession===undefined?true:Boolean(input.entryInSession);
    const londonBreakoutIntact=input.londonBreakoutIntact===undefined?true:Boolean(input.londonBreakoutIntact);
    const priorRetestOccurred=Boolean(input.priorRetestOccurred);
    const nyRebreak=Boolean(input.nyRebreak);
    const continuationValid=!fx||(londonBreakoutIntact&&!priorRetestOccurred&&!nyRebreak);
    const sessionValid=Boolean(input.rangeEstablished&&input.breakoutSessionValid&&input.retestInSession&&
      sessionChoicesValid&&bheBeforeOrDuringEntry&&entryInSession&&continuationValid);

    const firstRetest=Boolean(input.firstRetestValid);
    // Numerical RR / Clean Expansion Space inputs are retired in V0.1.4.
    // Ignore old imported/stored values entirely: only explicit execution vetoes apply.
    const hardVeto=Boolean(input.lateEntry||input.invalidExecution||input.htfObstacle||input.manualVeto);
    const validSetup=Boolean(j.gapQualified&&allowed&&openingContext&&bhe&&firstRetest&&sessionValid&&pComplete);
    const base=baseSize(mainState,j.effective,tradeDirection,rawP,nativeQ);
    const finalSize=validSetup&&!hardVeto?base:0;
    const executable=validSetup&&finalSize>0;
    const status=!validSetup?'Invalid / Skipped':executable?'Executable Entry':'Valid 0-size Setup';
    const reasons=[];
    if(!j.gapQualified)reasons.push('Structural Gap ON未指定合格Trigger');
    if(!allowed)reasons.push('Direction Permission = No（需雙Healthy/Weak同向且Trade順共同方向）');
    if(!openingContext)reasons.push('Opening Context未能按Breakout前方向確定');
    if(!input.rangeEstablished)reasons.push('Reference Range未建立');
    if(!input.breakoutSessionValid)reasons.push('Breakout唔喺指定Opening/London Session');
    if(!bhe)reasons.push('Entry前Break + Hold + Extend未全部成立');
    if(!firstRetest)reasons.push('冇First Valid Retest');
    if(!input.retestInSession)reasons.push('First Retest未喺指定Session完成（FX/XAU可London或NY）');
    if(!sessionChoicesValid)reasons.push('BHE/Entry Session選項不符合產品允許時段');
    if(!bheBeforeOrDuringEntry)reasons.push('BHE喺NY先完成，唔可以London已入場');
    if(!entryInSession)reasons.push('Entry唔喺指定Session內／已超過同一交易週期NY結束');
    if(fx&&!londonBreakoutIntact)reasons.push('原London Breakout已失效，唔可以NY重新成立');
    if(fx&&priorRetestOccurred)reasons.push('已有較早Retest，NY第二次Retest不可當First Retest');
    if(fx&&nyRebreak)reasons.push('London原突破未被接受／失效；NY重新Breakout不合資格');
    if(!pComplete)reasons.push('Raw P3未指定PB/MID/EXT');
    if(input.lateEntry)reasons.push('Late entry / Session invalid');
    if(input.invalidExecution)reasons.push('Execution invalid');
    if(input.htfObstacle)reasons.push('Hard HTF obstacle');
    if(input.manualVeto)reasons.push('其他V1.3 Hard Veto');
    if(validSetup&&!hardVeto&&base===0)reasons.push('有效Setup，但V1.3 Raw P×Native Q base matrix = 0');
    const nR=toNumber(input.normalizedR),mfe=toNumber(input.mfeR);
    const minutes=duration(input.timeToRF);
    const tp2=mfe===null?'':(mfe>=4?'Yes':'No');
    const actualR=nR===null?null:Number((nR*finalSize).toFixed(8));
    return {
      project:'Break out setup testing',version:'Research V0.1',
      family:PRODUCTS[input.product]?.family||'',
      referenceRange:PRODUCTS[input.product]?.reference||'',
      breakoutSession, bheCompletedSession:bheSession, entrySession,
      londonBreakoutIntact, priorRetestOccurred, nyRebreak, entryInSession, continuationValid:continuationValid?'Yes':'No',
      source:j.source,effectiveSecondary:j.effective,gapQualified:j.gapQualified,
      directionPermission:allowed?'Yes':'No',openingContext,
      researchP:rawP,bheValid:bhe?'Yes':'No',sessionValid:sessionValid?'Yes':'No',
      baseSize:base,validSetup:validSetup?'Yes':'No',hardVeto:hardVeto?'Yes':'No',
      finalSize,executable:executable?'Yes':'No',status,skipReason:reasons.join('；'),
      normalizedR:nR,actualR,mfeR:mfe,tp2,
      reachedRF:Number.isFinite(minutes)?'Yes':(input.reachedRF==='Yes'?'Yes':'No'),timeToRF:Number.isFinite(minutes)?minutes:null,
      deepRF:input.deepRF==='Yes'?'Yes':'No',
      // Essential guard for legacy app isolation and regression tests
      v14ProductionApplied:false,v14ShadowApplied:false,eApplied:false
    };
  }
  return Object.freeze({STATES,PRODUCTS,SIZES,FX_XAU,isFxXau,Q2_SUBTYPES,RESEARCH_PERIOD,judge,permission,context,baseSize,duration,durationText,toNumber,evaluate});
});
