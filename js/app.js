let RC={sw:[18000,32000,62000,105000,180000,145000,210000],hw:[9500,32000,6800,11500,2400,5200],x:{dev:24000,spm:1.35,drv:6500,thin:3800,sql:17800,h1:42000,h2:85000},lab:{sr:260,pm:320,cad:165}};
const RR=i=>RC.lab[['cad','sr','sr','sr','sr','sr','sr','pm'][i]];
const badge=t=>`<span class="bdg b-${String(t).replace(/\W/g,'')}">${esc(t)}</span>`;
const NUMH=new Set(['Qty','Unit','Total','Unit + markup','Hours','Cost','AED','Value']);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const $=id=>document.getElementById(id),v=id=>+$(id).value||0,FX={AED:1,USD:.2723,EUR:.2510};
const TIERS=[500,1000,2500,5000,10000,50000,Infinity],TP=[18000,32000,62000,105000,180000,520000,900000];
const fmt=n=>{const c=$('cur').value;return c+' '+Math.round(n*FX[c]).toLocaleString('en-US')};
let R={};
function calc(){
 const io=v('di')+v('ai'),tags=Math.ceil((io+v('soft')+v('calc'))*(1+v('spare')/100)),ti=TIERS.findIndex(t=>tags<=t);
 const tier=TIERS[ti]===Infinity?'Unlimited':TIERS[ti].toLocaleString('en-US');
 const sp=$('plat').value==='sp',sw=[[`${sp?'AVEVA System Platform Supervisory + OMI Runtime':'AVEVA InTouch HMI Runtime'}, ${tier} tags (sized ${tags.toLocaleString('en-US')})`,1,RC.sw[ti]*(sp?RC.x.spm:1)],
  ['Development Studio licence',sp?2:1,RC.x.dev],
  ['Third-party OPC / specialty driver (Kepware, IEC 61850, DNP3)',v('drv'),RC.x.drv],['Thin / web client licences',v('cl'),RC.x.thin],
  ['SQL Server + CALs',v('red')+v('cl')+v('ws')>0?v('red'):1,RC.x.sql]];
 if(+$('hist').value)sw.push([$('hist').value==='2'?'Historian Enterprise':'Historian Standard',v('red'),$('hist').value==='2'?RC.x.h2:RC.x.h1]);
 if(v('red')>1)sw.push(['Redundancy licence pack',1,22000]);
 const m=1+v('mk')/100;
 const hw=[['Control room workstation',v('ws'),RC.hw[0]],['Server (rack)',v('srv')*v('red')>0?v('srv'):0,RC.hw[1]],['Managed industrial switch',v('sw'),RC.hw[2]],['Industrial firewall',v('fw'),RC.hw[3]],['Fibre patch panel + pigtails',Math.max(1,Math.ceil(v('sw')/2)),RC.hw[4]],['UPS 3 kVA',Math.max(1,Math.ceil((v('ws')+v('srv'))/3)),RC.hw[5]]];
 const sc=+$('scr').value,gl=v('gl')*10+v('gm')*22+v('gh')*40,pen=1+0;
 const mh=[['Design and documentation (FDS, DDS, I/O lists)',40+tags/60+gl/12],
  ['HMI graphics, alarms and trends',gl+v('alm')/25],
  ['Scripting, SQL and reporting',sc*28+v('rep')*14],
  ['PLC and protocol driver configuration',v('plc')*18+v('drv')*12],
  ['FAT and QA',24+tags/150+v('plc')*3],
  ['Site survey, installation, SAT and commissioning',48+tags/90+v('plc')*8],
  ['Training sessions',16+v('cl')*1.5],
  ['PM, scheduling and QHSE (Annexure-SCT-HR-001)',0]];
 const sub=mh.slice(0,7).reduce((a,x)=>a+x[1],0);mh[7][1]=sub*.12;
 const swT=sw.reduce((a,x)=>a+x[1]*x[2],0),hwC=hw.reduce((a,x)=>a+x[1]*x[2],0),hwT=hwC*m,mhT=mh.reduce((a,x)=>a+x[1],0),lab=mh.reduce((a,x,i)=>a+x[1]*RR(i),0);
 const rp=+$('site').value+ +$('sch').value+ +$('leg').value,base=swT+hwT+lab,cont=base*rp,sup=swT*(+$('sla').value),pre=base+cont+sup,tot=pre*(1+v('mgn')/100),vat=$('vat').value==='1'?tot*.05:0;
 R={tags,tier,sw,hw,mh,swT,hwC,hwT,mhT,lab,rp,base,cont,tot,sup,pre,vat};
}
function tbl(el,head,rows,foot){const nm=head.map(h=>NUMH.has(h)),c=(r,t)=>'<tr'+(t?' class="t"':'')+'>'+r.map((x,i)=>`<td class="${nm[i]?'n':''}">${x}</td>`).join('')+'</tr>';$(el).innerHTML='<tr>'+head.map((h,i)=>`<th class="${nm[i]?'n':''}">${h}</th>`).join('')+'</tr>'+rows.map(r=>c(r)).join('')+(foot?c(foot,1):'')}
function render(){calc();const c=R;
 tbl('tsw',['Item','Qty','Unit','Total'],c.sw.map(x=>[x[0],x[1],fmt(x[2]),fmt(x[1]*x[2])]),['Software total','','',fmt(c.swT)]);
 tbl('thw',['Item','Qty','Unit + markup','Total'],c.hw.map(x=>[x[0],x[1],fmt(x[2]*(1+v('mk')/100)),fmt(x[1]*x[2]*(1+v('mk')/100))]),['Hardware total','','',fmt(c.hwT)]);
 tbl('tmh',['Activity','Hours','Cost'],c.mh.map((x,i)=>[x[0],Math.round(x[1]),fmt(x[1]*RR(i))]),['Engineering total',Math.round(c.mhT),fmt(c.lab)]);

 tbl('tsm',['Line','Value'],[['Software',fmt(c.swT)],['Hardware (with markup)',fmt(c.hwT)],['Engineering',fmt(c.lab)],['Subtotal',fmt(c.base)]],['Contingency '+(c.rp*100).toFixed(0)+'%',fmt(c.cont)]);
 tbl('tcm',['Line','Value'],[['Customer FIRST support',fmt(c.sup)],['Subtotal before margin',fmt(c.pre)],['Margin / discount '+v('mgn')+'%',fmt(c.tot-c.pre)],['Total excl. VAT',fmt(c.tot)],['UAE VAT 5%',fmt(c.vat)]],['Total '+(c.vat?'incl. VAT':'(VAT off)'),fmt(c.tot+c.vat)]);
 $('grand').textContent=fmt(c.tot);seg(c);$('gsub').textContent=`${c.tags.toLocaleString('en-US')} tags → ${c.tier} tier · ${Math.round(c.mhT)} h`;}
