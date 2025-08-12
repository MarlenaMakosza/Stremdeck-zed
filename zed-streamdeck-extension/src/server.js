const http = require("http");
const { exec } = require("child_process");

// Konfiguracja
const PORT = 21422;
const IS_WINDOWS = process.platform === "win32";
const IS_MAC = process.platform === "darwin";

// Serwer HTTP dla Stream Deck
const server = http.createServer((req, res) => {
  // Włącz CORS dla Stream Deck
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Obsługa preflight dla CORS
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  // Obsługa żądań GET (status check)
  if (req.method === "GET" && req.url === "/status") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "running",
        platform: process.platform,
        port: PORT,
      }),
    );
    return;
  }

  // Obsługa żądań POST
  if (req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk.toString()));

    req.on("end", () => {
      try {
        const data = body ? JSON.parse(body) : {};
        console.log(`[${new Date().toISOString()}] ${req.url}`, data);

        // Routing akcji
        switch (req.url) {
          // === ZARZĄDZANIE OKNAMI ===
          case "/window/new":
            openNewWindow();
            sendResponse(res, { status: "ok", action: "new_window" });
            break;

          case "/window/close":
            sendKeys("alt+f4");
            sendResponse(res, { status: "ok", action: "close_window" });
            break;

          // === TERMINAL ===
          case "/terminal":
          case "/terminal/toggle":
            sendKeys("ctrl+j"); // Ctrl+J dla Zed
            sendResponse(res, { status: "ok", action: "terminal_toggled" });
            break;

          case "/terminal/new":
            sendKeys("ctrl+shift+`");
            sendResponse(res, { status: "ok", action: "new_terminal" });
            break;

          // === NAWIGACJA ===
          case "/navigate/file":
          case "/file/open":
            sendKeys("ctrl+p");
            sendResponse(res, { status: "ok", action: "file_picker" });
            break;

          case "/navigate/symbol":
            sendKeys("ctrl+shift+o");
            sendResponse(res, { status: "ok", action: "symbol_picker" });
            break;

          case "/navigate/back":
            sendKeys("alt+left");
            sendResponse(res, { status: "ok", action: "navigate_back" });
            break;

          case "/navigate/forward":
            sendKeys("alt+right");
            sendResponse(res, { status: "ok", action: "navigate_forward" });
            break;

          // === EDYCJA ===
          case "/edit/format":
            sendKeys("shift+alt+f");
            sendResponse(res, { status: "ok", action: "format_document" });
            break;

          case "/edit/comment":
            sendKeys("ctrl+/");
            sendResponse(res, { status: "ok", action: "toggle_comment" });
            break;

          case "/edit/undo":
            sendKeys("ctrl+z");
            sendResponse(res, { status: "ok", action: "undo" });
            break;

          case "/edit/redo":
            sendKeys("ctrl+shift+z");
            sendResponse(res, { status: "ok", action: "redo" });
            break;

          case "/edit/save":
            sendKeys("ctrl+s");
            sendResponse(res, { status: "ok", action: "save" });
            break;

          // === BUILD & RUN ===
          case "/build":
            sendKeys("ctrl+shift+b");
            sendResponse(res, { status: "ok", action: "build" });
            break;

          case "/run":
            sendKeys("f5");
            sendResponse(res, { status: "ok", action: "run" });
            break;

          case "/debug/start":
            sendKeys("f5");
            sendResponse(res, { status: "ok", action: "debug_start" });
            break;

          case "/debug/stop":
            sendKeys("shift+f5");
            sendResponse(res, { status: "ok", action: "debug_stop" });
            break;

          case "/debug/step-over":
            sendKeys("f10");
            sendResponse(res, { status: "ok", action: "step_over" });
            break;

          case "/debug/step-into":
            sendKeys("f11");
            sendResponse(res, { status: "ok", action: "step_into" });
            break;

          // === GIT ===
          case "/git/status":
            exec("git status --short", (error, stdout, stderr) => {
              sendResponse(res, {
                status: error ? "error" : "ok",
                output: stdout || stderr,
              });
            });
            break;

          case "/git/pull":
            exec("git pull", (error, stdout, stderr) => {
              sendResponse(res, {
                status: error ? "error" : "ok",
                output: stdout || stderr,
              });
            });
            break;

          case "/git/push":
            exec("git push", (error, stdout, stderr) => {
              sendResponse(res, {
                status: error ? "error" : "ok",
                output: stdout || stderr,
              });
            });
            break;

          // === WIDOK ===
          case "/view/split":
            sendKeys("ctrl+\\");
            sendResponse(res, { status: "ok", action: "split_view" });
            break;

          case "/view/zoom-in":
            sendKeys("ctrl+=");
            sendResponse(res, { status: "ok", action: "zoom_in" });
            break;

          case "/view/zoom-out":
            sendKeys("ctrl+-");
            sendResponse(res, { status: "ok", action: "zoom_out" });
            break;

          case "/view/fullscreen":
            sendKeys("f11");
            sendResponse(res, { status: "ok", action: "fullscreen" });
            break;

          // === PROJEKTY ===
          case "/project/open":
            const { path } = data;
            if (path) {
              console.log(`[PROJECT] Attempting to open: ${path}`);
              
              // Użyj spawn dla lepszej kontroli
              const { spawn } = require('child_process');
              
              if (IS_WINDOWS) {
                // Dla Windows - normalizuj ścieżkę
                const normalizedPath = path.replace(/\//g, '\\');
                
                // Po prostu użyj 'zed' z PATH - jest tam dodany podczas instalacji
                console.log(`[PROJECT] Using 'zed' from PATH`);
                console.log(`[PROJECT] Opening project: ${normalizedPath}`);
                
                const zedProcess = spawn(
                  'zed',  // Użyj zed z PATH
                  [normalizedPath],
                  { 
                    detached: true,
                    stdio: 'ignore',
                    shell: false,
                    windowsHide: true  // Ukryj okno konsoli na Windows
                  }
                );
                
                zedProcess.unref(); // Pozwól procesowi działać niezależnie
                
                console.log(`[PROJECT] Spawned Zed process with PID: ${zedProcess.pid}`);
                
                // Daj chwilę na start procesu
                setTimeout(() => {
                  sendResponse(res, {
                    status: "ok",
                    action: "project_opened",
                    path: normalizedPath,
                    pid: zedProcess.pid
                  });
                }, 500);
                
              } else {
                // Dla macOS/Linux też użyj spawn
                const zedProcess = spawn(
                  'zed',
                  [path],
                  { 
                    detached: true,
                    stdio: 'ignore',
                    shell: false
                  }
                );
                
                zedProcess.unref();
                
                console.log(`[PROJECT] Spawned Zed process with PID: ${zedProcess.pid}`);
                console.log(`[PROJECT] Opening project: ${path}`);
                
                setTimeout(() => {
                  sendResponse(res, {
                    status: "ok",
                    action: "project_opened",
                    path,
                    pid: zedProcess.pid
                  });
                }, 500);
              }
            } else {
              console.error(`[PROJECT] No path provided in request`);
              sendResponse(res, { status: "error", message: "Path required" });
            }
            break;

          case "/project/recent":
            sendKeys("ctrl+r");
            sendResponse(res, { status: "ok", action: "recent_projects" });
            break;

          // === WŁASNE KOMENDY ===
          case "/custom/command":
            const { command } = data;
            if (command) {
              exec(command, (error, stdout, stderr) => {
                sendResponse(res, {
                  status: error ? "error" : "ok",
                  stdout,
                  stderr,
                });
              });
            } else {
              sendResponse(res, {
                status: "error",
                message: "Command required",
              });
            }
            break;

          // === NIEZNANE ŻĄDANIE ===
          default:
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                status: "error",
                message: `Unknown endpoint: ${req.url}`,
              }),
            );
        }
      } catch (error) {
        console.error("Error processing request:", error);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            status: "error",
            message: "Invalid request",
            error: error.message,
          }),
        );
      }
    });
  } else {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "error",
        message: "Method not allowed",
      }),
    );
  }
});

