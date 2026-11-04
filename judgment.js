/* Breakout Research V0.1 | All-Market full decision explanation.
   Presentation only: uses BreakoutEngine's already-calculated decision.
   This file NEVER evaluates Master Trade V1.4 Production/Shadow rules. */
(function(root,factory){
  const api=factory(root.BreakoutEngine||(typeof require==='function'?require('./engine.js'):null));
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.BreakoutJudgment=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(E){
  'use strict';
  if(!E)throw new Error('Missing BreakoutEngine for judgment');
  const yes=flag=>flag?'Yes':'No';
  const nice=key=>E.STATES[key]?.label||'未選';
  const size=value=>Number(value||0).toFixed(2)+' 注';
  function describeRelationship(main,secondary,trade){
    const m=E.STATES[main],s=E.STATES[secondary];
    if(!m||!s)return '狀態未完整';
    if(!m.bias||!s.bias)return 'T0／Neutral（本研究不交易）';
    if(m.bias!==s.bias)return '主次方向衝突（本研究不交易）';
    if(!['H','W'].includes(m.kind)||!['H','W'].includes(s.kind))return '同向但包含Transition（本研究不交易）';
    if(m.bias!==(trade==='Long'?'up':'down'))return '結構同向但交易逆共同方向（不允許）';
    return m.kind==='H'&&s.kind==='H'?'雙健康同向':'同向有弱勢';
  }
  function build(input,decision){
    const d=decision||E.evaluate(input),product=E.PRODUCTS[input.product]||{};
    const fx=E.isFxXau(input.product);
    const effective=E.STATES[d.effectiveSecondary],main=E.STATES[input.mainState];
    const trade=input.tradeDirection||'—';
    const relationship=describeRelationship(input.mainState,d.effectiveSecondary,trade);
    const subtype=Array.isArray(input.q2Subtypes)?input.q2Subtypes:typeof input.q2Subtypes==='string'?input.q2Subtypes.split('+').filter(Boolean):[];
    const qDetail=input.nativeQ==='Q2'?(subtype.length?'Q2-'+subtype.join('+'):'Q2｜未標Subtype'):input.nativeQ||'未選';
    const vetoItems=[];
    if(E.toNumber(input.rr)!==null&&E.toNumber(input.rr)<1.5)vetoItems.push('RR < 1.5R');
    if(E.toNumber(input.cleanSpaceR)!==null&&E.toNumber(input.cleanSpaceR)<2)vetoItems.push('Clean Space < 2R');
    for(const [field,label] of [['lateEntry','Late Entry'],['invalidExecution','Execution Invalid'],['htfObstacle','HTF Hard Obstacle'],['manualVeto','Other Hard Veto']])if(input[field])vetoItems.push(label);
    const invalidFields=[];
    if(!input.rangeEstablished)invalidFields.push('Range未建立');
    if(!input.breakoutSessionValid)invalidFields.push('Breakout Session不符');
    if(!input.breakConfirmed)invalidFields.push('Break');
    if(!input.holdConfirmed)invalidFields.push('Hold');
    if(!input.extendConfirmed)invalidFields.push('Extend');
    if(!input.firstRetestValid)invalidFields.push('First Retest');
    if(!input.retestInSession)invalidFields.push('Retest Session');
    if(!d.gapQualified)invalidFields.push('Gap Trigger');
    if(d.directionPermission!=='Yes')invalidFields.push('Direction Permission');
    if(!d.openingContext)invalidFields.push('Opening Context');
    const sections=[
      {title:'01｜市場與結構',rows:[
        ['市場／核心Setup',(input.product||'—')+'｜'+(d.family||'—')],
        ['參考範圍／Breakout Session',(d.referenceRange||product.reference||'—')+'｜'+(d.breakoutSession||'—')],
        ['交易方向／Entry TF',trade+'｜'+(input.entryTF||'—')],
        ['大局背景','本研究未另設大局輸入（不參與Size）'],
        ['Main Judge',`${input.mainTF||'—'}｜${nice(input.mainState)}${input.mainState==='t0'?'｜'+(input.mainT0Subtype||'未選T0 Subtype'):''}`],
        ['Secondary Official',`${input.secondaryTF||'—'}｜${nice(input.officialState)}${input.officialState==='t0'?'｜'+(input.officialT0Subtype||'未選T0 Subtype'):''}`],
        ['Structural Gap',`${String(input.gapMode).toUpperCase()}${input.gapMode==='on'?'｜'+(input.gapTrigger||'未確認Trigger'):''}`],
        ['Secondary Working',input.gapMode==='on'?nice(input.workingState)+(input.workingState==='t0'?'｜'+(input.workingT0Subtype||'未選T0 Subtype'):''):'未啟用（Gap OFF）'],
        ['Secondary Judge Source',d.source],
        ['Effective Secondary',nice(d.effectiveSecondary)],
        ['主次關係｜方向規則',relationship],
        ['Direction Permission',d.directionPermission]
      ]},
      {title:'02｜Opening Story與時間',rows:[
        ['開市前Range方向',input.preOpenDirection==='Bull'?'Bullish ↑':input.preOpenDirection==='Bear'?'Bearish ↓':'未確認'],
        ['Opening Context',d.openingContext||'未能分類'],
        ['BHE Completed Session',d.bheCompletedSession||'未選'],
        ['Entry Session',d.entrySession||'未選'],
        ['Same Breakout Continuation',fx?d.continuationValid:'N/A｜Opening Session'],
        ['Session Valid',d.sessionValid]
      ]},
      {title:'03｜位置、Q與Breakout有效性',rows:[
        ['Raw P',input.rawP==='P3'?`P3-${input.p3Context||'未選Context'}`:(input.rawP||'—')],
        ['Enhancement E / P2-E','不適用｜本研究禁用P3升格'],
        ['Research P',d.researchP||'—'],
        ['Native Q',qDetail],
        ['Break / Hold / Extend',[input.breakConfirmed,input.holdConfirmed,input.extendConfirmed].map(yes).join(' / ')],
        ['BHE Valid',d.bheValid],
        ['First Valid Retest',yes(input.firstRetestValid)],
        ['Retest vs Reclaim',({hold:'Hold',sweepReclaim:'Sweep-Reclaim',breakAccept:'Break-Accept',na:'N/A'})[input.retestVsReclaim]||'未記錄'],
        ['Setup Valid',d.validSetup]
      ]},
      {title:'04｜風險、注碼與結果',rows:[
        ['RR / Clean Space',`${E.toNumber(input.rr)===null?'未輸入':input.rr+'R'} / ${E.toNumber(input.cleanSpaceR)===null?'未輸入':input.cleanSpaceR+'R'}`],
        ['Hard Veto',vetoItems.length?'Yes｜'+vetoItems.join('、'):'No'],
        ['Market State上限',d.directionPermission!=='Yes'?'0 注（方向不允許）':E.STATES[input.mainState]?.kind==='H'&&effective?.kind==='H'?'1.00 注｜雙健康同向':'0.50 注｜同向有弱勢'],
        ['P × Q／方向Matrix（Base）',size(d.baseSize)],
        ['原V1.4 E／Rule 1–4','不套用｜獨立Breakout Research'],
        ['Final Research Size',size(d.finalSize)],
        ['Valid Setup / Executable',`${d.validSetup} / ${d.executable}`],
        ['Research Status',d.status]
      ]}
    ];
    const explanations=[];
    explanations.push(`方向：${nice(input.mainState)} × ${nice(d.effectiveSecondary)}；${relationship}；Permission ${d.directionPermission}。`);
    explanations.push(`位置／Q：Raw ${input.rawP||'—'}${input.rawP==='P3'?('-'+(input.p3Context||'未分類')):''} × ${qDetail}；原始Matrix ${size(d.baseSize)}；不使用P2-E或V1.4 overlay。`);
    explanations.push(`Setup：${d.bheValid==='Yes'?'BHE完成':'BHE未完成'}；${input.firstRetestValid?'首次有效Retest確認':'首次有效Retest未確認'}；${d.sessionValid==='Yes'?'Session合格':'Session不合格'}。`);
    if(invalidFields.length)explanations.push(`未符合／需確認：${invalidFields.join('、')}。`);
    if(vetoItems.length)explanations.push(`Hard Veto：${vetoItems.join('、')}；即使Setup其他條件合格，Final Size仍為0。`);
    if(d.validSetup==='Yes'&&d.baseSize===0)explanations.push('有效Setup但基礎Matrix為0注：可保存Hypothetical Result，Actual R固定0；唔屬可執行Entry。');
    if(d.validSetup==='No')explanations.push('Invalid Setup：只保留Skip原因，未成立Setup嘅假設MFE／Normalized R唔會納入統計。');
    if(d.validSetup==='Yes'&&!vetoItems.length&&d.baseSize>0)explanations.push('Setup成立、未觸發Hard Veto：Final Research Size直接等於Raw P×Native Q Base。');
    if(d.skipReason)explanations.push('Skip / Constraint：'+d.skipReason);
    return {sections,explanations,relationship,finalSize:d.finalSize,status:d.status,hasHardVeto:vetoItems.length>0};
  }
  return Object.freeze({build,describeRelationship});
});
