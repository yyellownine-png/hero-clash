const state={api:sessionStorage.getItem('hc_admin_api')||'',key:sessionStorage.getItem('hc_admin_key')||''};
const $=s=>document.querySelector(s);
const login=$('#login'),dash=$('#dashboard');
$('#api').value=state.api; $('#key').value=state.key;
function apiUrl(path){return state.api.replace(/\/$/,'')+path}
async function call(path,body={}){const r=await fetch(apiUrl(path),{method:'POST',headers:{'Content-Type':'application/json','x-admin-key':state.key},body:JSON.stringify(body)});const j=await r.json().catch(()=>({ok:false,error:'Bad server response'}));if(!r.ok||!j.ok)throw new Error(j.error||`HTTP ${r.status}`);return j}
function fmtDate(v){if(!v)return '—';return new Date(v.replace(' ','T')+'Z').toLocaleString('ru-RU',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}
function setText(id,v){$(id).textContent=String(v??0)}
function renderChart(rows){const el=$('#chart');el.innerHTML='';const max=Math.max(1,...rows.map(x=>Number(x.users||0)));rows.forEach(x=>{const w=document.createElement('div');w.className='bar-wrap';const b=document.createElement('b');b.textContent=x.users;const bar=document.createElement('div');bar.className='bar';bar.style.height=`${Math.max(3,(Number(x.users)/max)*170)}px`;const d=document.createElement('small');d.textContent=x.date.slice(5);w.append(b,bar,d);el.append(w)})}
async function load(){
  const s=await call('/api/admin/stats');
  setText('#total',s.users.total);setText('#today',s.users.today);setText('#week',s.users.week);setText('#month',s.users.month);
  setText('#onlineNow',s.active.now);setText('#aNow',s.active.now);setText('#aToday',s.active.today);setText('#aWeek',s.active.week);setText('#aMonth',s.active.month);
  setText('#orders',s.orders.total);setText('#paid',s.orders.paid);setText('#pending',s.orders.pending);
  const ton=s.revenue.find(x=>x.method==='gram');const usdt=s.revenue.find(x=>x.method==='usdt');setText('#tonRevenue',ton?Number(ton.amount).toFixed(4):'0');setText('#usdtRevenue',usdt?Number(usdt.amount).toFixed(2):'0');
  $('#updated').textContent='Обновлено '+new Date(s.generatedAt).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  renderChart(s.newUsersByDay);
  const u=await call('/api/admin/users',{limit:100});const tbody=$('#users');tbody.innerHTML='';u.users.forEach(x=>{const tr=document.createElement('tr');tr.innerHTML=`<td>${x.id}</td><td>${x.username?'@'+x.username:'—'}</td><td>${x.level}</td><td>💎 ${x.gems}</td><td>${fmtDate(x.created_at)}</td><td>${fmtDate(x.last_seen)}</td>`;tbody.append(tr)})
}
async function enter(){state.api=$('#api').value.trim();state.key=$('#key').value;$('#loginError').textContent='';if(!state.api||!state.key){$('#loginError').textContent='Укажи API URL и ADMIN_KEY';return}try{await call('/api/admin/stats');sessionStorage.setItem('hc_admin_api',state.api);sessionStorage.setItem('hc_admin_key',state.key);login.hidden=true;dash.hidden=false;await load()}catch(e){$('#loginError').textContent=e.message}}
$('#loginBtn').onclick=enter;$('#key').onkeydown=e=>{if(e.key==='Enter')enter()};$('#refresh').onclick=()=>load().catch(e=>alert(e.message));$('#logout').onclick=()=>{sessionStorage.clear();location.reload()};
if(state.api&&state.key){login.hidden=true;dash.hidden=false;load().catch(e=>{login.hidden=false;dash.hidden=true;$('#loginError').textContent=e.message})}