document.querySelectorAll('input,select').forEach(e=>{if(e.type!=='file')e.addEventListener('input',render)});
// storage
let db;const open=async()=>{await CS.init();return db=CS.db};
const all=s=>CS.all(s);
const FIELDS=['pid','title','client','rev','emi','site','di','ai','soft','calc','spare','gl','gm','gh','alm','plat','hist','red','cl','plc','drv','scr','rep','ws','srv','sw','fw','mk','sch','leg','sla','mgn','vat'];
const snap=()=>Object.fromEntries(FIELDS.map(f=>[f,$(f).value]));
async function revs(){try{const a=(await all('revisions')).sort((x,y)=>y.timestamp-x.timestamp);
 tbl('trv',['Project','Rev','Saved','Total',''],a.slice(0,12).map(r=>[r.inputs.pid,r.inputs.rev,new Date(r.timestamp).toLocaleDateString('en-GB'),fmt(r.total),`<button class="s" data-id="${r.id}">Load</button>`]));
 document.querySelectorAll('#trv button').forEach(b=>b.onclick=()=>{const r=a.find(x=>x.id==b.dataset.id);FIELDS.forEach(f=>{if(f in r.inputs)$(f).value=r.inputs[f]});render()});
 if(a.length>1&&a[0].inputs.pid===a[1].inputs.pid){const d=a[0].total-a[1].total;$('trv').insertAdjacentHTML('beforeend',`<tr class="t"><td>Delta vs previous</td><td></td><td></td><td class="n">${d>=0?'+':''}${fmt(d)}</td><td></td></tr>`)}}catch(e){$('trv').innerHTML='<tr><td>No revisions yet. Save one to start the history.</td></tr>'}}