// === FUNKCJE POMOCNICZE ===

// Otwórz nowe okno Zed
function openNewWindow() {
  const command = IS_WINDOWS ? 'start "" "zed"' : "zed";

  exec(command, { shell: true }, (error, stdout, stderr) => {
    if (error && IS_WINDOWS) {
      // Fallback dla Windows
      exec('powershell -Command "Start-Process zed"', (err2) => {
        if (err2) {
          console.error("Error opening new Zed window:", err2);
        } else {
          console.log("Opened new Zed window via PowerShell");
        }
      });
    } else if (error) {
      console.error("Error opening new Zed window:", error);
    } else {
      console.log("Opened new Zed window");
    }
  });
}

// Wyślij kombinację klawiszy
function sendKeys(keyCombo) {
  console.log(`Sending keys: ${keyCombo}`);

  if (IS_WINDOWS) {
    sendKeysWindows(keyCombo);
  } else if (IS_MAC) {
    sendKeysMac(keyCombo);
  } else {
    sendKeysLinux(keyCombo);
  }
}

// Windows - używa PowerShell SendKeys
function sendKeysWindows(keyCombo) {
  const keyMap = {
    "ctrl+j": "^j",
    "ctrl+p": "^p",
    "ctrl+`": "^`",
    "ctrl+/": "^/",
    "ctrl+\\": "^\\",
    "ctrl+s": "^s",
    "ctrl+z": "^z",
    "ctrl+r": "^r",
    "ctrl+=": "^=",
    "ctrl+-": "^-",
    "ctrl+shift+b": "^+b",
    "ctrl+shift+o": "^+o",
    "ctrl+shift+z": "^+z",
    "ctrl+shift+`": "^+`",
    "shift+alt+f": "+%f",
    "alt+f4": "%{F4}",
    "alt+left": "%{LEFT}",
    "alt+right": "%{RIGHT}",
    f5: "{F5}",
    f10: "{F10}",
    f11: "{F11}",
    "shift+f5": "+{F5}",
  };

  const sendKeysFormat = keyMap[keyCombo] || keyCombo;

  const powershellScript = `
      Add-Type -AssemblyName System.Windows.Forms
      [System.Windows.Forms.SendKeys]::SendWait("${sendKeysFormat}")
    `;

  exec(`powershell -Command "${powershellScript}"`, (error) => {
    if (error) {
      console.error(`Error sending keys ${keyCombo}:`, error);
    } else {
      console.log(`Sent keys: ${keyCombo} -> ${sendKeysFormat}`);
    }
  });
}

