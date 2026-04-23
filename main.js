const { app, BrowserWindow, nativeTheme, ipcMain, shell } = require("electron");
const path = require("path");
const http = require("http");

// Helper function to test if a port is accessible
async function findVitePort() {
    const ports = [5173, 5174, 5175, 5176, 5177];
    for (const port of ports) {
        try {
            await new Promise((resolve, reject) => {
                const req = http.get(`http://localhost:${port}/@vite/client`, { timeout: 1000 }, (res) => {
                    if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                        resolve();
                        req.destroy();
                        return;
                    }
                    reject(new Error(`Unexpected status ${res.statusCode}`));
                    req.destroy();
                });
                req.on("error", reject);
                req.on("timeout", () => {
                    req.destroy();
                    reject(new Error("Timeout"));
                });
            });
            return port;
        } catch (error) {
            // No Vite dev server on this port, try next
        }
    }
    return null;
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : null;
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).padStart(6, "0");
}

function interpolateColor(color1, color2, factor) {
    const r = Math.round(color1.r + factor * (color2.r - color1.r));
    const g = Math.round(color1.g + factor * (color2.g - color1.g));
    const b = Math.round(color1.b + factor * (color2.b - color1.b));
    return rgbToHex(r, g, b);
}

let activeAnimation = null;
let currentBg = nativeTheme.shouldUseDarkColors ? "#0b0f19" : "#f8fafc";
let currentFg = nativeTheme.shouldUseDarkColors ? "#f8fafc" : "#0f172a";

function animateTitleBar(win, targetBgHex, targetFgHex, durationMs = 400) {
    if (activeAnimation) clearInterval(activeAnimation);

    const startBg = hexToRgb(currentBg);
    const startFg = hexToRgb(currentFg);
    const endBg = hexToRgb(targetBgHex);
    const endFg = hexToRgb(targetFgHex);

    if (!startBg || !startFg || !endBg || !endFg) return;

    const startTime = Date.now();

    activeAnimation = setInterval(() => {
        let factor = (Date.now() - startTime) / durationMs;
        if (factor >= 1) factor = 1;

        const easeFactor = 1 - Math.pow(1 - factor, 3); // cubic ease-out

        currentBg = interpolateColor(startBg, endBg, easeFactor);
        currentFg = interpolateColor(startFg, endFg, easeFactor);

        try {
            win.setTitleBarOverlay({
                color: currentBg,
                symbolColor: currentFg,
            });
        } catch (e) {
            clearInterval(activeAnimation);
        }

        if (factor === 1) clearInterval(activeAnimation);
    }, 16);
}

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        titleBarStyle: "hidden",
        titleBarOverlay: {
            color: currentBg,
            symbolColor: currentFg,
            height: 40,
        },
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    win.setMenu(null);
    win.webContents.setWindowOpenHandler(({ url }) => {
        if (url) {
            shell.openExternal(url);
        }
        return { action: "deny" };
    });
    win.once("ready-to-show", () => {
        win.maximize();
        win.show();
    });

    // Try to load from environment variable, or auto-detect Vite port
    if (process.env.ELECTRON_START_URL) {
        win.loadURL(process.env.ELECTRON_START_URL);
    } else {
        // Auto-detect which port Vite is running on
        findVitePort().then((port) => {
            if (!port) {
                win.loadURL(
                    "data:text/html,<!doctype html><html><body style='font-family:Segoe UI,Arial,sans-serif;padding:24px'><h2>Dev server not found</h2><p>Start the frontend dev server and try again.</p></body></html>",
                );
                return;
            }
            const startUrl = `http://localhost:${port}`;
            console.log(`Loading app from ${startUrl}`);
            win.loadURL(startUrl);
        });
    }

    ipcMain.removeAllListeners("theme-changed"); // Prevent duplicate listeners on hot reload
    ipcMain.on("theme-changed", (event, theme) => {
        const isDark = theme === "dark";
        const targetBg = isDark ? "#0b0f19" : "#f8fafc";
        const targetFg = isDark ? "#f8fafc" : "#0f172a";
        animateTitleBar(win, targetBg, targetFg, 500); // 500ms for slightly slower transition
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
