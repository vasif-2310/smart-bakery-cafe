const { spawn } = require('child_process');
const net = require('net');
const path = require('path');
const fs = require('fs');

const rootDir = path.resolve(__dirname, '..');
const serverDir = path.join(rootDir, 'server');
const clientDir = path.join(rootDir, 'client');
const dbPath = 'D:\\mongodb-data';
const mongodPath = 'C:\\Program Files\\MongoDB\\Server\\9.0\\bin\\mongod.exe';

function checkMongoPort() {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      resolve(false);
    });
    socket.connect(27017, '127.0.0.1');
  });
}

async function main() {
  console.log('=======================================================');
  console.log('   Smart Bakery & Café - Unified System Launcher      ');
  console.log('=======================================================');

  // 1. Ensure D:\mongodb-data directory exists
  if (!fs.existsSync(dbPath)) {
    console.log(`[Init] Creating database directory at ${dbPath}...`);
    try {
      fs.mkdirSync(dbPath, { recursive: true });
    } catch (e) {
      console.warn(`[Init] Notice: ${e.message}`);
    }
  }

  // 2. Ensure MongoDB is running
  const isRunning = await checkMongoPort();
  if (isRunning) {
    console.log('[Database] MongoDB is already active and listening on port 27017.');
  } else {
    console.log(`[Database] Starting MongoDB on port 27017 (data path: ${dbPath})...`);
    if (fs.existsSync(mongodPath)) {
      const mongod = spawn(mongodPath, ['--dbpath', dbPath, '--port', '27017'], {
        detached: true,
        stdio: 'ignore',
      });
      mongod.unref();
      console.log('[Database] MongoDB process launched.');
      // Wait for port to become active
      let ready = false;
      for (let i = 0; i < 15; i++) {
        await new Promise((r) => setTimeout(r, 1000));
        if (await checkMongoPort()) {
          ready = true;
          break;
        }
      }
      if (ready) {
        console.log('[Database] MongoDB connected and ready!');
      } else {
        console.warn('[Database] MongoDB started, continuing with server launch...');
      }
    } else {
      console.warn(`[Database Warning] mongod not found at ${mongodPath}. Please ensure MongoDB service is started.`);
    }
  }

  // 3. Start Backend Server
  console.log('[Backend] Starting Node.js / Express server on port 5000...');
  const isWin = process.platform === 'win32';
  const npmCmd = isWin ? 'npm.cmd' : 'npm';

  const serverProc = spawn(npmCmd, ['run', 'dev'], {
    cwd: serverDir,
    stdio: 'inherit',
    shell: true,
  });

  // 4. Start Frontend Client
  console.log('[Frontend] Starting Vite / React client on port 5173...');
  const clientProc = spawn(npmCmd, ['run', 'dev'], {
    cwd: clientDir,
    stdio: 'inherit',
    shell: true,
  });

  const cleanup = () => {
    console.log('\nShutting down all processes...');
    try { serverProc.kill(); } catch (e) {}
    try { clientProc.kill(); } catch (e) {}
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

main().catch(console.error);

