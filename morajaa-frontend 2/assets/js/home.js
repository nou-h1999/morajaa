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
    location.href = 'recherche.html?' + params.toString();
    feedback.hidden = false;
    // Intégration suivante : navigation vers recherche.html? + params.toString().
    form.dataset.search = params.toString();
  });
  root.querySelector('#mj-offer-button').addEventListener('click', () => {
    location.href = 'proposer.html';
  });
})();
