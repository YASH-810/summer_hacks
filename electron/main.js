const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const { join } = require('path');
const { exec } = require('child_process');

let mainWindow;
let setupWindow;
let trackingInterval = null;
let killInterval = null;
let lockdownTimer = null;
let isViolationActive = false;
let isResuming = false;
let isLockdownActive = false;

// Current session config (persisted across resume cycles)
let currentConfig = null;
let currentPrimary = null;

const APP_MAP = {
  'vscode': { cmd: 'code', name: 'Visual Studio Code', process: 'code.exe' },
  'word': { cmd: 'start winword', name: 'Word', process: 'winword.exe' },
  'ppt': { cmd: 'start powerpnt', name: 'PowerPoint', process: 'powerpnt.exe' },
  'excel': { cmd: 'start excel', name: 'Excel', process: 'excel.exe' },
  'notepad': { cmd: 'notepad', name: 'Notepad', process: 'notepad.exe' },
  'calculator': { cmd: 'calc', name: 'Calculator', process: 'calculatorapp.exe' },
  'git': { cmd: 'start "" "C:\\Program Files\\Git\\git-bash.exe"', name: 'Git Bash', process: 'mintty.exe' },
  'snippingtool': { cmd: 'snippingtool', name: 'Snipping Tool', process: 'snippingtool.exe' }
};

// ═══════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════

/** Get list of all running process names */
function getRunningProcesses() {
  return new Promise((resolve) => {
    exec('tasklist /FO CSV /NH', (err, stdout) => {
      if (err || !stdout) return resolve([]);
      const names = stdout.toLowerCase().split('\n')
        .map(line => {
          const match = line.match(/^"([^"]+)"/);
          return match ? match[1] : null;
        })
        .filter(Boolean);
      resolve([...new Set(names)]);
    });
  });
}

/** Check if a specific process is running */
function isProcessRunning(processName) {
  return new Promise((resolve) => {
    exec(`tasklist /FI "IMAGENAME eq ${processName}" /FO CSV /NH`, (err, stdout) => {
      if (err || !stdout) return resolve(false);
      resolve(stdout.toLowerCase().includes(processName.toLowerCase()));
    });
  });
}

/** Launch an application */
function launchApp(appKey) {
  const target = APP_MAP[appKey];
  if (!target) return;
  exec(target.cmd, (err) => {
    if (err) exec(`start ${target.cmd}`, () => { });
  });
}

/** Focus the primary app window */
function focusPrimaryApp() {
  if (!currentPrimary) return;
  setTimeout(() => {
    const ps = `$wshell = New-Object -ComObject WScript.Shell; $wshell.AppActivate('${currentPrimary.name}')`;
    exec(`powershell -Command "${ps}"`, () => { });
  }, 1500);
}

/** Show violation overlay — FocusOS takes over the screen */
function showViolation(reason) {
  if (isViolationActive || isResuming) return;
  isViolationActive = true;
  console.log(`[WARDEN] VIOLATION: ${reason}`);

  mainWindow.setIgnoreMouseEvents(false);
  mainWindow.setOpacity(1.0);
  mainWindow.setKiosk(true);
  mainWindow.setAlwaysOnTop(true, 'screen-saver');
  mainWindow.show();
  mainWindow.restore();
  mainWindow.focus();
  mainWindow.webContents.send('violation', { app: reason });
}

/** Hide FocusOS and let user work in their primary app */
function hideToBackground() {
  mainWindow.setKiosk(false);
  mainWindow.setAlwaysOnTop(false);
  mainWindow.minimize();
}

// ═══════════════════════════════════════════════════════════════
//  WINDOW
// ═══════════════════════════════════════════════════════════════

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: '#000000',
    center: true,
    show: true,
    transparent: false,
    frame: false,
    alwaysOnTop: false,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadURL('http://localhost:3000');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ── Window Controls ──
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close();
});

// ── Setup Window ──
ipcMain.on('show-blocker-setup', () => {
  if (setupWindow) { setupWindow.focus(); return; }
  setupWindow = new BrowserWindow({
    width: 600, height: 800, frame: false, alwaysOnTop: true,
    backgroundColor: '#000000',
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false, contextIsolation: true
    }
  });
  setupWindow.loadURL('http://localhost:3000/session/setup');
  setupWindow.on('closed', () => { setupWindow = null; });
});

// ═══════════════════════════════════════════════════════════════
//  STRICT MODE LOCKDOWN
// ═══════════════════════════════════════════════════════════════