async function health(){try{const p=await navigator.storage.persisted(),e=await navigator.storage.estimate(),n=(await all('revisions')).length;
 $('sb').style.width=Math.max(1,e.usage/e.quota*100)+'%';
 $('st').textContent=`${(e.usage/1048576).toFixed(2)} MB used of ${(e.quota/1073741824).toFixed(1)} GB · persistence ${p?'granted':'pending'} · ${n} revisions · ${(await all('projects')).length} projects`}catch(x){$('st').textContent='Storage telemetry unavailable in this browser.'}}
$('save').onclick=async()=>{try{CS.put('projects',{projectId:$('pid').value,title:$('title').value,client:$('client').value,status:'Estimating',updatedAt:Date.now(),uaeEmirate:$('emi').value,inputs:snap()});const t=db.transaction(['revisions','audit_trail'],'readwrite');t.objectStore('revisions').add({projectId:$('pid').value,revisionNumber:$('rev').value,timestamp:Date.now(),inputs:snap(),total:R.tot});t.objectStore('audit_trail').add({timestamp:Date.now(),action:'save',pid:$('pid').value,rev:$('rev').value,total:R.tot});t.oncomplete=()=>{revs();health()}}catch(e){alert('Storage is unavailable here. Use Export JSON instead.')}};
const dl=(name,txt,type)=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type}));a.download=name;a.click()};
$('csv').onclick=()=>{const q=s=>`"${String(s).replace(/"/g,'""')}"`,L=[['Section','Item','Qty','Unit AED','Total AED']];
 R.sw.forEach(x=>L.push(['Software',x[0],x[1],x[2],x[1]*x[2]]));R.hw.forEach(x=>L.push(['Hardware',x[0],x[1],x[2]*(1+v('mk')/100),x[1]*x[2]*(1+v('mk')/100)]));
 R.mh.forEach((x,i)=>L.push(['Man-hours',x[0],Math.round(x[1]),RR(i),x[1]*RR(i)]));L.push(['Total','Estimate excl. VAT','','',Math.round(R.tot)],['Total','VAT 5%','','',Math.round(R.vat)],['Total','Estimate incl. VAT','','',Math.round(R.tot+R.vat)]);
 dl($('pid').value+'_'+$('rev').value+'.csv',L.map(r=>r.map(q).join(',')).join('\n'),'text/csv')};
