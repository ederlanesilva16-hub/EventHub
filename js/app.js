const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const money = value => Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const today = new Date();
const isoDate = d => {const date=new Date(d);return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;};
const plusDays = n => { const d = new Date(); d.setDate(d.getDate()+n); return isoDate(d); };
const seed = {
  events: [
    {id:1,name:"Tech Summit 2026",category:"Tecnologia",date:plusDays(2),time:"09:00",location:"Centro de Inovação",city:"Blumenau, SC",capacity:180,price:49.9,status:"Publicado",description:"Encontro sobre inovação e tecnologia."},
    {id:2,name:"Design Experience",category:"Design",date:plusDays(4),time:"14:00",location:"Centro de Convenções",city:"Florianópolis, SC",capacity:120,price:35,status:"Publicado",description:"Experiência sobre criatividade e design."},
    {id:3,name:"Workshop de Empreendedorismo",category:"Negócios",date:plusDays(-5),time:"19:00",location:"Auditório Municipal",city:"Itajaí, SC",capacity:60,price:0,status:"Finalizado",description:"Workshop para novos empreendedores."}
  ],
  participants: [
    {id:1,name:"Mariana Costa",email:"mariana@email.com",phone:"(47) 99911-2233",eventId:1,status:"Confirmado"},
    {id:2,name:"Lucas Martins",email:"lucas@email.com",phone:"(47) 98822-3344",eventId:1,status:"Confirmado"},
    {id:3,name:"Ana Oliveira",email:"ana@email.com",phone:"(48) 97733-4455",eventId:2,status:"Pendente"},
    {id:4,name:"Pedro Souza",email:"pedro@email.com",phone:"(47) 96644-5566",eventId:2,status:"Confirmado"}
  ],
  registrations: [
    {id:1,participantId:1,eventId:1,date:isoDate(new Date()),status:"Confirmada",checked:false},
    {id:2,participantId:2,eventId:1,date:isoDate(new Date()),status:"Confirmada",checked:true},
    {id:3,participantId:3,eventId:2,date:isoDate(new Date()),status:"Pendente",checked:false},
    {id:4,participantId:4,eventId:2,date:isoDate(new Date()),status:"Confirmada",checked:false}
  ],
  speakers: [
    {id:1,name:"Camila Ferreira",role:"Especialista em inovação",bio:"Palestrante e consultora de transformação digital.",eventId:1},
    {id:2,name:"Rafael Mendes",role:"Product Designer",bio:"Atua com experiência do usuário e design de produtos.",eventId:2}
  ],
  sessions: [
    {id:1,title:"Abertura e boas-vindas",time:"09:00",date:plusDays(12),room:"Auditório principal",eventId:1,speakerId:1},
    {id:2,title:"O futuro da tecnologia",time:"10:00",date:plusDays(12),room:"Auditório principal",eventId:1,speakerId:1},
    {id:3,title:"Design centrado nas pessoas",time:"14:00",date:plusDays(24),room:"Sala 2",eventId:2,speakerId:2}
  ]
};
let db = loadDB();
let currentPage = "dashboard";
let editing = null;
let modalType = null;
let dataTable = null;
let eventsTable = null;