// macOS - używa AppleScript
function sendKeysMac(keyCombo) {
  const script = `osascript -e 'tell application "System Events" to keystroke "${keyCombo}"'`;
  exec(script, (error) => {
    if (error) {
      console.error(`Error sending keys ${keyCombo}:`, error);
    }
  });
}

// Linux - używa xdotool
function sendKeysLinux(keyCombo) {
  exec(`xdotool key ${keyCombo}`, (error) => {
    if (error) {
      console.error(`Error sending keys ${keyCombo}:`, error);
    }
  });
}

// Wyślij odpowiedź JSON
function sendResponse(res, data) {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

// === URUCHOMIENIE SERWERA ===
server.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════╗
  ║   Zed Stream Deck Server               ║
  ║   Running on http://localhost:${PORT}    ║
  ╚════════════════════════════════════════╝

  Available endpoints:
    POST /window/new        - Open new Zed window
    POST /terminal/toggle   - Toggle terminal
    POST /navigate/file     - Open file picker (Ctrl+P)
    POST /edit/format       - Format document
    POST /build             - Build project
    POST /run               - Run project
    POST /git/status        - Git status
    POST /project/open      - Open project (requires path)
    GET  /status            - Server status

  Platform: ${process.platform}
  Press Ctrl+C to stop
  `);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down server...");
  server.close();
  process.exit(0);
});
