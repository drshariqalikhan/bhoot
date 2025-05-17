if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(function(reg) {
      console.log('Service Worker registered scope: ', reg.scope);
    }).catch(function(error) {
      console.log('Service Worker registration failed: ', error);
    });
}