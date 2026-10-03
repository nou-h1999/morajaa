(() => {
  const root = document.getElementById('morajaa-home');
  if (!root) return;
  const form = root.querySelector('#mj-search');
  const subject = root.querySelector('#mj-subject');
  const city = root.querySelector('#mj-city');
  const feedback = root.querySelector('#mj-search-feedback');
  root.querySelectorAll('[data-subject]').forEach(button => {
    button.addEventListener('click', () => {
      subject.value = button.dataset.subject;
      subject.focus();
    });
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const params = new URLSearchParams({matiere: subject.value, ville: city.value});
    feedback.textContent = `Recherche sélectionnée : ${subject.selectedOptions[0].textContent} · ${city.selectedOptions[0].textContent}. La page de résultats sera ajoutée à la prochaine étape.`;
    feedback.hidden = false;
    // Intégration suivante : navigation vers recherche.html? + params.toString().
    form.dataset.search = params.toString();
  });
  root.querySelector('#mj-offer-button').addEventListener('click', () => {
    const message = root.querySelector('#mj-offer-feedback');
    message.textContent = 'Le formulaire « Proposer mes cours » sera ajouté lors de la construction de cette page.';
    message.hidden = false;
  });
})();
