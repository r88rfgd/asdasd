// Log function to show status messages
function log(message) {
    const logContainer = document.getElementById('log');
    const logEntry = document.createElement('div');
    logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logContainer.appendChild(logEntry);
    logContainer.scrollTop = logContainer.scrollHeight;
}

// Check connection status
function updateConnectionStatus() {
    const statusElement = document.getElementById('connection-status');
    
    if (navigator.onLine) {
        statusElement.textContent = 'online';
        statusElement.className = 'status online';
        log('Internet connection detected');
    } else {
        statusElement.textContent = 'offline';
        statusElement.className = 'status offline';
        log('No internet connection detected');
    }
}

// Initial connection check
updateConnectionStatus();

// Listen for online/offline events
window.addEventListener('online', () => {
    updateConnectionStatus();
});

window.addEventListener('offline', () => {
    updateConnectionStatus();
});

// Track JS loading
document.addEventListener('DOMContentLoaded', () => {
    log('JavaScript file loaded successfully');
});

// WASM loading and execution
const wasmStatusElement = document.getElementById('wasm-status');
const wasmResultElement = document.getElementById('wasm-result');

// WebAssembly instantiation function
async function loadAndRunWasm() {
    try {
        log('Starting WebAssembly module loading...');
        wasmStatusElement.textContent = 'Loading...';
        wasmStatusElement.className = 'status loading';
        
        // Fetch the WASM file
        const response = await fetch('module.wasm');
        if (!response.ok) {
            throw new Error(`Failed to load WASM file: ${response.status} ${response.statusText}`);
        }
        
        log('WASM file fetched, instantiating...');
        const bytes = await response.arrayBuffer();
        
        // Instantiate the WASM module
        const result = await WebAssembly.instantiate(bytes, {
            env: {
                // Provide any required imports here
                log: (value) => { console.log(`WASM log: ${value}`); }
            }
        });
        
        log('WASM module instantiated successfully');
        wasmStatusElement.textContent = 'Loaded';
        wasmStatusElement.className = 'status online';
        
        // Get the exports from the WASM module
        const wasmModule = result.instance;
        
        // Call the exported add function
        const addResult = wasmModule.exports.add(40, 2);
        wasmResultElement.textContent = `WASM add function result: ${addResult}`;
        log(`Called WASM add function with 40 and 2, result: ${addResult}`);
        
        return wasmModule;
    } catch (error) {
        log(`Error loading WASM: ${error.message}`);
        wasmStatusElement.textContent = 'Failed to load';
        wasmStatusElement.className = 'status offline';
        wasmResultElement.textContent = `Error: ${error.message}`;
        console.error('Error loading WASM:', error);
        return null;
    }
}

// Start loading WASM when page loads
window.onload = () => {
    log('Page fully loaded, starting WebAssembly loading...');
    loadAndRunWasm();
};
