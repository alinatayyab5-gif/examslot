// Shared helpers: layout, tables, forms, dialogs. Kept simple on purpose.
const $=(s,e=document)=>e.querySelector(s),esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
// Inline icons (no external files) + theme toggle button
const _s=d=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const IC={cal:_s('<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'),pin:_s('<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>'),clock:_s('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),shield:_s('<path d="M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>'),
sun:_s('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>').replace('<svg','<svg class="i-sun"'),moon:_s('<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/>').replace('<svg','<svg class="i-moon"')};
const themeBtn=(c='')=>`<button type="button" class="ib ${c}" onclick="toggleTheme()" aria-label="Switch light or dark theme" title="Switch light / dark">${IC.sun}${IC.moon}</button>`;
const Q=new URLSearchParams(location.search),go=p=>location.href='../'+p;
const me=()=>JSON.parse(localStorage.getItem('es_user')||'null');
const fd=d=>d?new Date(d+(d.length==10?'T00:00':'')).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}):'-';
const day=d=>new Date(d+'T00:00').toLocaleDateString('en-GB',{weekday:'long'});
const ft=t=>{if(!t)return'';let[h,m]=t.split(':');return(h%12||12)+':'+m+(h<12?' AM':' PM')};
const rng=s=>ft(s.start)+(s.end?' - '+ft(s.end):'');
const mins=t=>+t.slice(0,2)*60+ +t.slice(3,5);
const ov=(a,b)=>{const e=x=>x.end?mins(x.end):mins(x.start)+180;return a.date==b.date&&mins(a.start)<e(b)&&mins(b.start)<e(a)};
const bdg=(t,c='')=>`<span class="bg ${c}">${t}</span>`;
function toast(m,t=''){const d=document.createElement('div');d.className='toast '+t;d.textContent=m;document.body.append(d);setTimeout(()=>d.remove(),3500)}
function modal(html,btns){const o=document.createElement('div');o.className='ov';o.innerHTML=`<div class="modal">${html}<div class="mb"></div></div>`;
 btns.forEach(([l,c,f])=>{const b=document.createElement('button');b.className='btn '+c;b.textContent=l;b.onclick=()=>{if(f&&f(o)===false)return;o.remove()};$('.mb',o).append(b)});document.body.append(o);return o}
function logout(){localStorage.removeItem('es_user');location.href='../auth/login.html'}
function home(u){if(u.role=='admin')return'admin/dashboard.html';const D=db(),s=D.students.find(x=>x.id==u.id);
 if(!s.branchId||s.branchUnlock)return'student/select-branch.html';if(s.courses.length<4||!s.sheetSaved||s.sheetUnlock)return'student/dashboard.html';return'student/date-sheet.html'}
// page(role, activeKey, fn(main, db, user)) -> builds the layout and checks access
function page(role,active,fn){
 const u=me();if(!u){sessionStorage.setItem('es_next',location.href);return location.href='../auth/login.html'}
 if(u.role!==role)return location.href='../auth/error.html?code=403';
 const D=db(),user=role=='admin'?D.admin:D.students.find(s=>s.id==u.id);
 const nav=role=='admin'?[['dashboard','Dashboard'],['branches','Branches'],['courses','Courses'],['students','Students'],['assignments','Assignments'],['schedule','Schedule'],['requests','Requests']]:[['dashboard','Dashboard'],['date-sheet','Date Sheet'],['help','Need Help'],['requests','My Requests']];
 const links=nav.map(([k,l])=>`<a class="${role=='admin'?'':'nv '}${k==active?'on':''}" href="../${role}/${k}.html">${l}</a>`).join('');
 document.body.className=role=='admin'?'adm':'stu';
 $('#app').innerHTML=(role=='admin'?`<aside class="side"><b>ExamSlot</b>${links}</aside>`:'')+`<header class="top"><button class="ham" onclick="document.body.classList.toggle('open')">&#9776;</button>${role=='admin'?'':'<b>ExamSlot</b>'}<nav>${active=='gate'?'':role=='admin'?'':links}</nav><span class="sp"></span><span class="un">${esc(user.name)}</span>${themeBtn()}<button class="btn s" onclick="logout()">Logout</button></header><main class="main"></main>`;
 const m=$('.main');fn(m,D,user);return m}
