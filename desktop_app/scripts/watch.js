const { spawn } = require('child_process');
const chokidar = require('chokidar');
const path = require('path');

const backendPath = path.join(__dirname, '..', 'src', 'backend');
let electronProcess = null;

function startElectron() {
  if (electronProcess) {
    console.log('Stopping Electron process...');
    electronProcess.kill();
    electronProcess = null;
  }

  console.log('Starting electron-forge...');
  electronProcess = spawn('pnpm', ['exec', 'electron-forge', 'start'], {
    shell: true,
    stdio: 'inherit', 
  });

  electronProcess.on('close', (code) => {
    if (code !== null && code !== 0) {
      console.error(`Electron process exited with code ${code}`);
    }
  });
}


startElectron();


const watcher = chokidar.watch(backendPath, {
  ignored: /(^|[\/\\])\../, 
  persistent: true,
});

console.log(`Watching for changes in ${backendPath}`);

watcher.on('change', (filePath) => {
  console.log(`\nFile changed: ${filePath}`);
  console.log('Restarting due to backend changes...');
  startElectron();
});
