const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const { join } = require('path');
const { exec } = require('child_process');

let mainWindow;
let setupWindow;
let trackingInterval = null;
let lockdownTimer = null;
let isViolationActive = false;
let currentPrimaryCmd = null;
let currentPrimaryName = null;

function killDistractions(allowedApps = []) {
  const blocked = [
    'chrome.exe',
    'msedge.exe',
    'firefox.exe',
    'notepad.exe'
  ];

  blocked.forEach(app => {
    const appName = app.replace('.exe', '');
    if (allowedApps.includes(appName)) return;
    exec(`taskkill /F /IM ${app}`, () => {});
  });
}

function triggerDistraction(activeApp = 'PRIMARY APP CLOSED OR UNAUTHORIZED APP') {
  if (isViolationActive) return;
  isViolationActive = true;
  mainWindow.setIgnoreMouseEvents(false);
  mainWindow.setOpacity(1.0);
  mainWindow.setKiosk(true);
  mainWindow.setAlwaysOnTop(true, 'screen-saver');
  mainWindow.show();
  mainWindow.restore();
  mainWindow.focus();
  mainWindow.webContents.send('violation', {
    app: activeApp
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: '#000000',
    center: true,
    show: true,
    transparent: false,
    frame: false,
    alwaysOnTop: false, // Don't force on top until lockdown violation
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

ipcMain.on('show-blocker-setup', () => {
  if (setupWindow) {
    setupWindow.focus();
    return;
  }

  setupWindow = new BrowserWindow({
    width: 600,
    height: 800,
    frame: false,
    alwaysOnTop: true,
    backgroundColor: '#000000',
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  setupWindow.loadURL('http://localhost:3000/session/setup');
  setupWindow.on('closed', () => { setupWindow = null; });
});

ipcMain.on('initiate-lockdown', (event, config) => {
  const { allowedApps, primaryApp, duration, strictMode } = config;

  if (setupWindow) {
    setupWindow.close();
  }

  if (strictMode) {
    mainWindow.setAlwaysOnTop(true, 'screen-saver');
    const keys = [
      'Alt+Tab',
      'Alt+F4',
      'CommandOrControl+Tab',
      'CommandOrControl+Esc',
      'F11',
      'F12'
    ];
    keys.forEach(k => {
      try { globalShortcut.register(k, () => { }); } catch (e) { }
    });
    try { globalShortcut.register('Super', () => { }); } catch (e) { }
  }

  globalShortcut.register('CommandOrControl+Shift+X', () => { app.quit(); });

  const appMap = {
    'vscode': { cmd: 'code', name: 'Visual Studio Code', search: 'code' },
    'word': { cmd: 'start winword', name: 'Word', search: 'winword' },
    'ppt': { cmd: 'start powerpnt', name: 'PowerPoint', search: 'powerpnt' },
    'excel': { cmd: 'start excel', name: 'Excel', search: 'excel' },
    'notepad': { cmd: 'notepad', name: 'Notepad', search: 'notepad' },
    'calculator': { cmd: 'calc', name: 'Calculator', search: 'calculator' },
    'git': { cmd: 'start "" "C:\\Program Files\\Git\\git-bash.exe"', name: 'Git Bash', search: 'sh' },
    'snippingtool': { cmd: 'snippingtool', name: 'Snipping Tool', search: 'snippingtool' }
  };

  allowedApps.forEach(appKey => {
    const target = appMap[appKey];
    if (target) {
      exec(target.cmd, (err) => {
        if (err) exec(`start ${target.cmd}`);
      });
    }
  });

  const primary = appMap[primaryApp] || appMap['vscode'];
  currentPrimaryCmd = primary.cmd;
  currentPrimaryName = primary.name;

  setTimeout(() => {
    const ps = `
      $wshell = New-Object -ComObject WScript.Shell;
      $wshell.AppActivate('${primary.name}');
      Sleep 1;
      $wshell.SendKeys('{F11}');
    `;
    exec(`powershell -Command "${ps.replace(/\n/g, '')}"`);
  }, 2000);

  const getActiveWindowPS = `
    Add-Type '[DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();' -Name Window -Namespace Win32;
    $hwnd = [Win32.Window]::GetForegroundWindow();
    if ($hwnd -ne [IntPtr]::Zero) {
      $proc = Get-Process | Where-Object { $_.MainWindowHandle -eq $hwnd };
      if ($proc) { $proc.ProcessName + "|" + $proc.MainWindowTitle }
      else { "unknown|unknown" }
    } else { "none|none" }
  `.replace(/\n/g, ' ');

  if (trackingInterval) clearInterval(trackingInterval);
  
  setInterval(() => {
    killDistractions(allowedApps);
  }, 3000);

  setTimeout(() => {
    trackingInterval = setInterval(() => {
      exec('tasklist', (err, stdout) => {
        const running = stdout.toLowerCase();
        const primaryRunning = running.includes(primary.search);

        if (!primaryRunning) {
          console.log('[WARDEN] PRIMARY APP CLOSED!');
          triggerDistraction('PRIMARY APP CLOSED');
          return;
        }

        exec(`powershell -Command "${getActiveWindowPS}"`, (err, stdout) => {
          if (err || !stdout) return;
          
          const output = stdout.toString().trim().toLowerCase();
          if (!output.includes('|')) return;
          const [activeApp, activeTitle] = output.split('|');

          const isAllowed = allowedApps.some(appKey => {
            const app = appMap[appKey];
            return app && activeApp.includes(app.search);
          });
          
          const isSelf = activeTitle.includes('focus os') || activeApp.includes('electron') || activeApp.includes('none');

          if (isAllowed) {
            isViolationActive = false;
            mainWindow.setKiosk(false);
            mainWindow.setAlwaysOnTop(false);
          } else if (isSelf) {
            if (!isViolationActive) {
              mainWindow.setKiosk(false);
              mainWindow.setAlwaysOnTop(false);
            }
          } else {
            console.log('[VIOLATION]', activeApp);
            if (strictMode) {
              triggerDistraction(activeApp);
            }
          }
        });
      });
    }, 800);
  }, 5000);

  const sessionMs = (duration || 30) * 60 * 1000;
  if (lockdownTimer) clearInterval(lockdownTimer);
  lockdownTimer = setInterval(() => {
    isViolationActive = true;
    mainWindow.setOpacity(1.0);
    mainWindow.setIgnoreMouseEvents(false);
    mainWindow.setKiosk(true);
    mainWindow.restore();
    mainWindow.focus();
    mainWindow.webContents.send('trigger-break');
  }, sessionMs);
});

ipcMain.on('end-break', () => { app.quit(); });

ipcMain.on('resume-lockdown', () => {
  if (currentPrimaryCmd) {
    exec(currentPrimaryCmd, (err) => {
      if (err) exec(`start ${currentPrimaryCmd}`);
    });
  }
  
  mainWindow.setKiosk(false);
  mainWindow.setAlwaysOnTop(false);
  
  setTimeout(() => {
    const ps = `
      $wshell = New-Object -ComObject WScript.Shell;
      $wshell.AppActivate('${currentPrimaryName}');
      Sleep 1;
      $wshell.SendKeys('{F11}');
    `;
    exec(`powershell -Command "${ps.replace(/\n/g, '')}"`);
    isViolationActive = false;
  }, 2000);
});
