(() => {
  'use strict';
  const root=document.getElementById('morajaa-home');if(!root)return;
  const $=s=>root.querySelector(s), $$=s=>Array.from(root.querySelectorAll(s));
  const config=window.MorajaaConfig||{}, params=new URLSearchParams(location.search);
  const subjects={mathematiques:'Mathématiques','physique-chimie':'Physique-chimie',anglais:'Anglais',francais:'Français',arabe:'Arabe',informatique:'Informatique'};
  const cities={rabat:'Rabat',casablanca:'Casablanca',sale:'Salé',tanger:'Tanger',marrakech:'Marrakech'};
  const districts={rabat:{agdal:'Agdal',hassan:'Hassan','hay-riad':'Hay Riad'},casablanca:{maarif:'Maârif',bourgogne:'Bourgogne'},sale:{tabriquet:'Tabriquet'},tanger:{iberia:'Iberia'},marrakech:{gueliz:'Guéliz'}};
  const levels={college:'Collège',lycee:'Lycée',superieur:'Supérieur'};
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const text=v=>typeof v==='string'||typeof v==='number'?String(v):'';
  const message=(f,t)=>{const el=f.querySelector('.mj-status');if(el)el.textContent=t;};
  function apiURL(path){
    if(!config.apiBaseUrl)throw Error('unavailable');
    const base=new URL(config.apiBaseUrl),local=['localhost','127.0.0.1','[::1]'];
    if(base.username||base.password||!['http:','https:'].includes(base.protocol)||(base.protocol!=='https:'&&!local.includes(base.hostname))||(local.includes(base.hostname)&&!local.includes(location.hostname)))throw Error('unavailable');
    return new URL(base.href.replace(/\/$/,'')+path);
  }
  function normalise(raw){
    if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('invalid');
    const value=raw.price??raw.tarif??raw.prix??raw.tarif_horaire,price=value==null||value===''?null:Number(value);
    return {id:text(raw.id??raw.annonce_id),name:text(raw.name??raw.prenom??raw.firstName??raw.nom)||'Cours particulier',subject:text(raw.subject??raw.matiere),city:text(raw.city??raw.ville),district:text(raw.district??raw.quartier),level:text(raw.level??raw.niveau),background:text(raw.background??raw.parcours),approach:text(raw.approach??raw.description),format:text(raw.format),online:raw.online===true||raw.en_ligne===true||['both','en-ligne','en_ligne'].includes(raw.format),price:price!==null&&Number.isFinite(price)&&price>=0?price:null};
  }
  let searchController,searchVersion=0;
  // Recherche réelle : les filtres sont encodés, les erreurs HTTP sont vérifiées.
  async function lancerRecherche(matiere_choisie='',ville_choisie=''){
    const url=apiURL('/api/v1/annonces/recherche');
    if(matiere_choisie)url.searchParams.set('matiere',matiere_choisie);
    if(ville_choisie)url.searchParams.set('ville',ville_choisie);
    searchController?.abort();const controller=new AbortController();searchController=controller;
    const timeout=setTimeout(()=>controller.abort(),15000);
    try{
      const reponse=await fetch(url.href,{headers:{Accept:'application/json'},credentials:'omit',signal:controller.signal});
      if(!reponse.ok)throw Error('http');
      const data=await reponse.json(),annonces=Array.isArray(data)?data:(data?.annonces??data?.items);
      if(!Array.isArray(annonces))throw Error('invalid');return annonces.map(normalise);
    }finally{clearTimeout(timeout);}
  }
  window.lancerRecherche=lancerRecherche;
  function card(p){
    const place=[cities[p.city]||p.city,districts[p.city]?.[p.district]||p.district].filter(Boolean).join(' · ');
    return `<article class="mj-panel mj-profile-card"><span class="mj-avatar" aria-hidden="true">${esc(p.name.charAt(0))}</span><div><h2>${esc(p.name)}</h2>${p.background?`<p>${esc(p.background)}</p>`:''}<h3>${esc(subjects[p.subject]||p.subject||'Cours particulier')}${p.level?' · '+esc(levels[p.level]||p.level):''}</h3><p>${esc(place)}${p.online?' · En ligne possible':''}</p>${p.approach?`<p>${esc(p.approach)}</p>`:''}<p><strong>${p.price===null?'Tarif à convenir':esc(p.price)+' MAD/h'}</strong></p>${p.id?`<a class="mj-button" href="profil.html?id=${encodeURIComponent(p.id)}&matiere=${encodeURIComponent(p.subject)}&ville=${encodeURIComponent(p.city)}">Voir le profil →</a>`:''}</div></article>`;
  }
  $$('[data-tab]').forEach(b=>b.addEventListener('click',()=>{b.closest('[role="tablist"]').querySelectorAll('[data-tab]').forEach(tab=>{const active=tab===b;tab.setAttribute('aria-selected',String(active));const panel=$('#'+tab.dataset.tab);if(panel)panel.hidden=!active;});}));
  if($('#search-filters')){
    const f=$('#search-filters'),results=$('#search-results'),count=$('#result-count');
    function refresh(){const opts=districts[f.elements.ville.value]||{};f.elements.quartier.innerHTML='<option value="">Tous quartiers</option>'+Object.entries(opts).map(([v,t])=>`<option value="${esc(v)}">${esc(t)}</option>`).join('');f.elements.quartier.disabled=!Object.keys(opts).length;}
    for(const k of ['matiere','ville','niveau','format','budget'])if(params.has(k))f.elements[k].value=params.get(k);
    refresh();if(params.has('quartier'))f.elements.quartier.value=params.get('quartier');f.elements.ville.addEventListener('change',refresh);f.elements.budget.min=1;
    async function render(){
      const version=++searchVersion,filters=Object.fromEntries(new FormData(f));results.setAttribute('aria-busy','true');count.textContent='Recherche en cours…';results.innerHTML='';
      try{
        const annonces=await lancerRecherche(filters.matiere,filters.ville);if(version!==searchVersion)return;
        const list=annonces.filter(p=>(!filters.quartier||p.district===filters.quartier)&&(!filters.niveau||p.level===filters.niveau)&&(!filters.format||(filters.format==='en-ligne'?p.online:(p.format==='presentiel'||p.format==='both'||(!p.format&&!p.online))))&&(!filters.budget||(p.price!==null&&p.price<=Number(filters.budget))));
        count.textContent=`${list.length} cours trouvé${list.length>1?'s':''}`;
        results.innerHTML=list.length?list.map(card).join(''):'<section class="mj-panel"><h2>Aucun cours trouvé</h2><p>Essayez une autre ville ou élargissez vos critères.</p></section>';
      }catch{if(version!==searchVersion)return;count.textContent='';results.innerHTML='<section class="mj-panel"><h2>La recherche est momentanément indisponible</h2><p>Veuillez réessayer dans quelques instants.</p><button type="button" class="mj-secondary" id="retry-search">Réessayer</button></section>';$('#retry-search')?.addEventListener('click',render);}
      finally{if(version===searchVersion)results.removeAttribute('aria-busy');}
    }
    f.addEventListener('submit',e=>{e.preventDefault();if(!f.reportValidity())return;const query=new URLSearchParams();new FormData(f).forEach((v,k)=>{if(v)query.set(k,v);});try{history.replaceState(null,'',query.size?'?'+query:'recherche.html');}catch{}render();});
    f.addEventListener('reset',()=>setTimeout(()=>{refresh();try{history.replaceState(null,'','recherche.html');}catch{}render();},0));render();
  }
  if($('#profile-content')){
    const panel=$('#profile-content');panel.textContent='Chargement du profil…';
    (async()=>{try{const list=await lancerRecherche(params.get('matiere')||'',params.get('ville')||''),p=list.find(p=>p.id===params.get('id'));
      if(!p){panel.innerHTML='<section class="mj-panel"><h2>Ce profil n’est plus disponible</h2><a href="recherche.html">Revenir à la recherche</a></section>';return;}
      panel.innerHTML=card(p)+'<section class="mj-panel"><h2>Organiser un cours</h2><p>La prise de contact sera bientôt disponible.</p><button class="mj-button" disabled>Bientôt disponible</button></section>';panel.querySelector('a.mj-button')?.remove();
    }catch{panel.innerHTML='<section class="mj-panel"><h2>Le profil est momentanément indisponible</h2><a href="recherche.html">Revenir à la recherche</a></section>';}})();
  }
  const register=$('[data-account-form="register"]');
  if(register){
    const button=register.querySelector('button');
    if(!config.registrationEnabled||!config.apiBaseUrl){button.disabled=true;button.textContent='Bientôt disponible';register.querySelectorAll('input').forEach(input=>input.disabled=true);message(register,'La création de comptes sera bientôt disponible.');}
    register.addEventListener('submit',async e=>{
      e.preventDefault();if(!config.registrationEnabled||register.dataset.submitting==='true'||register.dataset.registered==='true'||!register.reportValidity())return;
      const firstName=register.elements.firstName.value.trim(),email=register.elements.email.value.trim();if(!firstName||!email){message(register,'Renseignez votre prénom et votre adresse email.');return;}
      let url;try{url=apiURL('/api/v1/auth/register');}catch{message(register,'L’inscription est momentanément indisponible.');return;}
      const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);register.dataset.submitting='true';register.setAttribute('aria-busy','true');button.disabled=true;button.textContent='Création en cours…';message(register,'Création de votre compte en cours…');
      try{
        const response=await fetch(url.href,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},credentials:'omit',signal:controller.signal,body:JSON.stringify({firstName,email,password:register.elements.password.value})});
        if(!response.ok){message(register,response.status===409?'Cette adresse email est déjà utilisée.':response.status===422?'Vérifiez les informations saisies et les exigences du mot de passe.':response.status===429?'Trop de tentatives. Réessayez dans quelques minutes.':'La création du compte a échoué. Réessayez plus tard.');return;}
        register.elements.password.value='';register.dataset.registered='true';button.textContent='Compte créé';message(register,'Votre compte a été créé. La connexion sera bientôt disponible.');
      }catch(error){message(register,error.name==='AbortError'?'Le service met trop de temps à répondre. Votre compte a peut-être été créé ; vérifiez avant de réessayer.':'Impossible de joindre le service. Réessayez dans quelques instants.');}
      finally{clearTimeout(timeout);delete register.dataset.submitting;register.removeAttribute('aria-busy');if(register.dataset.registered!=='true'){button.disabled=false;button.textContent='Créer mon compte';}}
    });
  }
  if($('#listing-form')){
    const f=$('#listing-form'),steps=$$('[data-step]');let step=0;f.elements.price.min='0.01';
    function refresh(){const opts=districts[f.elements.city.value]||{};f.elements.district.innerHTML=Object.entries(opts).map(([v,t])=>`<option value="${esc(v)}">${esc(t)}</option>`).join('');}f.elements.city.addEventListener('change',refresh);refresh();
    function show(){steps.forEach((el,i)=>el.hidden=i!==step);if(step===2){const v=Object.fromEntries(new FormData(f));$('#listing-preview').innerHTML=`<h3>${esc(v.name)} · ${esc(subjects[v.subject]||v.subject)}</h3><p>${esc(v.background)}</p><p>${esc(v.approach)}</p><p>${esc(cities[v.city]||v.city)} · ${esc(districts[v.city]?.[v.district]||v.district)} · ${esc(v.price)} MAD/h</p>`;}}
    $$('[data-next]').forEach(b=>b.addEventListener('click',()=>{const invalid=Array.from(steps[step].querySelectorAll('input,textarea,select')).find(el=>!el.checkValidity());if(invalid){invalid.reportValidity();return;}step=Math.min(2,step+1);show();}));
    $$('[data-prev]').forEach(b=>b.addEventListener('click',()=>{step=Math.max(0,step-1);show();}));f.addEventListener('submit',e=>{e.preventDefault();message(f,'La publication d’annonces sera bientôt disponible.');});
  }
  if($('#contact-link')&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.contactEmail||'')&&!/\.example$/i.test(config.contactEmail)){
    $('#contact-link').href='mailto:'+config.contactEmail;$('#contact-link').hidden=false;$('#contact-status').textContent='Une question ou un signalement ? Contactez-nous par email.';
  }
})();