function loadDB() {
  try {
    const saved = JSON.parse(localStorage.getItem("eventhub_db"));
    if (saved && saved.events) return saved;
  } catch(e) {}
  localStorage.setItem("eventhub_db", JSON.stringify(seed));
  return structuredClone(seed);
}
function saveDB() { localStorage.setItem("eventhub_db", JSON.stringify(db)); }
function uid(collection) { return Math.max(0, ...collection.map(x => Number(x.id)||0)) + 1; }
function eventName(id) { return db.events.find(e => e.id === Number(id))?.name || "Evento removido"; }
function participantName(id) { return db.participants.find(p => p.id === Number(id))?.name || "Participante removido"; }
function speakerName(id) { return db.speakers.find(p => p.id === Number(id))?.name || "A definir"; }
function dateBR(date) { if(!date) return "—"; return new Date(date+"T12:00:00").toLocaleDateString("pt-BR"); }
function statusClass(status) { return status==="Rascunho"?"draft":status==="Finalizado"?"finished":status==="Pendente"?"pending":status==="Cancelada"?"cancelled":""; }
function toast(message, error=false) {
  const el=document.createElement("div"); el.className="toast"+(error?" error":""); el.textContent=message; $("#toastRegion").append(el);
  setTimeout(()=>el.remove(),3200);
}
function applyTheme(dark) {
  document.body.classList.toggle("dark", dark);
  localStorage.setItem("eventhub_theme", dark?"dark":"light");
  $("#themeToggle").innerHTML = dark?'<i class="bi bi-sun"></i>':'<i class="bi bi-moon-stars"></i>';
  if ($("#settingsTheme")) $("#settingsTheme").checked=dark;
}
function showPage(page) {
  currentPage=page;
  $$(".page").forEach(p=>p.classList.toggle("active",p.id===`page-${page}`));
  $$(".nav-link[data-page]").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
  const active=$(`.nav-link[data-page="${page}"]`);
  $("#pageCrumb").textContent=active?active.textContent.trim():"Configurações";
  $("#sidebar").classList.remove("open");
  renderAll();
}
function renderAll() {
  renderDashboard(); renderEvents(); renderParticipants(); renderRegistrations(); renderSpeakers(); renderSchedule(); renderReports();
}
function renderDashboard() {
  const regs=db.registrations.filter(r=>r.status!=="Cancelada");
  $("#statEvents").textContent=db.events.length;
  $("#statParticipants").textContent=db.participants.length;
  $("#statRegistrations").textContent=regs.length;
  $("#statRevenue").textContent=money(regs.reduce((sum,r)=>{const e=db.events.find(x=>x.id===r.eventId);return sum+(e?Number(e.price)||0:0)},0));
  const counts=db.events.map(e=>({name:e.name,count:regs.filter(r=>r.eventId===e.id).length})).slice(0,5);
  const max=Math.max(1,...counts.map(x=>x.count));
  $("#registrationChart").innerHTML=counts.length?counts.map(x=>`<div class="bar-item"><b>${x.count}</b><div class="bar-track"><div class="bar-fill" style="height:${Math.max(4,x.count/max*100)}%"></div></div><small title="${escapeHTML(x.name)}">${escapeHTML(x.name)}</small></div>`).join(""):'<p>Nenhum dado para exibir.</p>';
  const upcoming=db.events.filter(e=>e.date>=isoDate(today)&&e.status!=="Finalizado").sort((a,b)=>a.date.localeCompare(b.date)).slice(0,4);
  $("#upcomingList").innerHTML=upcoming.length?upcoming.map(e=>`<div class="upcoming-item"><div class="date-tile"><b>${new Date(e.date+"T12:00:00").getDate()}</b><small>${new Date(e.date+"T12:00:00").toLocaleDateString("pt-BR",{month:"short"})}</small></div><div><strong>${escapeHTML(e.name)}</strong><small>${dateBR(e.date)} · ${escapeHTML(e.location)}</small></div></div>`).join(""):'<p>Nenhum evento próximo.</p>';
  $("#recentEvents").innerHTML=db.events.slice().sort((a,b)=>b.id-a.id).slice(0,4).map(e=>`<tr><td><strong>${escapeHTML(e.name)}</strong></td><td>${dateBR(e.date)}</td><td>${escapeHTML(e.location)}</td><td><span class="status ${statusClass(e.status)}">${e.status}</span></td></tr>`).join("");
}
function renderEvents() {
  const search=($("#eventSearch")?.value||"").toLowerCase(), filter=$("#eventStatusFilter")?.value||"";
  const list=db.events.filter(e=>(e.name+" "+e.location+" "+(e.city||"")+" "+e.category).toLowerCase().includes(search)&&(!filter||e.status===filter));
  if(eventsTable){eventsTable.destroy();eventsTable=null;}
  $("#eventsBody").innerHTML=list.map(e=>`<tr><td><strong>${escapeHTML(e.name)}</strong><br><small>${escapeHTML(e.category||"Evento")}</small></td><td>${dateBR(e.date)} · ${escapeHTML(e.time||"")}</td><td>${escapeHTML([e.location,e.city].filter(Boolean).join(", "))}</td><td><span class="status ${statusClass(e.status)}">${escapeHTML(e.status)}</span></td><td>${db.registrations.filter(r=>r.eventId===e.id&&r.status!=="Cancelada").length} / ${Number(e.capacity)||0}</td><td><button class="small-action" data-view-event="${e.id}">Detalhes</button> <button class="small-action" data-edit="event" data-id="${e.id}">Editar</button> <button class="small-action danger" data-delete="event" data-id="${e.id}">Excluir</button></td></tr>`).join("");
  if(window.DataTable) eventsTable=new DataTable("#eventsTable",{pageLength:5,order:[],language:{search:"Buscar:",lengthMenu:"Mostrar _MENU_",info:"Mostrando _START_ a _END_ de _TOTAL_",infoEmpty:"Nenhum evento",zeroRecords:"Nenhum evento encontrado",paginate:{first:"Primeira",last:"Última",next:"Próxima",previous:"Anterior"}}});
}
function renderParticipants() {
  if(dataTable){dataTable.destroy();dataTable=null;}
  $("#participantsBody").innerHTML=db.participants.map(p=>`<tr><td><strong>${escapeHTML(p.name)}</strong></td><td>${escapeHTML(p.cpf||"—")}</td><td>${escapeHTML(p.email)}</td><td>${escapeHTML(p.phone||"—")}</td><td>${escapeHTML(eventName(p.eventId))}</td><td><span class="status ${p.status==="Pendente"?"pending":""}">${escapeHTML(p.status)}</span></td><td><button class="small-action" data-edit="participant" data-id="${p.id}">Editar</button> <button class="small-action danger" data-delete="participant" data-id="${p.id}">Excluir</button></td></tr>`).join("");
  if(window.DataTable) dataTable=new DataTable("#participantsTable",{pageLength:5,order:[],language:{search:"Buscar:",lengthMenu:"Mostrar _MENU_",info:"Mostrando _START_ a _END_ de _TOTAL_",infoEmpty:"Nenhum registro",zeroRecords:"Nenhum participante encontrado",paginate:{first:"Primeira",last:"Última",next:"Próxima",previous:"Anterior"}}});
}
function renderRegistrations() {
  const active=db.registrations.filter(r=>r.status!=="Cancelada");
  $("#regTotal").textContent=active.length; $("#regPresent").textContent=active.filter(r=>r.checked).length; $("#regPending").textContent=active.filter(r=>!r.checked).length;
  $("#registrationsBody").innerHTML=db.registrations.map(r=>`<tr><td>${escapeHTML(participantName(r.participantId))}</td><td>${escapeHTML(eventName(r.eventId))}</td><td>${dateBR(r.date)}</td><td><span class="status ${statusClass(r.status)}">${r.status}</span></td><td>${r.checked?'<span class="status">Presente</span>':'<span class="status pending">Pendente</span>'}</td><td>${r.status!=="Cancelada"?`<button class="small-action" data-checkin="${r.id}">${r.checked?"Desfazer":"Check-in"}</button> <button class="small-action danger" data-cancel-reg="${r.id}">Cancelar</button>`:"—"}</td></tr>`).join("");
}
function renderSpeakers() {
  $("#speakersGrid").innerHTML=db.speakers.length?db.speakers.map(s=>`<article class="speaker-card"><div class="speaker-avatar"><i class="bi bi-person"></i></div><h3>${escapeHTML(s.name)}</h3><p>${escapeHTML(s.role)}</p><span class="soft-tag">${escapeHTML(eventName(s.eventId))}</span><p>${escapeHTML(s.bio||"")}</p><div class="event-actions"><button class="small-action" data-edit="speaker" data-id="${s.id}">Editar</button><button class="small-action danger" data-delete="speaker" data-id="${s.id}">Excluir</button></div></article>`).join(""):'<div class="panel"><p>Nenhum palestrante cadastrado.</p></div>';
}
function renderSchedule() {
  const list=db.sessions.slice().sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
  $("#scheduleList").innerHTML=list.length?list.map(s=>`<div class="schedule-item"><div class="schedule-time">${escapeHTML(s.time)}<p>${dateBR(s.date)}</p></div><div><strong>${escapeHTML(s.title)}</strong><p>${escapeHTML(eventName(s.eventId))} · ${escapeHTML(speakerName(s.speakerId))} · ${escapeHTML(s.room||"Local a definir")}</p></div><div><button class="small-action" data-edit="session" data-id="${s.id}">Editar</button> <button class="small-action danger" data-delete="session" data-id="${s.id}">Excluir</button></div></div>`).join(""):'<p>Nenhuma atividade cadastrada.</p>';
}
function renderReports() {
  const active=db.registrations.filter(r=>r.status!=="Cancelada"), capacity=db.events.reduce((s,e)=>s+(Number(e.capacity)||0),0);
  const occupancy=capacity?Math.round(active.length/capacity*100):0;
  const revenue=active.reduce((s,r)=>s+(Number(db.events.find(e=>e.id===r.eventId)?.price)||0),0);
  $("#occupancyRate").textContent=occupancy+"%"; $("#checkinCount").textContent=active.filter(r=>r.checked).length; $("#publishedCount").textContent=db.events.filter(e=>e.status==="Publicado").length; $("#reportRevenue").textContent=money(revenue);
  $("#reportBody").innerHTML=db.events.map(e=>{const n=active.filter(r=>r.eventId===e.id).length;return `<tr><td><strong>${escapeHTML(e.name)}</strong></td><td>${e.capacity}</td><td>${n}</td><td>${e.capacity?Math.round(n/e.capacity*100):0}%</td><td>${money(n*e.price)}</td></tr>`}).join("");
}
function escapeHTML(value) { return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
const selectOptions=(items,valueFn,labelFn,empty="Selecione",selectedValue=null)=>`<option value="">${empty}</option>`+items.map(x=>`<option value="${valueFn(x)}" ${selectedValue!==null&&Number(valueFn(x))===Number(selectedValue)?"selected":""}>${escapeHTML(labelFn(x))}</option>`).join("");
function field(label,name,value="",type="text",full=false,extra="") {return `<div class="field ${full?"full":""}"><label for="f_${name}">${label}</label><input id="f_${name}" name="${name}" type="${type}" value="${escapeHTML(value)}" ${extra}></div>`;}
function selectField(label,name,items,value,labelFn,full=false) {return `<div class="field ${full?"full":""}"><label for="f_${name}">${label}</label><select id="f_${name}" name="${name}" required>${selectOptions(items,x=>x.id,labelFn,"Selecione",value)}</select></div>`;}
function openModal(type,id=null) {
  modalType=type; editing=id; const item=id?getCollection(type).find(x=>x.id===id):{};
  const titles={event:id?"Editar evento":"Novo evento",participant:id?"Editar participante":"Novo participante",registration:"Nova inscrição",speaker:id?"Editar palestrante":"Novo palestrante",session:id?"Editar atividade":"Nova atividade"};
  $("#modalTitle").textContent=titles[type]; let html="";
  if(type==="event"){
    html=field("Nome do evento","name",item.name||"", "text",true,"required")+`<div class="field"><label>Categoria</label><select name="category"><option>Tecnologia</option><option>Design</option><option>Negócios</option><option>Educação</option><option>Entretenimento</option><option>Outro</option></select></div>`+field("Data","date",item.date||plusDays(15),"date",false,"required")+field("Horário","time",item.time||"09:00","time",false,"required")+field("Local / endereço","location",item.location||"","text",false,"required")+field("Cidade","city",item.city||item.location||"","text",false,'required placeholder="Ex.: Blumenau, SC"')+field("Capacidade","capacity",item.capacity||100,"number",false,'min="1" required')+field("Valor (R$)","price",item.price??0,"number",false,'min="0" step="0.01"')+`<div class="field"><label>Status</label><select name="status"><option>Publicado</option><option>Rascunho</option><option>Finalizado</option></select></div><div class="field full"><label>Descrição</label><textarea name="description">${escapeHTML(item.description||"")}</textarea></div><div class="field full"><label>Localização e previsão do tempo</label><div class="api-key-row"><button type="button" id="weatherLookupBtn" class="btn btn-outline"><i class="bi bi-cloud-sun"></i> Consultar clima da cidade</button></div><small id="weatherResult" class="muted">Consulta API Ninjas + OpenWeatherMap; configure as chaves em Configurações.</small></div><input type="hidden" name="latitude" value="${escapeHTML(item.latitude??"")}"><input type="hidden" name="longitude" value="${escapeHTML(item.longitude??"")}"><input type="hidden" name="weather" value='${escapeHTML(item.weather?JSON.stringify(item.weather):"")}'>`;
  } else if(type==="participant"){
    html=field("Nome completo","name",item.name||"","text",true,"required")+field("CPF","cpf",item.cpf||"","text",false,'inputmode="numeric" maxlength="14" placeholder="000.000.000-00" required')+field("E-mail","email",item.email||"","email",false,"required")+field("Telefone","phone",item.phone||"")+selectField("Evento","eventId",db.events,item.eventId,e=>e.name,true)+`<div class="field"><label>Status</label><select name="status"><option>Confirmado</option><option>Pendente</option></select></div>`;
  } else if(type==="registration"){
    html=selectField("Participante","participantId",db.participants,null,p=>p.name,true)+selectField("Evento","eventId",db.events,null,e=>e.name,true)+field("Data da inscrição","date",isoDate(today),"date")+`<div class="field full"><label>Status</label><select name="status"><option>Confirmada</option><option>Pendente</option></select></div>`;
  } else if(type==="speaker"){
    html=field("Nome","name",item.name||"","text",true,"required")+field("Especialidade / cargo","role",item.role||"","text",true,"required")+selectField("Evento","eventId",db.events,item.eventId,e=>e.name,true)+`<div class="field full"><label>Biografia</label><textarea name="bio">${escapeHTML(item.bio||"")}</textarea></div>`;
  } else if(type==="session"){
    html=field("Título da atividade","title",item.title||"","text",true,"required")+field("Data","date",item.date||plusDays(15),"date")+field("Horário","time",item.time||"09:00","time")+field("Sala / local","room",item.room||"")+selectField("Evento","eventId",db.events,item.eventId,e=>e.name)+selectField("Palestrante","speakerId",db.speakers,item.speakerId,s=>s.name);
  }
  $("#modalFields").innerHTML=html;
  const form=$("#modalForm"); if(type==="event"&&item.category) form.elements.category.value=item.category;
  if(type==="event"&&item.status) form.elements.status.value=item.status;
  if(type==="participant"&&item.status) form.elements.status.value=item.status;
  $("#modalBackdrop").classList.remove("hidden");
  if(type==="event"&&item.weather) $("#weatherResult").textContent=`Previsão salva: ${item.weather.description}, ${item.weather.min}°C a ${item.weather.max}°C.`;
}
function showEventDetails(id){
  const e=db.events.find(item=>item.id===id); if(!e)return;
  modalType="details"; editing=null; $("#modalTitle").textContent="Detalhes do evento";
  const regs=db.registrations.filter(r=>r.eventId===id&&r.status!=="Cancelada");
  const weather=e.weather?`<p><strong>Clima:</strong> ${escapeHTML(e.weather.description)} · ${e.weather.min}°C a ${e.weather.max}°C (previsão para ${dateBR(e.weather.date)})</p>`:'<p><strong>Clima:</strong> sem previsão salva. Edite o evento e consulte o clima para carregar os dados.</p>';
  $("#modalFields").innerHTML=`<div class="field full"><h3>${escapeHTML(e.name)}</h3><p>${escapeHTML(e.description||"Sem descrição.")}</p><p><strong>Data:</strong> ${dateBR(e.date)} às ${escapeHTML(e.time||"—")}</p><p><strong>Local:</strong> ${escapeHTML([e.location,e.city].filter(Boolean).join(", "))}</p><p><strong>Vagas:</strong> ${regs.length} de ${Number(e.capacity)||0} · ${escapeHTML(e.status)}</p><p><strong>Palestrantes:</strong> ${db.speakers.filter(s=>s.eventId===id).map(s=>escapeHTML(s.name)).join(", ")||"A definir"}</p>${weather}</div>`;
  $("#modalForm").querySelector(".modal-actions").classList.add("hidden"); $("#modalBackdrop").classList.remove("hidden");
}
function getCollection(type){return db[({event:"events",participant:"participants",registration:"registrations",speaker:"speakers",session:"sessions"})[type]];}
function closeModal(){ $("#modalBackdrop").classList.add("hidden"); $("#modalForm").reset(); $("#modalForm").querySelector(".modal-actions").classList.remove("hidden"); editing=null; modalType=null; }
function saveModal(event) {
  event.preventDefault(); const form=new FormData(event.currentTarget); const data=Object.fromEntries(form.entries());
  const numeric=["capacity","price","eventId","participantId","speakerId"]; numeric.forEach(k=>{if(data[k]!==undefined)data[k]=data[k]===""?null:Number(data[k]);});
  if(modalType==="event"&&(!data.name||!data.location||!data.city||!data.date||!data.capacity||Number(data.capacity)<1)){toast("Preencha nome, data, local, cidade e uma capacidade válida.",true);return;}
  if(modalType==="participant"){
    const cpf=data.cpf.replace(/\D/g,"");
    if(cpf.length!==11){toast("Informe um CPF com 11 dígitos.",true);return;}
    if(db.participants.some(p=>p.cpf&&p.cpf.replace(/\D/g,"")===cpf&&p.id!==editing)){toast("Já existe um participante cadastrado com este CPF.",true);return;}
    if(!editing&&data.eventId){const eventRecord=db.events.find(e=>e.id===data.eventId);if(eventRecord&&db.registrations.filter(r=>r.eventId===eventRecord.id&&r.status!=="Cancelada").length>=Number(eventRecord.capacity)){toast("Este evento atingiu a capacidade máxima.",true);return;}}
    data.cpf=cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,"$1.$2.$3-$4");
  }
  if(modalType==="registration"){
    if(!data.participantId||!data.eventId){toast("Selecione participante e evento.",true);return;}
    const duplicate=db.registrations.some(r=>r.participantId===data.participantId&&r.eventId===data.eventId&&r.status!=="Cancelada");
    if(duplicate){toast("Este participante já possui inscrição ativa neste evento.",true);return;}
    const eventRecord=db.events.find(e=>e.id===data.eventId);
    if(eventRecord&&db.registrations.filter(r=>r.eventId===eventRecord.id&&r.status!=="Cancelada").length>=Number(eventRecord.capacity)){toast("Este evento atingiu a capacidade máxima.",true);return;}
    data.checked=false;
  }
  if(modalType==="event"){
    data.latitude=data.latitude===""?null:Number(data.latitude); data.longitude=data.longitude===""?null:Number(data.longitude);
    try{data.weather=data.weather?JSON.parse(data.weather):null;}catch{data.weather=null;}
  }
  const collection=getCollection(modalType);
  if(editing){const index=collection.findIndex(x=>x.id===editing);collection[index]={...collection[index],...data};toast("Informações atualizadas com sucesso.");}
  else {data.id=uid(collection);if(modalType==="registration"&&!data.status)data.status="Confirmada";collection.push(data);toast("Cadastro realizado com sucesso.");}
  if(modalType==="participant"&&!editing&&data.eventId){db.registrations.push({id:uid(db.registrations),participantId:data.id,eventId:data.eventId,date:isoDate(today),status:"Confirmada",checked:false});}
  saveDB();closeModal();renderAll();
}
function deleteItem(type,id) {
  if(!confirm("Tem certeza de que deseja excluir este registro?"))return;
  const collection=getCollection(type); const index=collection.findIndex(x=>x.id===id);
  if(index<0){toast("Registro não encontrado.",true);return;}
  collection.splice(index,1);
  if(type==="event"){db.registrations=db.registrations.filter(r=>r.eventId!==id);db.sessions=db.sessions.filter(s=>s.eventId!==id);db.speakers=db.speakers.filter(s=>s.eventId!==id);}
  if(type==="participant")db.registrations=db.registrations.filter(r=>r.participantId!==id);
  saveDB();renderAll();toast("Registro excluído.");
}
function exportCSV(){
  const rows=[["Evento","Data","Capacidade","Inscritos","Ocupação","Receita"],...db.events.map(e=>{const n=db.registrations.filter(r=>r.eventId===e.id&&r.status!=="Cancelada").length;return [e.name,dateBR(e.date),e.capacity,n,(e.capacity?Math.round(n/e.capacity*100):0)+"%",money(n*e.price)]})];
  const csv="\uFEFF"+rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(";")).join("\n");
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));a.download="relatorio-eventhub.csv";a.click();URL.revokeObjectURL(a.href);toast("Relatório exportado.");
}