$('json').onclick=()=>dl($('pid').value+'_'+$('rev').value+'.json',JSON.stringify({inputs:snap(),result:R},null,2),'application/json');
$('bk').onclick=async()=>{try{dl('costsync-'+new Date().toISOString().slice(0,10)+'.costsync.json',JSON.stringify({schema:'costsync-v1',revisions:await all('revisions'),audit:await all('audit_trail'),projects:await all('projects'),rate_cards:await all('rate_cards'),stakeholder_logs:await all('stakeholder_logs')}),'application/json')}catch(e){alert('Nothing to back up yet.')}};
$('imp').onchange=async e=>{try{const j=JSON.parse(await e.target.files[0].text());if(j.schema!=='costsync-v1'||!Array.isArray(j.revisions))throw 0;for(const k of ['projects','rate_cards'])for(const o of j[k]||[])await CS.put(k,o);for(const o of j.stakeholder_logs||[]){delete o.id;await CS.put('stakeholder_logs',o)}await loadRC();const t=db.transaction('revisions','readwrite');j.revisions.forEach(r=>{delete r.id;t.objectStore('revisions').add(r)});t.oncomplete=()=>{revs();health()}}catch(x){alert('This file is not a valid .costsync.json backup.')}};
$('theme').onclick=()=>{const r=document.documentElement,d=r.dataset.theme==='dark'||(!r.dataset.theme&&matchMedia('(prefers-color-scheme:dark)').matches);r.dataset.theme=d?'light':'dark'};
$('cur').onchange=()=>{render();revs()};
render();
(async()=>{try{db=await open();try{await navigator.storage.persist()}catch(e){}await loadRC();await revs();await health();if(location.hash==='#rates')show('rc')}catch(e){$('st').textContent='IndexedDB is blocked in this view. Exports still work.';$('trv').innerHTML='<tr><td>Saving is unavailable here.</td></tr>'}})();

function show(n){['est','st','rc'].forEach(x=>$('v-'+x).hidden=x!==n);document.querySelectorAll('nav button').forEach(b=>b.className=b.dataset.v===n?'':'s');if(n==='st')stView();if(n==='rc')rcView()}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>show(b.dataset.v));
async function loadRC(){const a=await CS.all('rate_cards'),X={x_dev:'dev',x_spm:'spm',x_drv:'drv',x_thin:'thin',x_sql:'sql',x_hist1:'h1',x_hist2:'h2'},L={rate:'sr',rate_pm:'pm',rate_cad:'cad'};
 a.forEach(c=>{if(c.kind==='sw')RC.sw[c.idx]=c.value;else if(c.kind==='hw')RC.hw[c.idx]=c.value;else if(X[c.id])RC.x[X[c.id]]=c.value;else if(L[c.id])RC.lab[L[c.id]]=c.value});render()}
async function rcView(){const a=(await CS.all('rate_cards')).sort((x,y)=>x.id.localeCompare(y.id)),g=c=>['sw','lic','mult'].includes(c.kind)?2:1;
 const row=c=>[{sw:'Runtime tier',hw:'Hardware',labour:'Labour per hour',mult:'Multiplier',lic:'Licence'}[c.kind],c.name,`<input type="number" min="0" step="${c.kind==='mult'?'0.01':'1'}" data-id="${c.id}" value="${c.value}" style="width:110px">`];
 tbl('trc',['Kind','Item','AED'],a.filter(c=>g(c)===1).map(row));tbl('trc2',['Kind','Item','AED'],a.filter(c=>g(c)===2).map(row));
 document.querySelectorAll('#trc input,#trc2 input').forEach(i=>i.onchange=async()=>{const c=a.find(x=>x.id===i.dataset.id),old=c.value;c.value=+i.value||0;await CS.put('rate_cards',c);await CS.audit('rate_card',`${c.name}: ${old} to ${c.value}`);await loadRC();rcView()});
 const au=(await CS.all('audit_trail')).sort((x,y)=>y.timestamp-x.timestamp).slice(0,15);
 tbl('tau',['When','Action','Detail'],au.map(x=>[new Date(x.timestamp).toLocaleString('en-GB'),badge(x.action),esc(x.detail||(x.pid+' '+x.rev+' '+fmt(x.total)))]))}