// list(main, cfg): search + filters + pagination table. Data comes from cfg.rows().
function list(m,c){let pg=1,ps=10,s='',f={};(c.filters||[]).forEach((x,i)=>{if(x.d)f[i]=x.d});
 m.innerHTML=`<div class="hd"><div><h1>${c.title}</h1><p class="mu">${c.sub||''}</p></div>${c.add?`<a class="btn p" href="${c.add}">+ ${c.addL}</a>`:''}</div>${c.top||''}<div class="card"><div class="bar"><input id="qs" placeholder="Search..."> ${(c.filters||[]).map((x,i)=>`<select data-i="${i}"><option value="">${x.l}: All</option>${x.o.map(o=>`<option ${o==x.d?'selected':''}>${o}</option>`).join('')}</select>`).join('')}</div><div id="tb"></div></div>`;
 const draw=()=>{const q=query(c,{s,f,pg,ps});pg=q.page;const r=q.data,n=q.total,pages=q.totalPages;
  $('#tb').innerHTML=(n?`<div class="tw"><table class="rt"><thead><tr>${c.cols.map(x=>'<th>'+x[0]).join('')}${c.act?'<th>Actions':''}</tr></thead><tbody>${r.map(x=>`<tr class="${c.rc?c.rc(x):''}">${c.cols.map(k=>`<td data-l="${k[0]}">${k[1](x)}</td>`).join('')}${c.act?`<td class="act" data-l="">${c.act(x)}</td>`:''}</tr>`).join('')}</tbody></table></div>`:'<p class="empty">No results match your search or filters.</p>')+
  `<div class="pager"><span>Showing ${n?(pg-1)*ps+1:0}-${Math.min(pg*ps,n)} of ${n}</span><span>Rows <select id="ps">${[5,10,25,50].map(v=>`<option ${v==ps?'selected':''}>${v}</option>`).join('')}</select> <button class="btn s" id="pv" ${pg<2?'disabled':''}>Prev</button> Page ${pg} of ${pages} <button class="btn s" id="nx" ${pg>=pages?'disabled':''}>Next</button></span></div>`;
  $('#ps').onchange=e=>{ps=+e.target.value;pg=1;draw()};$('#pv').onclick=()=>{pg--;draw()};$('#nx').onclick=()=>{pg++;draw()};
  document.querySelectorAll('#tb [data-a]').forEach(b=>b.onclick=()=>c.on(b.dataset.a,+b.dataset.id,draw))};
 let t;$('#qs').oninput=e=>{clearTimeout(t);t=setTimeout(()=>{s=e.target.value.toLowerCase();pg=1;draw()},400)};
 m.querySelectorAll('.bar select').forEach(e=>e.onchange=()=>{f[e.dataset.i]=e.value;pg=1;draw()});$('#tb').innerHTML='<div class="sk"></div>'.repeat(4);setTimeout(draw,250);return draw}
