const logArea = document.getElementById('logArea');
const permissionSection = document.getElementById('permissionSection');
const sensorDataSection = document.getElementById('sensorDataSection');

const orientationAlpha = document.getElementById('orientation-alpha');
const orientationBeta = document.getElementById('orientation-beta');
const orientationGamma = document.getElementById('orientation-gamma');

const sensorErrorDisplay = document.getElementById('sensor-error');

function logMessage(message, type = 'info') {
    const entry = document.createElement('div');
    entry.classList.add('log-entry');
    if (type === 'error') {
        entry.classList.add('error');
        console.error(message);
    } else if (type === 'warn') {
        entry.classList.add('warn');
        console.warn(message);
    } else {
        console.log(message);
    }
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${type.toUpperCase()}: ${message}`;
    logArea.appendChild(entry);
    logArea.scrollTop = logArea.scrollHeight; // Auto-scroll to the bottom
}

logMessage('Script loaded.');

// Service Worker registration remains the same
if ('serviceWorker' in navigator) {
  logMessage('Service Worker supported. Registering...');
  navigator.serviceWorker.register('./service-worker.js')
    .then(function(reg) {
      logMessage('Service Worker registered scope: ' + reg.scope);
    }).catch(function(error) {
      logMessage('Service Worker registration failed: ' + error, 'error');
    });
} else {
    logMessage('Service Worker not supported in this browser.', 'warn');
}

// --- Device Orientation Sensor Code (with iOS permission handling) ---

function handleDeviceOrientation(event) {
    // Alpha: compass direction (0-360, 0 is North)
    // Beta: front to back tilt (-180 to 180)
    // Gamma: left to right tilt (-90 to 90)

    orientationAlpha.textContent = event.alpha ? event.alpha.toFixed(2) : 'N/A';
    orientationBeta.textContent = event.beta ? event.beta.toFixed(2) : 'N/A';
    orientationGamma.textContent = event.gamma ? event.gamma.toFixed(2) : 'N/A';

    // The `event.webkitCompassHeading` property is deprecated and non-standard,
    // but might provide a true north reading if available and needed specifically.
    // However, relying on the standard `alpha` which is usually magnetic north 
    // and is the basis for the API is generally better practice.
    // if (event.webkitCompassHeading !== undefined) {
    //    // You could display this if needed, but alpha is standard.
    // }

     // No need to log every orientation event to the UI log
    if (event.alpha === null || event.beta === null || event.gamma === null) {
         // This might happen if sensors are temporarily unavailable
         // logMessage('Orientation data is null. Device might not support it or is in a state where data is unavailable.', 'warn');
    }
}

function requestOrientationPermission() {
    logMessage('Attempting to request orientation sensor permission...');
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        // iOS 13+ device orientation permission
        DeviceOrientationEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    logMessage('Device Orientation permission granted.');
                    permissionSection.classList.add('hidden');
                    sensorDataSection.classList.remove('hidden');
                    window.addEventListener('deviceorientation', handleDeviceOrientation);
                    sensorErrorDisplay.textContent = ''; // Clear any previous errors
                } else {
                    const errorMessage = 'Device Orientation permission denied by user.';
                    logMessage(errorMessage, 'error');
                    sensorErrorDisplay.textContent = errorMessage + ' Please grant permission in browser settings.';
                    permissionSection.classList.remove('hidden'); // Keep button visible
                    sensorDataSection.classList.add('hidden');
                }
            })
            .catch(error => {
                const errorMessage = `Error requesting orientation permission: ${error.name} - ${error.message}`;
                logMessage(errorMessage, 'error');
                sensorErrorDisplay.textContent = 'Error requesting permission: ' + error.message;
                 permissionSection.classList.remove('hidden'); // Keep button visible
                 sensorDataSection.classList.add('hidden');
            });
    } else if (typeof DeviceOrientationEvent !== 'undefined') {
        // Non-iOS 13+ browsers or older iOS (permission not required or handled differently)
        logMessage('DeviceOrientationEvent available (no specific permission needed or already granted).');
        permissionSection.classList.add('hidden');
        sensorDataSection.classList.remove('hidden');
        window.addEventListener('deviceorientation', handleDeviceOrientation);
         sensorErrorDisplay.textContent = ''; // Clear any previous errors
    } else {
        const errorMessage = 'DeviceOrientationEvent API not supported on this browser.';
        logMessage(errorMessage, 'error');
        sensorErrorDisplay.textContent = errorMessage + ' Cannot access orientation data.';
         permissionSection.classList.add('hidden'); // Hide button if API not supported
         sensorDataSection.classList.add('hidden');
    }
}

const requestPermissionButton = document.getElementById('requestPermissionButton');
requestPermissionButton.addEventListener('click', requestOrientationPermission);

window.addEventListener('load', () => {
    logMessage('App loaded. Grant permission to start.');
    // Check if already in standalone mode (PWA)
    if (window.navigator.standalone === true) {
        logMessage('Running in PWA mode (iOS).');
    }
});