$("#loginForm").addEventListener("submit",e=>{e.preventDefault();const email=$("#loginEmail").value.trim().toLowerCase(),password=$("#loginPassword").value;if(email!=="admin@eventhub.com"||password!=="123456"){toast("E-mail ou senha incorretos. Use as credenciais demonstrativas informadas.",true);return;}$("#loginScreen").classList.add("hidden");$("#appShell").classList.remove("hidden");localStorage.setItem("eventhub_logged","true");showPage("dashboard");});
$(".toggle-password").addEventListener("click",()=>{const input=$("#loginPassword"),show=input.type==="password";input.type=show?"text":"password";$(".toggle-password").innerHTML=show?'<i class="bi bi-eye-slash"></i>':'<i class="bi bi-eye"></i>';});
$("#logoutBtn").addEventListener("click",()=>{localStorage.removeItem("eventhub_logged");$("#appShell").classList.add("hidden");$("#loginScreen").classList.remove("hidden");toast("Você saiu do sistema.");});
$("#themeToggle").addEventListener("click",()=>applyTheme(!document.body.classList.contains("dark")));
$("#settingsTheme").addEventListener("change",e=>applyTheme(e.target.checked));
$("#mobileMenu").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));
$("#closeModal").addEventListener("click",closeModal);$("#cancelModal").addEventListener("click",closeModal);$("#modalBackdrop").addEventListener("click",e=>{if(e.target.id==="modalBackdrop")closeModal();});
$("#modalForm").addEventListener("submit",saveModal);
document.addEventListener("click",e=>{
  const detail=e.target.closest("[data-view-event]");if(detail){showEventDetails(Number(detail.dataset.viewEvent));return;}
  const page=e.target.closest("[data-page]");if(page){showPage(page.dataset.page);return;}
  const action=e.target.closest("[data-action]");if(action){openModal(({ "new-event":"event","new-participant":"participant","new-registration":"registration","new-speaker":"speaker","new-session":"session"})[action.dataset.action]);return;}
  const edit=e.target.closest("[data-edit]");if(edit){openModal(edit.dataset.edit,Number(edit.dataset.id));return;}
  const del=e.target.closest("[data-delete]");if(del){deleteItem(del.dataset.delete,Number(del.dataset.id));return;}
  const check=e.target.closest("[data-checkin]");if(check){const r=db.registrations.find(x=>x.id===Number(check.dataset.checkin));r.checked=!r.checked;saveDB();renderAll();toast(r.checked?"Check-in confirmado!":"Check-in desfeito.");return;}
  const cancel=e.target.closest("[data-cancel-reg]");if(cancel){const r=db.registrations.find(x=>x.id===Number(cancel.dataset.cancelReg));r.status="Cancelada";saveDB();renderAll();toast("Inscrição cancelada.");}
});
$("#eventSearch").addEventListener("input",renderEvents);$("#eventStatusFilter").addEventListener("change",renderEvents);
$("#exportReport").addEventListener("click",exportCSV);
$("#saveApiKey").addEventListener("click",()=>{const key=$("#ninjasKey").value.trim();if(!key){toast("Informe uma chave válida.",true);return;}localStorage.setItem("eventhub_ninjas_key",key);$("#ninjasKey").value="";toast("Chave salva neste navegador.");});
$("#saveWeatherKey").addEventListener("click",()=>{const key=$("#weatherKey").value.trim();if(!key){toast("Informe uma chave OpenWeatherMap válida.",true);return;}localStorage.setItem("eventhub_weather_key",key);$("#weatherKey").value="";toast("Chave OpenWeatherMap salva neste navegador.");});
$("#cepSearch").addEventListener("click",async()=>{const out=$("#cepResult");out.textContent="Consultando...";try{const d=await Integrations.buscarCep($("#cepInput").value);out.textContent=`${d.street||"Logradouro não informado"}, ${d.neighborhood||""} - ${d.city}/${d.state}`;}catch(e){out.textContent=e.message;toast(e.message,true);}});
document.addEventListener("click",async e=>{if(e.target.closest("#weatherLookupBtn")){const city=$("#f_city").value.trim(),date=$("#f_date").value,out=$("#weatherResult");if(!city||!date){out.textContent="Preencha a cidade e a data do evento.";return;}out.textContent="Consultando localização e previsão...";try{const places=await Integrations.buscarCidadeNinjas(city);if(!places.length)throw new Error("Cidade não encontrada pela API Ninjas.");const place=places[0],weather=await Integrations.buscarClima(place.latitude,place.longitude,date);$("#modalForm").elements.latitude.value=place.latitude;$("#modalForm").elements.longitude.value=place.longitude;$("#modalForm").elements.weather.value=JSON.stringify(weather);out.textContent=`${place.state||city}, ${place.country||""} · ${weather.description}, ${weather.min}°C a ${weather.max}°C em ${dateBR(date)} (lat. ${place.latitude}, long. ${place.longitude}).`;}catch(err){out.textContent=err.message;toast(err.message,true);}}});
$("#todayLabel").textContent=today.toLocaleDateString("pt-BR",{weekday:"short",day:"2-digit",month:"short",year:"numeric"});
applyTheme(localStorage.getItem("eventhub_theme")==="dark");
if(localStorage.getItem("eventhub_ninjas_key"))$("#ninjasKey").placeholder="Chave salva (digite para substituir)";
if(localStorage.getItem("eventhub_weather_key"))$("#weatherKey").placeholder="Chave salva (digite para substituir)";
if(localStorage.getItem("eventhub_logged")==="true"){ $("#loginScreen").classList.add("hidden");$("#appShell").classList.remove("hidden"); }
renderAll();