// form(main, cfg): fields [{n,l,t,o,req,h}] or {g:'Group title'}; cfg.save(values) returns {field:message} or nothing
function form(m,c){const d=c.data||{};let dirty=false;
 m.innerHTML=`<div class="hd"><div><h1>${c.title}</h1><p class="mu">${c.crumb||''}</p></div></div><form class="card" novalidate>${c.fields.map(f=>f.g?`<h3>${f.g}</h3>`:`<div id="f_${f.n}"><label>${f.l}${f.req?' *':''}</label>${f.t=='select'?`<select name="${f.n}" ${f.dis?'disabled':''}>${f.o.map(o=>`<option ${o==d[f.n]?'selected':''}>${o}</option>`).join('')}</select>`:f.t=='area'?`<textarea name="${f.n}">${esc(d[f.n])}</textarea>`:`<input name="${f.n}" type="${f.t||'text'}" ${f.t=='file'?'accept="image/jpeg,image/png"':`value="${esc(d[f.n])}"`} ${f.dl?`list="dl_${f.n}"`:''} ${f.dis?'disabled':''}>${f.dl?`<datalist id="dl_${f.n}">${f.dl.map(o=>`<option value="${esc(o)}">`).join('')}</datalist>`:''}`}<span class="err">${f.h||''}</span></div>`).join('')}${c.extra||''}<div class="mb"><a class="btn" href="${c.back}">Cancel</a><button class="btn p">${c.btn||'Save'}</button></div></form>`;
 const fm=$('form',m);fm.oninput=()=>dirty=true;onbeforeunload=()=>dirty?'':undefined;$('.mb a',m).onclick=e=>{if(dirty&&!confirm('Discard unsaved changes?'))e.preventDefault()};
 fm.onsubmit=e=>{e.preventDefault();const v={},er={};
  c.fields.forEach(f=>{if(f.g)return;const el=$(`[name=${f.n}]`,m);v[f.n]=el.value.trim();$('#f_'+f.n).classList.remove('bad');$('#f_'+f.n+' .err').textContent=f.h||'';
   if(f.t=='file'){const fl=el.files[0];if(fl&&!/^image\/(jpeg|png)$/.test(fl.type))er[f.n]='JPG or PNG only';else if(fl&&fl.size>2*1024*1024)er[f.n]='Maximum 2 MB';return}
   if(/[<>]/.test(v[f.n]))er[f.n]='Characters < and > are not allowed';
   else if(f.req&&!v[f.n]&&!f.dis)er[f.n]='Required';else if(f.t=='email'&&v[f.n]&&!/^\S+@\S+\.\S+$/.test(v[f.n]))er[f.n]='Invalid email'});
  Object.assign(er,Object.keys(er).length?{}:c.save(v)||{});if(!Object.keys(er).length)dirty=false;
  Object.entries(er).forEach(([k,msg])=>{$('#f_'+k).classList.add('bad');$('#f_'+k+' .err').textContent=msg})}}
// delFlow: safe delete (block if in use, offer Inactive instead)
function delFlow(name,blockMsg,onInactive,onDelete){
 if(blockMsg)return modal(`<h3>Delete ${esc(name)}?</h3><p>${blockMsg} It cannot be deleted.${onInactive?' Mark it inactive?':''}</p>`,[['Cancel',''],...(onInactive?[['Mark inactive','p',onInactive]]:[])]);
 modal(`<h3>Delete ${esc(name)}?</h3><p>This cannot be undone.</p>`,[['Cancel',''],['Delete','d',onDelete]])}
function done(D,draw,msg){save(D);if(draw)draw();toast(msg)}
const sheetSt=s=>s.courses.length<4?'Incomplete':s.sheetSaved?'Saved':Object.keys(s.draft||{}).length?'In progress':'Not started';
const taken=(D,sl,bid)=>D.students.filter(s=>s.branchId==bid&&Object.values(s.picks).includes(sl.id)).length;
// query() mimics the server list API: it takes search, filters, page, pageSize and returns ONE page + the filtered total. Replace its body with a fetch() later.
function query(c,{s,f,pg,ps}){const r=c.rows().filter(x=>(!s||c.keys(x).toLowerCase().includes(s))&&(c.filters||[]).every((fl,i)=>!f[i]||(fl.g?fl.g(x,f[i]):fl.f(x)==f[i])));const totalPages=Math.max(1,Math.ceil(r.length/ps)),page=Math.min(pg,totalPages);return{data:r.slice((page-1)*ps,page*ps),total:r.length,totalPages,page}}
const acct=s=>s.status=='invite'?bdg('Invite sent','i'):s.status=='active'?bdg('Active','ok'):bdg('Inactive');
// Mascot (bottom-right corner on every page): loaded from js/mascot.js
(()=>{const s=document.currentScript;if(!s||!s.src)return;const m=document.createElement('script');m.src=s.src.replace(/app\.js(\?.*)?$/,'mascot.js');document.body.appendChild(m)})();
