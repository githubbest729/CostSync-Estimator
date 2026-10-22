const CS={db:null,
open(){return new Promise((res,rej)=>{const q=indexedDB.open('CostSyncDB',2);q.onupgradeneeded=()=>{const d=q.result,t=q.transaction;
const mk=(n,o,ix)=>{const s=d.objectStoreNames.contains(n)?t.objectStore(n):d.createObjectStore(n,o);ix.forEach(i=>{if(!s.indexNames.contains(i))s.createIndex(i,i)})};
mk('projects',{keyPath:'projectId'},['client','status','updatedAt','uaeEmirate']);
mk('revisions',{keyPath:'id',autoIncrement:true},['projectId','revisionNumber','timestamp']);
mk('rate_cards',{keyPath:'id'},['kind']);
mk('stakeholder_logs',{keyPath:'id',autoIncrement:true},['projectId','priority','status']);
mk('audit_trail',{keyPath:'id',autoIncrement:true},['timestamp'])};
q.onsuccess=()=>{CS.db=q.result;res(q.result)};q.onerror=()=>rej(q.error)})},
all(s){return new Promise(r=>{const q=CS.db.transaction(s).objectStore(s).getAll();q.onsuccess=()=>r(q.result);q.onerror=()=>r([])})},
put(s,o){return new Promise((res,rej)=>{const t=CS.db.transaction(s,'readwrite'),q=t.objectStore(s).put(o);t.oncomplete=()=>res(q.result);t.onerror=()=>rej(t.error)})},
del(s,k){return new Promise((res,rej)=>{const t=CS.db.transaction(s,'readwrite');t.objectStore(s).delete(k);t.oncomplete=()=>res();t.onerror=()=>rej(t.error)})},
audit(action,detail){return CS.put('audit_trail',{timestamp:Date.now(),action,detail})},
async init(){await CS.open();if(!(await CS.all('rate_cards')).length)await CS.seed()},
async seed(){const now=Date.now(),day=864e5;
const tn=['500 tags','1,000 tags','2,500 tags','5,000 tags','10,000 tags','50,000 tags','Unlimited tags'],tp=[18000,32000,62000,105000,180000,520000,900000];
tn.forEach((n,i)=>CS.put('rate_cards',{id:'sw'+i,kind:'sw',idx:i,name:'Wonderware runtime licence, '+n,value:tp[i]}));
['Control room workstation','Server (rack)','Managed industrial switch','Industrial firewall','Fibre patch panel','UPS 3 kVA'].forEach((n,i)=>CS.put('rate_cards',{id:'hw'+i,kind:'hw',idx:i,name:n,value:[9500,32000,6800,11500,2400,5200][i]}));
await CS.put('rate_cards',{id:'rate',kind:'labour',idx:0,name:'Engineering hourly rate',value:260});
const base={site:'0',spare:'20',gl:'20',gm:'12',gh:'4',alm:'900',mk:'15',sch:'0',leg:'0'};
const P=[['AGAC-S-001','SAMPLE Dubai district cooling SCADA upgrade','Sample Utility A','Dubai',{site:'0.06',di:'600',ai:'260',soft:'2200',calc:'300',plat:'sp',hist:'2',red:'2',cl:'10',plc:'12',drv:'4',scr:'3',rep:'10',ws:'4',srv:'2',sw:'8',fw:'2',leg:'0.03'}],
['AGAC-S-002','SAMPLE Abu Dhabi wastewater pumping stations','Sample Authority B','Abu Dhabi',{di:'420',ai:'180',soft:'900',calc:'120',plat:'sp',hist:'1',red:'2',cl:'6',plc:'9',drv:'3',scr:'2',rep:'6',ws:'3',srv:'2',sw:'6',fw:'2',sch:'0.04'}],
['AGAC-S-003','SAMPLE Sharjah building SCADA (InTouch)','Sample Developer C','Sharjah',{di:'150',ai:'60',soft:'300',calc:'40',plat:'it',hist:'0',red:'1',cl:'2',plc:'3',drv:'2',scr:'1',rep:'2',ws:'2',srv:'1',sw:'2',fw:'1'}]];
for(const [id,t,c,e,x] of P)await CS.put('projects',{projectId:id,title:t,client:c,uaeEmirate:e,status:'Estimating',updatedAt:now-day*Math.floor(Math.random()*40),inputs:{...base,pid:id,title:t,client:c,emi:e,rev:'Rev 0',...x}});
const L=[['AGAC-S-001','TQ','High','Confirm redundancy failover time with consultant',7,'Open'],['AGAC-S-001','Scope deviation','Medium','Client asks for added energy dashboards',14,'Open'],['AGAC-S-002','Sign-off','Medium','FDS approval from end-user',21,'Answered']];
for(const [p,ty,pr,d,du,s] of L)await CS.put('stakeholder_logs',{projectId:p,type:ty,priority:pr,description:d,due:new Date(now+du*day).toISOString().slice(0,10),status:s,createdAt:now});
await CS.audit('seed','Sample projects and default AED rate cards loaded')}};
