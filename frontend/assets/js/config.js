(() => {
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  window.MorajaaConfig = {
    // Remplacer par l’URL HTTPS du backend pour la mise en ligne.
    apiBaseUrl: local ? 'http://127.0.0.1:8000' : '',
    registrationEnabled: local,
    contactEmail: ''
  };
})();
