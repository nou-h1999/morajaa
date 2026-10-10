(() => {
  'use strict';
  const root=document.getElementById('morajaa-home');
  if(!root||!window.MorajaaDemo)return;
  const D=window.MorajaaDemo, $=s=>root.querySelector(s), $$=s=>Array.from(root.querySelectorAll(s));
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const key='morajaa-demo-v1';let state;
  const initial=()=>({requests:[],notes:[],documents:[],sessions:[{id:'example',date:'2026-10-10T15:00:00Z',duration:60,format:'presentiel',location:'Rabat, Agdal — lieu à convenir',price:120,status:'planned'}],learner:{},listing:null,accepted:false,archived:false});
  try{state=JSON.parse(localStorage.getItem(key))||initial();}catch{state=initial();}
  if (state.listing?.status === 'pending_check') state.listing.status = 'pending_review';
  const persist=()=>{try{localStorage.setItem(key,JSON.stringify(state));return true;}catch{return false;}};
  const id=()=>window.crypto?.randomUUID?.()||`demo-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const message=(form,text)=>{const el=form.querySelector('.mj-status');if(el)el.textContent=text;};
  const saveMessage=(form,text)=>message(form,persist()?text:'Modification conservée temporairement ; le stockage de ce navigateur est indisponible.');
  const params=new URLSearchParams(location.search), person=D.profiles.find(p=>p.id===params.get('id'))||D.profiles[0];
  const level=v=>({college:'Collège',lycee:'Lycée',superieur:'Supérieur'}[v]||v);
  const district=p=>D.districts[p.city]?.[p.district]||p.district;
  const badge='<span class="mj-badge">Annonce contrôlée · exemple</span>';
  function card(p){return `<article class="mj-panel mj-profile-card"><span class="mj-avatar" aria-hidden="true">${esc(p.name.charAt(0))}</span><div><h2>${esc(p.name)}</h2><p>${esc(p.background)}</p>${badge}<h3>${esc(D.subjects[p.subject])} · ${esc(level(p.level))}</h3><p>${esc(D.cities[p.city])} · ${esc(district(p))}${p.online?' · En ligne possible':''}</p><p><strong>${p.price} MAD/h</strong></p><a class="mj-button" href="profil.html?id=${p.id}">Voir le profil →</a></div></article>`;}
  $$('[data-tab]').forEach(button=>button.addEventListener('click',()=>{
    const list=button.closest('[role="tablist"]');
    list.querySelectorAll('[data-tab]').forEach(tab=>{const active=tab===button;tab.setAttribute('aria-selected',String(active));$('#'+tab.dataset.tab).hidden=!active;});
  }));
  if($('#search-filters')){
    const f=$('#search-filters');const cities=f.elements.ville, districts=f.elements.quartier;
    const refreshDistricts=()=>{districts.innerHTML='<option value="">Tous quartiers</option>'+Object.entries(D.districts[cities.value]||{}).map(([v,t])=>`<option value="${esc(v)}">${esc(t)}</option>`).join('');districts.disabled=!D.districts[cities.value];};
    ['matiere','ville','niveau','format','budget'].forEach(k=>{if(params.has(k))f.elements[k].value=params.get(k);});refreshDistricts();if(params.has('quartier'))districts.value=params.get('quartier');cities.addEventListener('change',refreshDistricts);
    function render(){const a=Object.fromEntries(new FormData(f));const list=D.profiles.filter(p=>(!a.matiere||p.subject===a.matiere)&&(!a.ville||(a.ville==='en-ligne'?p.online:p.city===a.ville))&&(!a.quartier||p.district===a.quartier)&&(!a.niveau||p.level===a.niveau)&&(!a.format||a.format!=='en-ligne'||p.online)&&(!a.budget||p.price<=Number(a.budget)));$('#result-count').textContent=`${list.length} profil${list.length>1?'s':''} de démonstration`;
    $('#search-results').innerHTML=list.length?list.map(card).join(''):'<div class="mj-panel"><h2>Aucun profil pour ces critères</h2><p>Essayez une autre matière, un budget plus large ou des cours en ligne.</p></div>';}
    f.addEventListener('submit',e=>{e.preventDefault();if(!f.reportValidity())return;const query=new URLSearchParams();new FormData(f).forEach((v,k)=>{if(v)query.set(k,v);});try{history.replaceState(null,'','?'+query);}catch{}render();});
    f.addEventListener('reset',()=>setTimeout(()=>{refreshDistricts();render();},0));f.elements.budget.min=1;render();
  }
  if($('#profile-content')){
    if(params.has('id')&&!D.profiles.some(p=>p.id===params.get('id')))$('#profile-content').innerHTML='<div class="mj-panel"><h2>Profil introuvable</h2><a href="recherche.html">Revenir à la recherche</a></div>';
    else $('#profile-content').innerHTML=`<div class="mj-two-columns"><article class="mj-panel"><span class="mj-avatar">${esc(person.name[0])}</span><h2>${esc(person.name)}</h2><p>${esc(person.background)}</p>${badge}<p class="mj-small">Parcours déclaré. Les compétences ne sont pas certifiées par Morajaa.</p><h3>Ma façon d’accompagner</h3><p>${esc(person.approach)}</p><h3>Matière et niveau</h3><p>${esc(D.subjects[person.subject])} · ${esc(level(person.level))}</p><h3>Ville et quartier</h3><p>${esc(D.cities[person.city])} · ${esc(district(person))}</p><h3>Disponibilités indicatives</h3><p>À convenir ensemble ; aucun créneau réservé à ce stade.</p></article><aside class="mj-panel mj-sand"><h2>${person.price} MAD / heure</h2><p>Présentiel${person.online?' ou en ligne':''}</p><a class="mj-button" href="demande.html?id=${person.id}">Demander un cours</a><p>Mise en relation gratuite au lancement.</p><a href="contact.html?objet=signalement">Signaler ce profil</a></aside></div>`;
  }
  if($('#request-form')){
    const f=$('#request-form');$('#request-person').textContent=`${D.subjects[person.subject]} avec ${person.name} · ${person.price} MAD/h`;
    ['learner','level'].forEach(k=>{if(state.learner[k])f.elements[k].value=state.learner[k];});f.elements.level.value=state.learner.level||person.level;
    if(!person.online){f.elements.format.querySelector('[value="en-ligne"]').disabled=true;}
    f.addEventListener('submit',e=>{e.preventDefault();if(!f.reportValidity())return;if(state.requests.some(r=>r.person===person.id&&r.status==='sent')){message(f,'Une demande ouverte existe déjà pour ce profil. Retrouvez-la dans Mon espace.');return;}
    const values=Object.fromEntries(new FormData(f));state.requests.push({...values,id:id(),person:person.id,status:'sent'});saveMessage(f,'Demande enregistrée en démonstration. Aucun message transmis.');let a=document.createElement('a');a.href='espace.html';a.textContent='Voir ma demande →';a.className='mj-text-link';if(!f.querySelector('a'))f.append(a);});
  }
  $('[data-demo-form]').forEach(f=>f.addEventListener('submit',async e=>{e.preventDefault();if(!f.reportValidity())return;const type=f.dataset.demoForm;
    if(type==='register'){
      if(f.dataset.submitting==='true'||f.dataset.registered==='true')return;
      const firstName=f.elements.firstName.value.trim(), email=f.elements.email.value.trim();
      if(!firstName||!email){message(f,'Renseignez votre prénom et votre adresse email.');return;}
      let endpoint;
      try{
        endpoint=new URL(f.dataset.registerUrl,location.href);
        const local=['localhost','127.0.0.1','[::1]'];
        if(!['http:','https:'].includes(endpoint.protocol)||endpoint.username||endpoint.password||
          (endpoint.protocol!=='https:'&&!local.includes(endpoint.hostname))||
          (local.includes(endpoint.hostname)&&!local.includes(location.hostname))){
          message(f,'L’inscription sera disponible lorsque le service sera connecté au site.');return;
        }
      }catch{message(f,'L’inscription est temporairement indisponible.');return;}
      const button=f.querySelector('button'), label=button.textContent;
      const controller=new AbortController(), timeout=setTimeout(()=>controller.abort(),15000);
      f.dataset.submitting='true';button.disabled=true;button.textContent='Création en cours…';f.setAttribute('aria-busy','true');
      message(f,'Création de votre compte en cours…');
      try{
        const response=await fetch(endpoint.href,{
          method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},
          credentials:'omit',signal:controller.signal,
          body:JSON.stringify({firstName,email,password:f.elements.password.value})
        });
        if(!response.ok){
          message(f,response.status===409?'Cette adresse email est déjà utilisée.':
            response.status===422?'Vérifiez les informations saisies et les exigences du mot de passe.':
            response.status===429?'Trop de tentatives. Réessayez dans quelques minutes.':
            'La création du compte a échoué. Réessayez plus tard.');
          return;
        }
        f.elements.password.value='';
        f.dataset.registered='true';
        message(f,'Votre compte a été créé. La connexion à votre compte sera disponible prochainement.');
        button.textContent='Compte créé';
      }catch(error){
        message(f,error.name==='AbortError'?
          'Le service met trop de temps à répondre. Votre compte a peut-être été créé ; vérifiez avant de réessayer.':
          'Impossible de joindre le service. Vérifiez votre connexion et réessayez.');
      }finally{
        clearTimeout(timeout);delete f.dataset.submitting;f.removeAttribute('aria-busy');
        if(f.dataset.registered!=='true'){button.disabled=false;button.textContent=label;}
      }
      return;
    }
    if(type==='login'){const safeNext=params.get('next');location.href=['demande.html','espace.html','proposer.html'].includes(safeNext)?safeNext:'espace.html';}
    else message(f,type==='reset'?'Démonstration : aucun email envoyé. La récupération de compte sera connectée à FastAPI.':'Démonstration : votre message n’a pas été envoyé. Le formulaire sera connecté au backend.');
  }));
  if($('#learner-form')){const f=$('#learner-form');Object.entries(state.learner).forEach(([k,v])=>{if(f.elements[k])f.elements[k].value=v;});f.addEventListener('submit',e=>{e.preventDefault();if(!f.reportValidity())return;state.learner=Object.fromEntries(new FormData(f));saveMessage(f,'Profil de démonstration enregistré.');});}
  if($('#listing-form')){
    const f=$('#listing-form'), steps=$$('[data-step]');let step=0;f.elements.price.min=1;
    function districts(){const opts=D.districts[f.elements.city.value]||{};f.elements.district.innerHTML=Object.entries(opts).map(([v,t])=>`<option value="${esc(v)}">${esc(t)}</option>`).join('');}f.elements.city.addEventListener('change',districts);districts();
    if(state.listing){Object.entries(state.listing).forEach(([k,v])=>{if(f.elements[k])f.elements[k].value=v;});districts();f.elements.district.value=state.listing.district;}
    const show=()=>{steps.forEach((s,i)=>s.hidden=i!==step);if(step===2){const data=Object.fromEntries(new FormData(f));$('#listing-preview').innerHTML=`<h3>${esc(data.name)} · ${esc(D.subjects[data.subject])}</h3><p>${esc(data.background)}</p><p>${esc(data.approach)}</p><p>${esc(D.cities[data.city])} · ${esc(D.districts[data.city]?.[data.district])} · ${esc(data.price)} MAD/h</p>`;}};
    $$('[data-next]').forEach(b=>b.addEventListener('click',()=>{const invalid=Array.from(steps[step].querySelectorAll('input,textarea,select')).find(el=>!el.checkValidity());if(invalid){invalid.reportValidity();return;}step=Math.min(2,step+1);show();}));
    $$('[data-prev]').forEach(b=>b.addEventListener('click',()=>{step=Math.max(0,step-1);show();}));
    f.addEventListener('submit',e=>{e.preventDefault();if(step!==2)return;state.listing={...Object.fromEntries(new FormData(f)),status:'pending_review'};saveMessage(f,'Annonce enregistrée : en attente de validation manuelle dans la démonstration. Aucune publication réelle.');});
  }
  if($('#sent-requests'))$('#sent-requests').innerHTML=state.requests.length?state.requests.map(r=>{const p=D.profiles.find(p=>p.id===r.person);return `<article class="mj-panel"><h3>${esc(D.subjects[p.subject])} avec ${esc(p.name)}</h3><p>${esc(r.message)}</p><span class="mj-badge">${r.status==='sent'?'Envoyée · démonstration':esc(r.status)}</span></article>`;}).join(''):'<div class="mj-panel"><p>Aucune demande envoyée pour le moment.</p><a href="recherche.html">Trouver un cours →</a></div>';
  function listingStatus(){if($('#listing-status'))$('#listing-status').textContent=state.listing?({pending_review:'En attente de validation manuelle · démonstration',paused:'Annonce en pause · démonstration'}[state.listing.status]||state.listing.status):'Aucune annonce soumise dans ce navigateur.';}
  listingStatus();$('#pause-listing')?.addEventListener('click',()=>{if(!state.listing){$('#listing-status').textContent='Créez une annonce avant de la mettre en pause.';return;}state.listing.status=state.listing.status==='paused'?'pending_review':'paused';persist();listingStatus();$('#pause-listing').textContent=state.listing.status==='paused'?'Soumettre à validation':'Mettre en pause';});
  $('#accept-request')?.addEventListener('click',()=>{state.accepted=true;persist();$('#received-status').textContent='Demande exemple acceptée. Un seul espace est disponible dans cette démonstration.';location.href='accompagnement.html';});
  $('#decline-request')?.addEventListener('click',()=>{$('#received-status').textContent='Demande exemple refusée dans cette démonstration.';$('#accept-request').disabled=true;});
  if($('#accompaniment-list'))$('#accompaniment-list').innerHTML=`<article class="mj-panel"><h2>Mathématiques avec Salma</h2><p>Lycée · Rabat, Agdal · espace exemple ${state.archived?'archivé':'actif'}</p><p>${state.sessions.filter(s=>s.status!=='cancelled').length} séance(s) dans le planning de démonstration</p><a class="mj-button" href="accompagnement.html">Ouvrir l’espace →</a></article>`;
  const dateLabel=value=>new Intl.DateTimeFormat('fr-FR',{dateStyle:'long',timeStyle:'short',timeZone:'Africa/Casablanca'}).format(new Date(value));
  const sessionStatus=s=>s.status==='cancelled'?'Annulée':s.status==='completed'?'Effectuée · déclarée dans la démonstration':new Date(s.date)<new Date()?'Date passée':'Prévue';
  function renderSessions(){if($('#sessions-list'))$('#sessions-list').innerHTML=state.sessions.map(s=>`<article class="mj-panel"><div class="mj-row"><div><h3>${esc(dateLabel(s.date))}</h3><p>${esc(s.duration)} min · ${esc(s.price)} MAD/h · ${esc(s.format==='presentiel'?'Présentiel':'En ligne')}</p><span class="mj-badge">${sessionStatus(s)}</span></div><a class="mj-secondary" href="seance.html?id=${encodeURIComponent(s.id)}">Préparer la séance →</a></div></article>`).join('');}
  renderSessions();
  $('#session-form')?.addEventListener('submit',e=>{e.preventDefault();const f=e.currentTarget;if(!f.reportValidity())return;if(state.archived){message(f,'Rouvrez cet espace avant d’ajouter une séance.');return;}
    const v=Object.fromEntries(new FormData(f)),date=new Date(v.date);if(!Number.isFinite(+date)||Number(v.duration)<15||Number(v.price)<=0){message(f,'Vérifiez la date, la durée (au moins 15 minutes) et le tarif.');return;}
    // Prototype: browser-local input; production must resolve Africa/Casablanca on the backend.
    const candidates=Array.from({length:Number(v.repeat)},(_,i)=>{const d=new Date(date);d.setDate(d.getDate()+7*i);return d.toISOString();});
    if(candidates.some(d=>state.sessions.some(s=>s.date===d&&s.status!=='cancelled'))){message(f,'Ce créneau existe déjà. Choisissez une autre date.');return;}
    candidates.forEach(d=>state.sessions.push({id:id(),date:d,duration:Number(v.duration),price:Number(v.price),format:v.format,location:v.location,status:'planned'}));saveMessage(f,'Séance(s) ajoutée(s) à la démonstration. La saisie utilise le fuseau de votre navigateur ; production prévue en Africa/Casablanca.');renderSessions();});
  const currentSession=state.sessions.find(s=>s.id===params.get('id'))||state.sessions[0];
  function renderSession(){if($('#session-detail'))$('#session-detail').innerHTML=currentSession?`<h2>Mathématiques avec Salma</h2><p>${esc(dateLabel(currentSession.date))} · Africa/Casablanca</p><p>${currentSession.duration} minutes · ${currentSession.price} MAD/h</p><p>${esc(currentSession.location||'Lieu / lien à convenir')}</p><span class="mj-badge">${sessionStatus(currentSession)}</span>`:'<p>Séance introuvable.</p>';}
  renderSession();
  $('#complete-session')?.addEventListener('click',()=>{if(!currentSession||state.archived)return;currentSession.status='completed';persist();renderSession();$('#session-feedback').textContent='Réalisation déclarée dans cette démonstration ; aucune double confirmation.';});
  $('#cancel-session')?.addEventListener('click',()=>{if(!currentSession||state.archived)return;currentSession.status='cancelled';persist();renderSession();$('#session-feedback').textContent='Séance annulée. Notes et noms des documents conservés.';});
  const scope=$('[data-page]')?.dataset.page==='seance'?currentSession?.id:null;
  const inScope=v=>!scope||v.session===scope;
  function renderNotes(){if($('#notes-list'))$('#notes-list').innerHTML=state.notes.filter(inScope).map(n=>`<article class="mj-panel"><p>${esc(n.text)}</p><p class="mj-small">Vous · ${esc(new Date(n.created).toLocaleDateString('fr-FR'))}${n.session?' · lié à une séance':''}</p><button type="button" class="mj-secondary" data-remove-note="${esc(n.id)}">Supprimer ma note</button></article>`).join('')||'<p>Aucune note pour le moment.</p>';}
  function renderDocuments(){if($('#documents-list'))$('#documents-list').innerHTML=state.documents.filter(inScope).map(d=>`<article class="mj-panel"><h3>${esc(d.name)}</h3><p class="mj-small">Vous · ${Math.ceil(d.size/1024)} Ko · nom uniquement${d.session?' · lié à une séance':''}</p><button type="button" class="mj-secondary" data-remove-document="${esc(d.id)}">Retirer</button></article>`).join('')||'<p>Aucun document pour le moment.</p>';}
  renderNotes();renderDocuments();
  $('#note-form')?.addEventListener('submit',e=>{e.preventDefault();const f=e.currentTarget;if(!f.reportValidity())return;if(state.archived){message(f,'Rouvrez cet espace avant d’ajouter une note.');return;}state.notes.push({id:id(),text:f.elements.text.value,session:scope,created:new Date().toISOString()});saveMessage(f,'Note enregistrée localement dans la démonstration.');f.elements.text.value='';renderNotes();});
  $('#document-form')?.addEventListener('submit',e=>{e.preventDefault();const f=e.currentTarget,file=f.elements.document.files[0];if(!file)return;if(state.archived){message(f,'Rouvrez cet espace avant d’ajouter un document.');return;}if(file.size>10*1024*1024||!(/\.(pdf|jpe?g|png|docx)$/i.test(file.name))){message(f,'Format autorisé : PDF, JPEG, PNG, DOCX ; maximum 10 Mo.');return;}state.documents.push({id:id(),name:file.name,size:file.size,session:scope});saveMessage(f,'Nom ajouté. Le fichier n’a pas été transféré ni partagé.');f.reset();renderDocuments();});
  root.addEventListener('click',e=>{const note=e.target.closest('[data-remove-note]'),doc=e.target.closest('[data-remove-document]');if(state.archived)return;if(note){state.notes=state.notes.filter(n=>n.id!==note.dataset.removeNote);persist();renderNotes();}if(doc){state.documents=state.documents.filter(d=>d.id!==doc.dataset.removeDocument);persist();renderDocuments();}});
  function archiveLabel(){const b=$('#archive-space');if(b)b.textContent=state.archived?'Rouvrir l’espace de démonstration':'Archiver l’espace de démonstration';}
  archiveLabel();$('#archive-space')?.addEventListener('click',()=>{state.archived=!state.archived;persist();archiveLabel();});
  $$('[data-admin]').forEach(b=>b.addEventListener('click',()=>{const panel=b.closest('.mj-panel');panel.querySelector('.mj-status').textContent=b.dataset.admin;}));
})();

