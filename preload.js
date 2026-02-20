const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    onThemeChanged: (theme) => ipcRenderer.send("theme-changed", theme),
});
