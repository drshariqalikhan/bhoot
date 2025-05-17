if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js')
    .then(function(reg) {
      console.log('Service Worker registered scope: ', reg.scope);
    }).catch(function(error) {
      console.log('Service Worker registration failed: ', error);
    });
}

// --- Device Orientation Sensor Code (with iOS permission handling) ---
const requestPermissionButton = document.getElementById('request-sensor-permission');
const orientationAlpha = document.getElementById('orientation-alpha');
const orientationBeta = document.getElementById('orientation-beta');
const orientationGamma = document.getElementById('orientation-gamma');
const orientationError = document.getElementById('orientation-error');

if ('DeviceOrientationEvent' in window) {
    requestPermissionButton.style.display = 'block'; // Show the button

    requestPermissionButton.addEventListener('click', () => {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            // iOS 13+ device orientation permission
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        window.addEventListener('deviceorientation', handleOrientation);
                        orientationError.textContent = ''; // Clear errors
                        requestPermissionButton.style.display = 'none'; // Hide button after granted
                        console.log('Device Orientation permission granted.');
                    } else {
                        orientationError.textContent = 'Permission to access device orientation was denied.';
                        console.error('Device Orientation permission denied.');
                         requestPermissionButton.style.display = 'block'; // Keep button visible
                    }
                })
                .catch(error => {
                    orientationError.textContent = 'Error requesting device orientation permission: ' + error;
                    console.error('Error requesting device orientation permission:', error);
                     requestPermissionButton.style.display = 'block'; // Keep button visible
                });
        } else {
            // Non-iOS 13+ browsers or older iOS
            window.addEventListener('deviceorientation', handleOrientation);
            orientationError.textContent = 'Device Orientation API available (no explicit permission needed).';
            requestPermissionButton.style.display = 'none'; // Hide button
             console.log('Device Orientation API available (no explicit permission needed).');
        }
    });

    function handleOrientation(event) {
        // alpha: compass direction in degrees (0-360, 0 is North)
        // beta: front to back tilt in degrees (-180 to 180)
        // gamma: left to right tilt in degrees (-90 to 90)
        orientationAlpha.textContent = event.alpha ? event.alpha.toFixed(2) : 'N/A';
        orientationBeta.textContent = event.beta ? event.beta.toFixed(2) : 'N/A';
        orientationGamma.textContent = event.gamma ? event.gamma.toFixed(2) : 'N/A';
    }

} else {
    orientationError.textContent = 'Device Orientation API not supported in this browser.';
    requestPermissionButton.style.display = 'none'; // Hide button if API not supported
    console.warn('Device Orientation API not supported.');
}