ipcMain.on('initiate-lockdown', (event, config) => {
  const { allowedApps, primaryApp, duration, strictMode } = config;
  currentConfig = config;

  if (setupWindow) setupWindow.close();

  // Resolve primary app
  currentPrimary = APP_MAP[primaryApp] || APP_MAP['vscode'];

  // Build list of allowed process names
  const allowedProcesses = allowedApps
    .map(key => APP_MAP[key]?.process)
    .filter(Boolean)
    .map(p => p.toLowerCase());

  // Always allow these system processes
  const systemProcesses = [
    'explorer.exe', 'svchost.exe', 'system', 'csrss.exe', 'wininit.exe',
    'services.exe', 'lsass.exe', 'smss.exe', 'dwm.exe', 'taskhostw.exe',
    'runtimebroker.exe', 'searchhost.exe', 'startmenuexperiencehost.exe',
    'textinputhost.exe', 'shellexperiencehost.exe', 'sihost.exe',
    'ctfmon.exe', 'conhost.exe', 'fontdrvhost.exe', 'dllhost.exe',
    'searchindexer.exe', 'securityhealthservice.exe', 'sgrmbroker.exe',
    'spoolsv.exe', 'audiodg.exe', 'applicationframehost.exe',
    'systemsettings.exe', 'searchapp.exe', 'widgetservice.exe',
    'msedgewebview2.exe', 'windowsterminal.exe', 'powershell.exe',
    'cmd.exe', 'wsl.exe', 'node.exe', 'tasklist.exe', 'taskkill.exe',
    'wudfhost.exe', 'wmiprvse.exe', 'mpcmdrun.exe', 'securityhealthsystray.exe',
    'electron.exe', 'focusos.exe', // self
  ];

  if (strictMode) {
    // Block keyboard shortcuts to prevent escape
    const keys = ['Alt+Tab', 'Alt+F4', 'CommandOrControl+Tab', 'CommandOrControl+Esc', 'F11', 'F12'];
    keys.forEach(k => { try { globalShortcut.register(k, () => { }); } catch (e) { } });
    try { globalShortcut.register('Super', () => { }); } catch (e) { }
  }

  // Emergency exit always available
  globalShortcut.register('CommandOrControl+Shift+X', () => {
    cleanupLockdown();
    app.quit();
  });

  // Launch all allowed apps
  allowedApps.forEach(appKey => launchApp(appKey));

  // Wait for apps to start, then hide FocusOS and focus primary
  setTimeout(() => {
    hideToBackground();
    focusPrimaryApp();
  }, 3000);

  isLockdownActive = true;

  // ── TRACKING: Check every 1.5 seconds ──
  if (trackingInterval) clearInterval(trackingInterval);

  trackingInterval = setInterval(async () => {
    if (!isLockdownActive || isResuming) return;

    // 1. Check if primary app is still running
    const primaryRunning = await isProcessRunning(currentPrimary.process);

    if (!primaryRunning) {
      showViolation('PRIMARY APP CLOSED');
      return;
    }

    // 2. If violation is not active, check foreground window
    if (!isViolationActive) {
      const processes = await getRunningProcesses();

      // Kill any process that is NOT allowed and NOT a system process
      processes.forEach(proc => {
        const isAllowed = allowedProcesses.includes(proc);
        const isSystem = systemProcesses.includes(proc);
        const isSelf = proc.includes('electron') || proc.includes('focusos');

        if (!isAllowed && !isSystem && !isSelf && strictMode) {
          // Kill unauthorized app silently
          exec(`taskkill /F /IM "${proc}"`, () => { });
        }
      });
    }
  }, 1500);

  // ── SESSION TIMER ──
  const sessionMs = (duration || 30) * 60 * 1000;
  if (lockdownTimer) clearTimeout(lockdownTimer);
  lockdownTimer = setTimeout(() => {
    // Session time is up — show break trigger
    isViolationActive = true;
    mainWindow.setOpacity(1.0);
    mainWindow.setIgnoreMouseEvents(false);
    mainWindow.setKiosk(true);
    mainWindow.restore();
    mainWindow.focus();
    mainWindow.webContents.send('trigger-break');
  }, sessionMs);
});

// ═══════════════════════════════════════════════════════════════
//  RESUME LOCKDOWN (User clicks "RETURN TO TARGET")
// ═══════════════════════════════════════════════════════════════

ipcMain.on('resume-lockdown', async () => {
  console.log('[WARDEN] Resuming — cooldown started');

  // 1. Immediately clear violation state
  isViolationActive = false;
  isResuming = true; // Pause tracking

  // 2. Release kiosk overlay
  mainWindow.setKiosk(false);
  mainWindow.setAlwaysOnTop(false);

  // 3. Check if primary app is still running
  if (currentPrimary) {
    const alreadyRunning = await isProcessRunning(currentPrimary.process);

    if (alreadyRunning) {
      // App is open — just focus it, don't spawn a new instance
      console.log('[WARDEN] Primary app already running, focusing it');
      focusPrimaryApp();
      hideToBackground();
    } else {
      // App was closed — relaunch it
      console.log('[WARDEN] Primary app closed, relaunching');
      exec(currentPrimary.cmd, (err) => {
        if (err) exec(`start ${currentPrimary.cmd}`, () => { });
      });

      // Wait for it to launch, then focus and hide
      setTimeout(() => {
        focusPrimaryApp();
        hideToBackground();
      }, 3000);
    }
  }

  // 4. Lift cooldown guard after 8 seconds (app fully launched)
  setTimeout(() => {
    isResuming = false;
    console.log('[WARDEN] Cooldown ended, tracking resumed');
  }, 8000);
});

// ═══════════════════════════════════════════════════════════════
//  CLEANUP
// ═══════════════════════════════════════════════════════════════

function cleanupLockdown() {
  isLockdownActive = false;
  isViolationActive = false;
  isResuming = false;
  if (trackingInterval) { clearInterval(trackingInterval); trackingInterval = null; }
  if (lockdownTimer) { clearTimeout(lockdownTimer); lockdownTimer = null; }
  globalShortcut.unregisterAll();
}

ipcMain.on('end-break', () => {
  cleanupLockdown();
  app.quit();
});
