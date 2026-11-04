(() => {
'use strict';
const E=window.BreakoutEngine;
if(!E) throw new Error('Missing BreakoutEngine');
const $=(id)=>document.getElementById(id);
const STORE='breakoutResearchV01Records';
const IMAGE_DB='breakoutResearchV01Images';
const IMAGE_TABLE='photos';
const INPUTS=[
  'tradeDate','product','referenceRange','breakoutSession','preOpenDirection','entryTF','entryTimestamp','mainTF','mainState','mainT0Subtype','secondaryTF','officialState','officialT0Subtype','gapMode','gapTrigger','workingState','workingT0Subtype',
  'rawP','p3Context','nativeQ','rangeEstablished','breakoutSessionValid','breakConfirmed','holdConfirmed','extendConfirmed','firstRetestValid','retestInSession',
  'breakoutTimestamp','retestTimestamp','retestAcceptance','retestInternal','retestVsReclaim','bheToRetest','entryMainStructure','entryWorkingStructure','rr','cleanSpaceR',
  'lateEntry','invalidExecution','htfObstacle','manualVeto','riskNote','normalizedR','mfeR','maeR','reachedRF','timeToRF','deepRF','deepRFOriginalSL',
  'deepRFShadowMfe','deepRFNoRF','exitTimestamp','originalTradeId','originalMatch','notes'
];
const CALC_FIELDS=[
  'project','version','family','referenceRange','breakoutSession','source','effectiveSecondary','gapQualified','directionPermission','openingContext',
  'researchP','bheValid','sessionValid','baseSize','validSetup','hardVeto','finalSize','executable','status','skipReason','actualR','tp2'
];
const BOOLEAN_IDS=new Set(['rangeEstablished','breakoutSessionValid','breakConfirmed','holdConfirmed','extendConfirmed','firstRetestValid','retestInSession','lateEntry','invalidExecution','htfObstacle','manualVeto','originalMatch']);
const COLUMN_LABELS={
  id:'Record ID',createdAt:'Created At',updatedAt:'Updated At',mode:'類型',tradeDirection:'交易方向',q2Subtypes:'Q2 Subtype',
  project:'Project Name',version:'Research Version',family:'Setup Family',source:'Secondary Judge Source',effectiveSecondary:'Effective Secondary Market State',
  directionPermission:'Direction Permission',openingContext:'Opening Context',researchP:'Research P',bheValid:'BHE Valid',sessionValid:'Session Valid',
  baseSize:'Base Research Size',finalSize:'Final Research Size',validSetup:'Valid Setup',hardVeto:'Hard Veto',executable:'Executable Candidate',
  status:'Entry／Skip Category',skipReason:'Skip Reason',actualR:'Research Actual R',tp2:'去唔去到TP2 Auto',
  tradeDate:'Trade Date',product:'Product',referenceRange:'Reference Range',breakoutSession:'Breakout Session',preOpenDirection:'Pre-open Direction',
  entryTF:'Entry TF',entryTimestamp:'Entry Timestamp',mainTF:'Main Judge TF',mainState:'Main Judge Market State',mainT0Subtype:'Main T0 Subtype',secondaryTF:'Secondary TF',
  officialState:'Secondary Official Market State',officialT0Subtype:'Secondary Official T0 Subtype',gapMode:'Structural Gap',gapTrigger:'Structural Gap Trigger',workingState:'Secondary Working Market State',workingT0Subtype:'Secondary Working T0 Subtype',
  rawP:'Raw P',p3Context:'P3 Context',nativeQ:'Native Q',rangeEstablished:'Reference Range Established',breakoutSessionValid:'Breakout In Session',
  breakConfirmed:'Break Confirmed',holdConfirmed:'Hold Confirmed',extendConfirmed:'Extend Confirmed',firstRetestValid:'First Valid Retest',retestInSession:'First Retest In Session',
  breakoutTimestamp:'Breakout Timestamp',retestTimestamp:'Retest Timestamp',retestAcceptance:'Retest Acceptance',retestInternal:'Retest Internal Structure',
  retestVsReclaim:'Retest vs Reclaim Structure',bheToRetest:'BHE to First Retest H/M',entryMainStructure:'Entry-TF Main Structure',entryWorkingStructure:'Entry-TF Working Structure',
  rr:'RR',cleanSpaceR:'Clean Expansion Space R',lateEntry:'Late Entry',invalidExecution:'Execution Invalid',htfObstacle:'Hard HTF Obstacle',manualVeto:'Other Hard Veto',riskNote:'Risk Note',
  normalizedR:'Normalized R',mfeR:'MFE R',maeR:'MAE R',reachedRF:'去唔去到推RF位',timeToRF:'Time to RF H/M',deepRF:'Deep-RF Triggered',
  deepRFOriginalSL:'Deep-RF Original SL Hit',deepRFShadowMfe:'Deep-RF Shadow MFE R',deepRFNoRF:'Deep-RF No RF Final R',
  exitTimestamp:'Exit Timestamp',originalTradeId:'Original Trade ID',originalMatch:'Original Journal Match',notes:'Notes',chartImageCount:'Local Screenshot Count'
};
const CSV_KEYS=[...new Set(['id','createdAt','updatedAt','project','version','mode','tradeDate','product','family','referenceRange','breakoutSession','tradeDirection','preOpenDirection','openingContext',
  'entryTF','mainTF','mainState','mainT0Subtype','secondaryTF','officialState','officialT0Subtype','gapMode','gapTrigger','workingState','workingT0Subtype','source','effectiveSecondary','directionPermission','rawP','p3Context','researchP','nativeQ','q2Subtypes',
  'rangeEstablished','breakoutSessionValid','breakConfirmed','holdConfirmed','extendConfirmed','bheValid','firstRetestValid','retestInSession','breakoutTimestamp','retestTimestamp',
  'retestAcceptance','retestInternal','retestVsReclaim','bheToRetest','entryMainStructure','entryWorkingStructure','rr','cleanSpaceR','lateEntry','invalidExecution','htfObstacle','manualVeto','riskNote',
  'baseSize','validSetup','hardVeto','finalSize','executable','status','skipReason','normalizedR','actualR','mfeR','maeR','reachedRF','timeToRF','tp2','deepRF','deepRFOriginalSL','deepRFShadowMfe','deepRFNoRF',
  'entryTimestamp','exitTimestamp','originalMatch','originalTradeId','notes','chartImageCount'])];
let records=[];let editingId=null;let selectedIds=new Set();let currentDecision=null;let existingPreviewURLs=[];let rfAuto=false;
const escapeHtml=(v)=>String(v??'').replace(/[&<>"']/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const numberText=(v)=>v===null||v===undefined||v===''?'—':Number(v).toFixed(2);
const safeString=(v)=>String(v??'');
const uid=()=>typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():'br-'+Date.now()+'-'+Math.random().toString(36).slice(2);
const selected=(name)=>document.querySelector(`input[name="${name}"]:checked`)?.value||'';
const localDate=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
function init(){
  document.querySelectorAll('.state-select').forEach((sel)=>{
    sel.innerHTML=Object.entries(E.STATES).map(([v,s])=>`<option value="${v}">${escapeHtml(s.label)}</option>`).join('');
  });
  $('mainState').value='healthyBull';$('officialState').value='healthyBull';$('workingState').value='healthyBull';
  $('q2SubtypeChoices').innerHTML=E.Q2_SUBTYPES.map(c=>`<label><input type="checkbox" value="${escapeHtml(c)}"><span>Q2-${escapeHtml(c)}</span></label>`).join('');
  const setupFilter=(id,items)=>{ $(id).innerHTML=items.map(([val,label])=>`<label><input type="checkbox" value="${escapeHtml(val)}"><span>${escapeHtml(label)}</span></label>`).join('');};
  setupFilter('filterMode',[['Live','Live'],['Practice','Practice'],['Review','Review']]);
  setupFilter('filterProduct',Object.keys(E.PRODUCTS).map(p=>[p,p]));
  setupFilter('filterOpening',[['順向順勢','順向'],['反向順勢','反向'],['','未分類']]);
  setupFilter('filterSize',E.SIZES.map(n=>[String(n),String(n)]));
  setupFilter('filterP',['P1','P2','P3','P4'].map(x=>[x,x]));
  setupFilter('filterP3',['PB','MID','EXT'].map(x=>[x,x]));
  setupFilter('filterQ',['Q3','Q2','Q1'].map(x=>[x,x]));
  setupFilter('filterMain',Object.entries(E.STATES).map(([v,s])=>[v,s.label]));
  setupFilter('filterSecondary',Object.entries(E.STATES).map(([v,s])=>[v,s.label]));
  setupFilter('filterOutcome',[['Executable Entry','Entry'],['Valid 0-size Setup','Valid 0'],['Invalid / Skipped','Invalid / Skip']]);
  setupFilter('filterRF',[['Yes','RF Yes'],['No','RF No']]);
  setupFilter('filterTP2',[['Yes','TP2 Yes'],['No','TP2 No'],['','未記錄']]);
  setupFilter('filterEntryMain',['Opposing Intact','Opposing Broken / Transition','Aligned'].map(x=>[x,x]));
  setupFilter('filterEntryWorking',['Opposing Intact','Opposing Broken / Transition','Aligned'].map(x=>[x,x]));
  setupFilter('filterRetest',[['hold','Hold'],['sweepReclaim','Sweep-Reclaim'],['breakAccept','Break-Accept'],['na','N/A']]);
  $('tradeDate').value=localDate();
  try {const data=JSON.parse(localStorage.getItem(STORE)||'[]');records=Array.isArray(data)?data.filter(x=>x&&typeof x==='object'):[];} catch {records=[];}
  $('tradeForm').addEventListener('input',()=>update());$('tradeForm').addEventListener('change',(e)=>{
    if(e.target?.id==='timeToRF'&&$('timeToRF').value.trim())rfAuto=true;
    if(e.target?.id==='reachedRF'&&$('reachedRF').value==='No'){$('timeToRF').value='';rfAuto=false;}
    update();
  });
  $('tradeForm').addEventListener('submit',saveRecord);$('resetBtn').addEventListener('click',resetForm);
  $('reachedRF').addEventListener('change',()=>{if($('reachedRF').value==='No'){$('timeToRF').value='';rfAuto=false;} update();});
  $('timeToRF').addEventListener('input',()=>{
    const d=E.duration($('timeToRF').value);if(Number.isFinite(d)){$('reachedRF').value='Yes';rfAuto=true;}
    else if($('timeToRF').value.trim()===''&&rfAuto){$('reachedRF').value='No';rfAuto=false;}
    update();
  });
  $('screenshotInput').addEventListener('change',previewNewImages);
  document.querySelectorAll('[data-tab]').forEach(btn=>btn.addEventListener('click',()=>switchTab(btn.dataset.tab)));
  document.querySelectorAll('#history input').forEach(i=>i.addEventListener('change',renderHistory));
  $('clearFilters').addEventListener('click',()=>{document.querySelectorAll('#history input[type=checkbox]').forEach(x=>{if(!x.classList.contains('select-record'))x.checked=false;});$('filterFrom').value='';$('filterTo').value='';renderHistory();});
  $('selectVisible').addEventListener('click',()=>{filteredRecords().forEach(r=>selectedIds.add(r.id));renderHistory();});
  $('clearSelection').addEventListener('click',()=>{selectedIds.clear();renderHistory();});
  $('exportAll').addEventListener('click',()=>exportCSV(records,'all'));
  $('exportSelected').addEventListener('click',()=>exportCSV(records.filter(r=>selectedIds.has(r.id)),'selected'));
  $('exportFiltered').addEventListener('click',()=>exportCSV(filteredRecords(),'filtered'));
  $('exportImageZip').addEventListener('click',exportSelectedImages);
  $('importBtn').addEventListener('click',()=>$('csvImport').click());$('csvImport').addEventListener('change',importCSV);
  $('closeDialog').addEventListener('click',closeDialog);$('dialogOverlay').addEventListener('click',(e)=>{if(e.target===$('dialogOverlay'))closeDialog();});
  update();renderHistory();renderStats();
  if('serviceWorker' in navigator && location.protocol!=='file:')navigator.serviceWorker.register('./service-worker.js').catch(()=>{});
}
function switchTab(tab){document.querySelectorAll('.tab-panel').forEach(x=>x.classList.toggle('active',x.id===tab));document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));if(tab==='history')renderHistory();if(tab==='research')renderStats();scrollTo({top:0,behavior:'instant'});}
function getInput(){
  const data={};for(const id of INPUTS){const el=$(id);if(!el)continue;data[id]=BOOLEAN_IDS.has(id)?el.checked:el.value;}
  data.mode=selected('mode');data.tradeDirection=selected('direction');
  data.q2Subtypes=Array.from(document.querySelectorAll('#q2SubtypeChoices input:checked')).map(i=>i.value);
  return data;
}
function fillForm(record){
  for(const id of INPUTS){const el=$(id);if(!el)continue;const value=record[id];if(BOOLEAN_IDS.has(id))el.checked=value===true||value==='Yes'||value==='true';else if(id!=='referenceRange'&&id!=='breakoutSession')el.value=value===null||value===undefined?'':String(value);}
  document.querySelectorAll('input[name="mode"]').forEach(x=>x.checked=x.value===record.mode);
  document.querySelectorAll('input[name="direction"]').forEach(x=>x.checked=x.value===record.tradeDirection);
  document.querySelectorAll('#q2SubtypeChoices input').forEach(x=>x.checked=(record.q2Subtypes||[]).includes(x.value));
  $('screenshotInput').value='';editingId=record.id;rfAuto=Boolean(record.timeToRF);$('saveBtn').textContent='更新研究紀錄';
  $('saveNotice').textContent=`編輯中：${record.tradeDate} ${record.product} · ${record.id}`;update();renderImagePreviews(record.id);
}
function update(){
  const input=getInput();const product=E.PRODUCTS[input.product];
  $('referenceRange').value=product?.reference||'';$('breakoutSession').value=product?.session||'';
  $('workingPanel').classList.toggle('hidden',input.gapMode!=='on');$('gapTrigger').disabled=input.gapMode!=='on';if(input.gapMode!=='on')$('gapTrigger').value='';
  for(const [stateField,subtypeField] of [['mainState','mainT0Subtype'],['officialState','officialT0Subtype'],['workingState','workingT0Subtype']]){const sub=$(subtypeField);sub.disabled=$(stateField).value!=='t0';if(sub.disabled)sub.value='';}
  $('p3Context').disabled=input.rawP!=='P3';if(input.rawP!=='P3')$('p3Context').value='';
  $('q2Panel').classList.toggle('hidden',input.nativeQ!=='Q2');$('deepRFPanel').classList.toggle('hidden',input.deepRF!=='Yes');
  if(input.reachedRF==='No'&&$('timeToRF').value.trim()){$('reachedRF').value='Yes';input.reachedRF='Yes';}
  if(input.reachedRF==='No'){$('timeToRF').value='';}
  if(input.retestTimestamp&&input.breakoutTimestamp&&new Date(input.retestTimestamp)<new Date(input.breakoutTimestamp)){
    $('bheToRetest').title='注意：First Retest早於Breakout時間，請核實';
  } else $('bheToRetest').title='';
  input.gapTrigger=$('gapTrigger').value;input.p3Context=$('p3Context').value;
  currentDecision=E.evaluate(input);const d=currentDecision;
  $('openingContext').value=d.openingContext||'待分類（不符合有效Setup）';$('researchP').value=d.researchP||'';
  $('secondarySourceView').textContent=d.source;$('secondaryEffectiveView').textContent=E.STATES[d.effectiveSecondary]?.label||'未選';
  $('directionPermissionView').textContent=d.directionPermission;$('bheView').textContent=d.bheValid;$('validSetupView').textContent=d.validSetup;
  $('baseSizeView').textContent=numberText(d.baseSize);$('finalSizeView').textContent=numberText(d.finalSize);$('executableView').textContent=d.executable;
  $('actualR').value=d.actualR===null?'':numberText(d.actualR);$('tp2View').value=d.tp2||'尚未輸入MFE';
  $('statusBox').className='status-box '+(d.status==='Executable Entry'?'good':d.status==='Valid 0-size Setup'?'caution':'bad');
  $('statusBox').textContent=d.status==='Executable Entry'?'EXECUTABLE ENTRY｜完整Setup，注碼 '+numberText(d.finalSize):d.status==='Valid 0-size Setup'?'VALID 0-SIZE｜完整Setup，仍可記Hypothetical Result':'INVALID / SKIP｜保留Skip Reason，不計正式績效';
  $('skipReasonView').textContent=d.skipReason?`原因：${d.skipReason}`:'已符合所有自動驗證項目；具體Price Action仍需交易者判斷。';
}
function saveStore(){try{localStorage.setItem(STORE,JSON.stringify(records));return true;}catch(err){$('saveNotice').textContent='本機儲存失敗（可能空間已滿）：'+err.message;return false;}}
async function saveRecord(ev){ev.preventDefault();update();const data=getInput();if(!/^\d{4}-\d{2}-\d{2}$/.test(data.tradeDate)){ $('saveNotice').textContent='請先填寫有效交易日期。';return; }const old=records.find(r=>r.id===editingId);const now=new Date().toISOString();
  const entry={...data,...currentDecision,id:old?.id||uid(),createdAt:old?.createdAt||now,updatedAt:now,mode:data.mode,tradeDirection:data.tradeDirection};
  // Manual values must not override computed fields, but retain entered normalizedR and MFE.
  entry.normalizedR=E.toNumber(data.normalizedR);entry.mfeR=E.toNumber(data.mfeR);entry.maeR=E.toNumber(data.maeR);
  entry.chartImageCount=old?.chartImageCount||0;
  if(entry.validSetup==='No'){
    // An unqualified BHE/retest is NOT a hypothetical trade. Keep only skip context.
    entry.normalizedR=null;entry.mfeR=null;entry.maeR=null;entry.actualR=null;entry.tp2='';
    entry.reachedRF='No';entry.timeToRF=null;entry.deepRF='No';entry.deepRFOriginalSL='';entry.deepRFShadowMfe='';entry.deepRFNoRF='';
  }
  if(old)records=records.map(r=>r.id===old.id?entry:r);else records.unshift(entry);
  if(!saveStore())return;
  const chosen=Array.from($('screenshotInput').files||[]).filter(f=>f.type.startsWith('image/'));
  if(chosen.length){try{await putImages(entry.id,chosen);entry.chartImageCount=(await getImages(entry.id)).length;saveStore();}catch(e){$('saveNotice').textContent='紀錄已存，但部分圖片未存成功：'+e.message;}}
  $('saveNotice').textContent=`已儲存 ${entry.tradeDate||'無日期'} ${entry.product}｜${entry.status}｜Research Size ${numberText(entry.finalSize)}`;
  editingId=entry.id;$('saveBtn').textContent='更新研究紀錄';$('screenshotInput').value='';renderImagePreviews(entry.id);renderHistory();renderStats();
}
function resetForm(){editingId=null;rfAuto=false;const form=$('tradeForm');form.reset();document.querySelectorAll('#q2SubtypeChoices input').forEach(i=>i.checked=false);$('mainState').value='healthyBull';$('officialState').value='healthyBull';$('workingState').value='healthyBull';$('tradeDate').value=localDate();$('saveBtn').textContent='儲存研究紀錄（包括0注／Skip）';$('saveNotice').textContent='';$('screenshotInput').value='';clearImagePreviews();update();}
function filterValues(id){return new Set(Array.from($(id).querySelectorAll('input:checked')).map(x=>x.value));}
function multiMatch(set,value){return set.size===0||set.has(String(value??''));}
function filteredRecords(){const from=$('filterFrom').value,to=$('filterTo').value;const f={};
for(const name of ['Mode','Product','Opening','Size','P','P3','Q','Main','Secondary','Outcome','RF','TP2','EntryMain','EntryWorking','Retest'])f[name]=filterValues('filter'+name);
return records.filter(r=>(!from||r.tradeDate>=from)&&(!to||r.tradeDate<=to)&&multiMatch(f.Mode,r.mode)&&multiMatch(f.Product,r.product)&&multiMatch(f.Opening,r.openingContext)&&multiMatch(f.Size,r.finalSize)&&multiMatch(f.P,r.rawP)&&multiMatch(f.P3,r.p3Context)&&multiMatch(f.Q,r.nativeQ)&&multiMatch(f.Main,r.mainState)&&multiMatch(f.Secondary,r.effectiveSecondary)&&multiMatch(f.Outcome,r.status)&&multiMatch(f.RF,r.reachedRF)&&multiMatch(f.TP2,r.tp2)&&multiMatch(f.EntryMain,r.entryMainStructure)&&multiMatch(f.EntryWorking,r.entryWorkingStructure)&&multiMatch(f.Retest,r.retestVsReclaim));}
function renderHistory(){const filtered=filteredRecords();$('filterCount').textContent=`顯示 ${filtered.length} / ${records.length} 筆`;$('selectionCount').textContent=`已勾選 ${selectedIds.size} 筆`;
$('historyList').innerHTML=filtered.length?filtered.slice().sort((a,b)=>String(b.tradeDate).localeCompare(String(a.tradeDate))||String(b.updatedAt).localeCompare(String(a.updatedAt))).map(r=>{
const badge=r.status==='Executable Entry'?'good':r.status==='Valid 0-size Setup'?'caution':'bad';
return `<article class="card history-item"><input type="checkbox" class="select-record" data-id="${escapeHtml(r.id)}" ${selectedIds.has(r.id)?'checked':''} aria-label="選取紀錄"><div><div class="history-head"><h3>${escapeHtml(r.tradeDate||'無日期')} · ${escapeHtml(r.product)} ${escapeHtml(r.tradeDirection)}</h3><span class="tag ${badge}">${escapeHtml(r.status)}</span></div><p class="history-meta">${escapeHtml(r.mode)} · ${escapeHtml(r.openingContext||'未分類')} · ${escapeHtml(r.rawP)}${r.p3Context?'-'+escapeHtml(r.p3Context):''} / ${escapeHtml(r.nativeQ)}${r.nativeQ==='Q2'&&r.q2Subtypes?.length?' ['+escapeHtml(r.q2Subtypes.join('+'))+']':''}</p><div class="history-head"><strong>Size ${numberText(r.finalSize)} · Normalized ${numberText(r.normalizedR)}R · Actual ${numberText(r.actualR)}R</strong></div><div class="action-row"><button type="button" class="secondary-btn" data-action="detail" data-id="${escapeHtml(r.id)}">詳情</button><button type="button" class="secondary-btn" data-action="edit" data-id="${escapeHtml(r.id)}">編輯</button><button type="button" class="danger-btn" data-action="delete" data-id="${escapeHtml(r.id)}">刪除</button></div></div></article>`;
}).join(''):'<article class="card"><p class="muted">沒有符合篩選條件嘅紀錄。</p></article>';
$('historyList').querySelectorAll('.select-record').forEach(ch=>ch.addEventListener('change',(e)=>{if(e.target.checked)selectedIds.add(e.target.dataset.id);else selectedIds.delete(e.target.dataset.id);$('selectionCount').textContent=`已勾選 ${selectedIds.size} 筆`;}));
$('historyList').querySelectorAll('[data-action]').forEach(btn=>btn.addEventListener('click',async()=>{const rec=records.find(r=>r.id===btn.dataset.id);if(!rec)return;
if(btn.dataset.action==='edit'){fillForm(rec);switchTab('calculator');}
if(btn.dataset.action==='detail')showDetail(rec);
if(btn.dataset.action==='delete'&&confirm(`確定刪除${rec.tradeDate} ${rec.product}紀錄？此操作無法復原。`)){records=records.filter(r=>r.id!==rec.id);selectedIds.delete(rec.id);saveStore();try{await deleteImages(rec.id);}catch{}renderHistory();renderStats();}
}));
}
async function showDetail(record){$('dialogTitle').textContent=`${record.tradeDate} · ${record.product} ${record.tradeDirection}`;
const show=['mode','openingContext','mainState','mainT0Subtype','officialState','officialT0Subtype','workingState','workingT0Subtype','gapMode','gapTrigger','source','effectiveSecondary','directionPermission','rawP','p3Context','nativeQ','q2Subtypes',
 'bheValid','firstRetestValid','retestAcceptance','retestInternal','retestVsReclaim','entryMainStructure','entryWorkingStructure','baseSize','finalSize','validSetup','status','skipReason','reachedRF','timeToRF','tp2','deepRF','normalizedR','actualR','mfeR','maeR','originalTradeId','notes'];
$('dialogContent').innerHTML='<div class="detail-grid">'+show.map(k=>`<div><span class="muted">${escapeHtml(COLUMN_LABELS[k]||k)}</span><strong>${escapeHtml(k==='timeToRF'?E.durationText(record[k]):Array.isArray(record[k])?record[k].join('+'):record[k]??'—')}</strong></div>`).join('')+'</div><div id="dialogImages" class="image-preview"></div>';
$('dialogOverlay').classList.remove('hidden');try{const images=await getImages(record.id);const root=$('dialogImages');images.forEach(item=>{const url=URL.createObjectURL(item.blob);existingPreviewURLs.push(url);const im=document.createElement('img');im.src=url;im.alt=item.name;root.appendChild(im);});}catch{}
}
function closeDialog(){$('dialogOverlay').classList.add('hidden');$('dialogContent').innerHTML='';clearImageObjectURLs();}
function csvQuote(v){const value=Array.isArray(v)?v.join('+'):(v===null||v===undefined?'':String(v));return /[",\r\n]/.test(value)?'"'+value.replace(/"/g,'""')+'"':value;}
function filename(kind,ext){return `BreakoutResearch-V0.1-${kind}-${new Date().toISOString().slice(0,10)}.${ext}`;}
function downloadBlob(blob,name){const link=document.createElement('a');const url=URL.createObjectURL(blob);link.href=url;link.download=name;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),4000);}
function exportCSV(items,kind){if(!items.length){alert('沒有紀錄可匯出。');return;}const headers=CSV_KEYS.map(k=>COLUMN_LABELS[k]||k);const lines=[headers.map(csvQuote).join(',')];for(const item of items){const values=CSV_KEYS.map(key=>{let v=item[key];if(key==='timeToRF')v=v!==null&&v!==undefined&&v!==''?E.durationText(v):'';if(BOOLEAN_IDS.has(key))v=v?'Yes':'No';return csvQuote(v);});lines.push(values.join(','));}
downloadBlob(new Blob(['\uFEFF'+lines.join('\r\n')],{type:'text/csv;charset=utf-8'}),filename(kind,'csv'));}
function parseCSV(text){const rows=[];let row=[],cell='',quoted=false;const s=text.replace(/^\uFEFF/,'');for(let i=0;i<s.length;i++){const ch=s[i];if(quoted){if(ch==='"'&&s[i+1]==='"'){cell+='"';i++;}else if(ch==='"')quoted=false;else cell+=ch;}else if(ch==='"'){quoted=true;}else if(ch===','){row.push(cell);cell='';}else if(ch==='\n'){row.push(cell.replace(/\r$/,''));rows.push(row);row=[];cell='';}else cell+=ch;}if(quoted)throw new Error('CSV引號不完整');if(cell!==''||row.length){row.push(cell.replace(/\r$/,''));rows.push(row);}return rows;}
async function importCSV(ev){const file=ev.target.files?.[0];if(!file)return;const notice=$('importNotice');try{const raw=await file.text();const all=parseCSV(raw);if(all.length<2)throw new Error('CSV沒有資料列');const first=all.shift();const expected=['Record ID','Project Name','Research Version','Final Research Size','Trade Date'];if(!expected.every(x=>first.includes(x)))throw new Error('CSV格式不符合本Project，拒絕匯入其他Journal以避免資料污染。');
 const colmap=first.map(h=>Object.keys(COLUMN_LABELS).find(k=>COLUMN_LABELS[k]===h)||(CSV_KEYS.includes(h)?h:null));let added=0,updated=0,skipped=0;
 for(const row of all){if(row.every(v=>!String(v).trim()))continue;const rawItem={};row.forEach((v,i)=>{if(colmap[i])rawItem[colmap[i]]=v;});if(rawItem.project!=='Break out setup testing'||rawItem.version!=='Research V0.1'||!E.PRODUCTS[rawItem.product]){skipped++;continue;}
 for(const k of BOOLEAN_IDS)rawItem[k]=rawItem[k]==='Yes'||rawItem[k]==='true';
 rawItem.q2Subtypes=(rawItem.q2Subtypes||'').split('+').filter(x=>E.Q2_SUBTYPES.includes(x));
 const preservedTime=E.duration(rawItem.timeToRF);rawItem.timeToRF=Number.isFinite(preservedTime)?E.durationText(preservedTime):'';
 if(!E.STATES[rawItem.mainState]||!E.STATES[rawItem.officialState]||!['Long','Short'].includes(rawItem.tradeDirection)){skipped++;continue;}
 const evalResult=E.evaluate(rawItem);let key=rawItem.id||uid();const original=records.findIndex(r=>r.id===key);
 const item={...rawItem,...evalResult,id:key,createdAt:rawItem.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString(),mode:['Live','Practice','Review'].includes(rawItem.mode)?rawItem.mode:'Practice',
   normalizedR:E.toNumber(rawItem.normalizedR),mfeR:E.toNumber(rawItem.mfeR),maeR:E.toNumber(rawItem.maeR),chartImageCount:original>=0?records[original].chartImageCount:0};
 if(item.validSetup==='No'){
   item.normalizedR=null;item.mfeR=null;item.maeR=null;item.actualR=null;item.tp2='';
   item.reachedRF='No';item.timeToRF=null;item.deepRF='No';item.deepRFOriginalSL='';item.deepRFShadowMfe='';item.deepRFNoRF='';
 }
 if(original>=0){records[original]=item;updated++;}else{records.unshift(item);added++;}
 }
 if(!saveStore())return;notice.textContent=`匯入完成：新增 ${added}、覆蓋同ID ${updated}、跳過 ${skipped}。CSV唔包括圖片binary。`;renderHistory();renderStats();
 }catch(error){notice.textContent='匯入失敗：'+error.message;}finally{ev.target.value='';}}
function stats(items){const values=items.map(x=>E.toNumber(x.normalizedR)).filter(x=>x!==null);const actual=items.map(x=>E.toNumber(x.actualR)||0);let peak=0,cum=0,dd=0,streak=0,maxStreak=0;for(let i=0;i<items.length;i++){cum+=E.toNumber(items[i].actualR)||0;peak=Math.max(peak,cum);dd=Math.max(dd,peak-cum);if((E.toNumber(items[i].normalizedR)||0)<0){streak++;maxStreak=Math.max(maxStreak,streak);}else streak=0;}
const profit=actual.filter(x=>x>0).reduce((a,b)=>a+b,0),loss=-actual.filter(x=>x<0).reduce((a,b)=>a+b,0);
const mfeValues=items.map(r=>E.toNumber(r.mfeR)).filter(v=>v!==null);
const maeValues=items.map(r=>E.toNumber(r.maeR)).filter(v=>v!==null);
const rfTimes=items.map(r=>r.timeToRF===null||r.timeToRF===undefined?null:E.toNumber(r.timeToRF)).filter(v=>v!==null);
const avg=arr=>arr.length?arr.reduce((a,b)=>a+b,0)/arr.length:null;
return {n:items.length,results:values.length,win:values.filter(x=>x>0).length,loss:values.filter(x=>x<0).length,winrate:values.length?100*values.filter(x=>x>0).length/values.length:0,
lossrate:values.length?100*values.filter(x=>x<0).length/values.length:0,
expectancy:avg(values),actual:actual.reduce((a,b)=>a+b,0),pf:loss?profit/loss:(profit?'∞':'—'),dd,maxStreak,
rf:items.filter(x=>x.reachedRF==='Yes').length,tp2:items.filter(x=>x.tp2==='Yes').length,
twoRHit:mfeValues.filter(v=>v>=2).length,mfeN:mfeValues.length,mfeAvg:avg(mfeValues),maeAvg:avg(maeValues),rfTimeAvg:avg(rfTimes)};}
function renderStats(){const main=records.filter(r=>r.status==='Executable Entry'&&['Live','Practice'].includes(r.mode)).sort((a,b)=>String(a.tradeDate).localeCompare(String(b.tradeDate)));
const zero=records.filter(r=>r.status==='Valid 0-size Setup');const invalid=records.filter(r=>r.status==='Invalid / Skipped');const review=records.filter(r=>r.mode==='Review');const s=stats(main);
const tiles=[['正式研究Entry',s.n],['有效0注Setup',zero.length],['無效／Skip',invalid.length],['Review（不計績效）',review.length],['Normalized E',s.expectancy===null?'—':numberText(s.expectancy)+'R'],['Actual R',numberText(s.actual)+'R'],['Win Rate',s.results?s.winrate.toFixed(1)+'%':'—'],['Loss Frequency',s.results?s.lossrate.toFixed(1)+'%':'—'],['Profit Factor',typeof s.pf==='number'?s.pf.toFixed(2):s.pf],['Max DD',s.dd.toFixed(2)+'R'],['Max Losing Streak',s.maxStreak],['RF Hit / All',`${s.rf}/${s.n}`],['TP2 Hit / All',`${s.tp2}/${s.n}`],['2R Hit / MFE有效',`${s.twoRHit}/${s.mfeN}`],['Avg MFE',s.mfeAvg===null?'—':numberText(s.mfeAvg)+'R'],['Avg MAE',s.maeAvg===null?'—':numberText(s.maeAvg)+'R'],['Avg Time to RF',s.rfTimeAvg===null?'—':E.durationText(Math.round(s.rfTimeAvg))]];
$('statsCards').innerHTML=tiles.map(([label,value])=>`<div class="stat-card"><small>${escapeHtml(label)}</small><strong>${escapeHtml(value)}</strong></div>`).join('');
const zeroResearch=zero.filter(r=>['Live','Practice'].includes(r.mode));const zeroAvg=zeroResearch.map(r=>E.toNumber(r.normalizedR)).filter(x=>x!==null);const avg=zeroAvg.length?numberText(zeroAvg.reduce((a,b)=>a+b,0)/zeroAvg.length):'—';
let html=`<p class="state-note">有效0注：共 ${zero.length} 筆，當中Live/Practice ${zeroResearch.length} 筆，其中 ${zeroAvg.length} 筆有Hypothetical R，平均Normalized=${avg}R；Research Actual R全部0，唔計主績效。</p>`;
const groups=[['按產品',r=>r.product],['按半年度',r=>r.tradeDate?`${r.tradeDate.slice(0,4)} ${Number(r.tradeDate.slice(5,7))<=6?'H1':'H2'}`:'未知'],['Opening Context',r=>r.openingContext||'待分類'],['Market State Pair',r=>(r.mainState||'?')+' × '+(r.effectiveSecondary||'?')],['Raw P / P3',r=>r.rawP+(r.p3Context?'-'+r.p3Context:'')],['Native Q',r=>r.nativeQ+(r.nativeQ==='Q2'&&r.q2Subtypes?.length?' '+r.q2Subtypes.join('+'):'')],['Retest vs Reclaim',r=>r.retestVsReclaim||'N/A'],['Entry-TF Main Structure',r=>r.entryMainStructure||'Unknown'],['Entry-TF Working Structure',r=>r.entryWorkingStructure||'Unknown'],['Research Size',r=>String(r.finalSize)]];
for(const [title,getKey] of groups){const groupsMap=new Map();for(const r of main){const key=getKey(r);if(!groupsMap.has(key))groupsMap.set(key,[]);groupsMap.get(key).push(r);}html+=`<h3>${escapeHtml(title)}</h3><div class="matrix-scroll"><table class="matrix-table"><thead><tr><th>分組</th><th>n</th><th>Win%</th><th>Normalized E</th><th>Actual R</th><th>2R</th><th>Avg MFE</th><th>Avg MAE</th><th>TP2</th><th>RF</th></tr></thead><tbody>`;
for(const [name,items] of [...groupsMap.entries()].sort((a,b)=>b[1].length-a[1].length)){const x=stats(items);html+=`<tr><td>${escapeHtml(name)}</td><td>${x.n}</td><td>${x.results?x.winrate.toFixed(1)+'%':'—'}</td><td>${x.expectancy===null?'—':numberText(x.expectancy)}</td><td>${numberText(x.actual)}</td><td>${x.twoRHit}/${x.mfeN}</td><td>${x.mfeAvg===null?'—':numberText(x.mfeAvg)}</td><td>${x.maeAvg===null?'—':numberText(x.maeAvg)}</td><td>${x.tp2}</td><td>${x.rf}</td></tr>`;}html+='</tbody></table></div>';}
$('statsTables').innerHTML=html;
}
// Screenshots are stored ONLY under the new app's independent IndexedDB namespace.
function openDB(){return new Promise((resolve,reject)=>{if(!('indexedDB' in window))return reject(new Error('瀏覽器不支援IndexedDB'));
const req=indexedDB.open(IMAGE_DB,1);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(IMAGE_TABLE)){const t=db.createObjectStore(IMAGE_TABLE,{keyPath:'id'});t.createIndex('recordId','recordId',{unique:false});}};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
async function putImages(recordId,files){const db=await openDB();try{await new Promise((resolve,reject)=>{const tx=db.transaction(IMAGE_TABLE,'readwrite');const t=tx.objectStore(IMAGE_TABLE);files.forEach(f=>t.put({id:uid(),recordId,name:f.name||'image',blob:f,lastModified:f.lastModified||Date.now()}));tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});}finally{db.close();}}
async function getImages(recordId){const db=await openDB();try{return await new Promise((resolve,reject)=>{const tx=db.transaction(IMAGE_TABLE,'readonly');const req=tx.objectStore(IMAGE_TABLE).index('recordId').getAll(recordId);req.onsuccess=()=>resolve(req.result||[]);req.onerror=()=>reject(req.error);});}finally{db.close();}}
async function deleteImages(recordId){const db=await openDB();try{await new Promise((resolve,reject)=>{const tx=db.transaction(IMAGE_TABLE,'readwrite');const index=tx.objectStore(IMAGE_TABLE).index('recordId');const cursor=index.openCursor(recordId);cursor.onsuccess=()=>{const c=cursor.result;if(c){c.delete();c.continue();}};tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});}finally{db.close();}}
function clearImageObjectURLs(){existingPreviewURLs.forEach(u=>URL.revokeObjectURL(u));existingPreviewURLs=[];}
function clearImagePreviews(){clearImageObjectURLs();$('imagePreview').innerHTML='';}
function previewNewImages(){renderImagePreviews(editingId);}
async function renderImagePreviews(recordId){clearImagePreviews();if(recordId){try{const files=await getImages(recordId);for(const photo of files){const url=URL.createObjectURL(photo.blob);existingPreviewURLs.push(url);addPreview(url,photo.name,'已儲存');}}catch{}}
Array.from($('screenshotInput').files||[]).forEach(f=>{const url=URL.createObjectURL(f);existingPreviewURLs.push(url);addPreview(url,f.name,'待儲存');});}
function addPreview(url,name,state){const box=document.createElement('div');box.className='preview-item';const im=document.createElement('img');im.src=url;im.alt=name;const label=document.createElement('small');label.textContent=state;box.append(im,label);$('imagePreview').append(box);}
// Native ZIP (store mode) for offline screenshot backup. Images are not embedded in CSV.
function crc32(bytes){let c=-1;for(const b of bytes){c^=b;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xEDB88320:0);}return(c^(-1))>>>0;}
function concatBytes(parts){const out=new Uint8Array(parts.reduce((n,p)=>n+p.length,0));let off=0;for(const p of parts){out.set(p,off);off+=p.length;}return out;}
function zipStored(entries){const te=new TextEncoder();const local=[],central=[];let offset=0;for(const {name,bytes} of entries){const filename=te.encode(name),crc=crc32(bytes);const localHead=new Uint8Array(30+filename.length),a=new DataView(localHead.buffer);a.setUint32(0,0x04034b50,true);a.setUint16(4,20,true);a.setUint16(6,0x0800,true);a.setUint16(8,0,true);a.setUint32(14,crc,true);a.setUint32(18,bytes.length,true);a.setUint32(22,bytes.length,true);a.setUint16(26,filename.length,true);localHead.set(filename,30);local.push(localHead,bytes);
const c=new Uint8Array(46+filename.length),d=new DataView(c.buffer);d.setUint32(0,0x02014b50,true);d.setUint16(4,20,true);d.setUint16(6,20,true);d.setUint16(8,0x0800,true);d.setUint32(16,crc,true);d.setUint32(20,bytes.length,true);d.setUint32(24,bytes.length,true);d.setUint16(28,filename.length,true);d.setUint32(42,offset,true);c.set(filename,46);central.push(c);offset+=localHead.length+bytes.length;}
const center=concatBytes(central),end=new Uint8Array(22),d=new DataView(end.buffer);d.setUint32(0,0x06054b50,true);d.setUint16(8,entries.length,true);d.setUint16(10,entries.length,true);d.setUint32(12,center.length,true);d.setUint32(16,offset,true);return new Blob([...local,center,end],{type:'application/zip'});}
async function exportSelectedImages(){const items=records.filter(r=>selectedIds.has(r.id));if(!items.length){alert('請先勾選紀錄。');return;}const entries=[];
try{for(const rec of items){const photos=await getImages(rec.id);for(const [index,p] of photos.entries()){const bytes=new Uint8Array(await p.blob.arrayBuffer());const suffix=String(p.name).split('.').pop().replace(/[^a-zA-Z0-9]/g,'').slice(0,8)||'jpg';entries.push({name:`${rec.tradeDate||'no-date'}_${rec.product}_${rec.id.slice(0,8)}_${index+1}.${suffix}`,bytes});}}
if(!entries.length){alert('勾選紀錄冇已儲存截圖。');return;}downloadBlob(zipStored(entries),filename('selected-images','zip'));}catch(e){alert('截圖備份失敗：'+e.message);}}
document.addEventListener('DOMContentLoaded',init);
})();
