(() => {
  'use strict';
  const form=document.getElementById('login-form');
  if(!form)return;
  const email=document.getElementById('login-email');
  const password=document.getElementById('login-password');
  const toggle=document.getElementById('login-password-toggle');
  const submit=document.getElementById('login-submit');
  const error=document.getElementById('login-error');
  const status=document.getElementById('login-status');
  const availability=document.getElementById('login-availability');
  const states={
    unavailable:{notice:'La connexion sera bientôt disponible.'},
    ready:{notice:'La connexion sera bientôt disponible.'},
    loading:{status:'Connexion en cours…',label:'Connexion en cours…',busy:true},
    invalid:{error:'Email ou mot de passe incorrect.',invalid:true},
    service_error:{error:'Service momentanément indisponible. Veuillez réessayer plus tard.'}
  };
  function setState(name){
    if(!Object.prototype.hasOwnProperty.call(states,name))throw new Error('État de connexion inconnu.');
    const state=states[name];
    form.dataset.state=name;
    form.setAttribute('aria-busy',String(Boolean(state.busy)));
    error.textContent=state.error||'';error.hidden=!state.error;
    status.textContent=state.status||'';
    availability.textContent=state.notice||'';availability.hidden=!state.notice;
    submit.textContent=state.label||'Se connecter';
    // Interface seulement : aucune transition ne peut activer une fausse connexion.
    submit.disabled=true;
    email.disabled=Boolean(state.busy);password.disabled=Boolean(state.busy);
    toggle.disabled=Boolean(state.busy);
    for(const input of [email,password]){
      if(state.invalid){input.setAttribute('aria-invalid','true');input.setAttribute('aria-describedby','login-error');}
      else{input.removeAttribute('aria-invalid');input.removeAttribute('aria-describedby');}
    }
  }
  toggle.addEventListener('click',()=>{
    const visible=password.type==='password';
    password.type=visible?'text':'password';
    toggle.textContent=visible?'Masquer':'Afficher';
    toggle.setAttribute('aria-pressed',String(visible));
  });
  form.addEventListener('submit',event=>{event.preventDefault();setState('unavailable');});
  form.addEventListener('input',()=>{if(form.dataset.state==='invalid')setState('ready');});
  // Point d’intégration pour les futurs retours API et les vérifications visuelles.
  // Ne lit, ne conserve et ne transmet aucun identifiant.
  window.MorajaaLoginUI=Object.freeze({setState});
  setState('unavailable');
})();