const NEXT={Open:'Answered',Answered:'Closed',Closed:'Open'};
async function stView(){const P=await CS.all('projects'),L=await CS.all('stakeholder_logs');
 if(!$('sp').value)$('sp').value=$('pid').value;
 tbl('tpr',['Project','Client','Emirate','Status','Updated',''],P.sort((a,b)=>b.updatedAt-a.updatedAt).map(p=>[esc(p.projectId+' '+(p.title||'')),esc(p.client||''),p.uaeEmirate,badge(p.status),new Date(p.updatedAt).toLocaleDateString('en-GB'),`<button class="s" data-p="${esc(p.projectId)}">Open</button>`]));
 $('tpr').querySelectorAll('button').forEach(b=>b.onclick=()=>{const p=P.find(x=>x.projectId===b.dataset.p);FIELDS.forEach(f=>{if(p.inputs&&f in p.inputs)$(f).value=p.inputs[f]});render();show('est')});
 const f1=$('sfl').value,f2=$('sfs').value;$('sfl').innerHTML='<option value="">All projects</option>'+P.map(p=>`<option>${esc(p.projectId)}</option>`).join('');$('sfl').value=f1;
 tbl('tst',['Project','Type','Priority','Description','Due','Status',''],L.filter(l=>(!f1||l.projectId===f1)&&(!f2||l.status===f2)).sort((a,b)=>(a.due||'').localeCompare(b.due||'')).map(l=>[esc(l.projectId),badge(l.type),badge(l.priority),esc(l.description),l.due||'',`<button class="bdg b-${l.status}" data-a="n" data-i="${l.id}">${l.status}</button>`,`<button class="s" data-a="d" data-i="${l.id}">Delete</button>`]));
 $('tst').querySelectorAll('button').forEach(b=>b.onclick=async()=>{const l=L.find(x=>x.id==b.dataset.i);if(b.dataset.a==='d')await CS.del('stakeholder_logs',l.id);else{l.status=NEXT[l.status];await CS.put('stakeholder_logs',l)}await CS.audit('stakeholder',b.dataset.a==='d'?'Deleted entry '+l.id:`${l.type} ${l.id} set to ${l.status}`);stView()})}
$('sadd').onclick=async()=>{if(!$('sde').value.trim()||!$('sp').value.trim())return alert('Enter a project and a description.');
 await CS.put('stakeholder_logs',{projectId:$('sp').value.trim(),type:$('sty').value,priority:$('spr').value,description:$('sde').value.trim(),due:$('sdu').value,status:'Open',createdAt:Date.now()});await CS.audit('stakeholder','Added '+$('sty').value+' for '+$('sp').value);$('sde').value='';stView()};
$('sfl').onchange=$('sfs').onchange=stView;

function seg(c){const P=[['Software',c.swT+c.sup,'#0b6e5f'],['Hardware',c.hwT,'#2563eb'],['Engineering',c.lab,'#c2410c'],['Risk',c.cont,'#b91c1c']],T=P.reduce((a,x)=>a+x[1],0)||1;
 $('seg').innerHTML=P.map(p=>`<i style="width:${p[1]/T*100}%;background:${p[2]}"></i>`).join('');
 $('segl').innerHTML=P.map(p=>`<span><u style="background:${p[2]}"></u>${p[0]} ${(p[1]/T*100).toFixed(0)}%</span>`).join('')+`<span class="mono">${fmt(c.tot/c.tags)}/tag</span><span class="mono">${Math.round(c.mhT)} h</span><span class="mono">margin ${(c.tot?(c.tot-c.pre)/c.tot*100:0).toFixed(1)}%</span><span class="mono">${c.vat?'incl. VAT '+fmt(c.tot+c.vat):'excl. VAT'}</span>`;
 const b=v('di')+v('ai')+v('soft')+v('calc'),n=x=>x.toLocaleString('en-US');$('fpill').textContent=`Base ${n(b)} + ${v('spare')}% spare (${n(c.tags-b)}) = ${n(c.tags)} tags → ${c.tier} tag tier`}
const DEFV=snap();$('rst').onclick=()=>{FIELDS.forEach(f=>$(f).value=DEFV[f]);$('pid').value='AGAC-'+new Date().getFullYear()+'-'+String(Date.now()).slice(-3);render()};
