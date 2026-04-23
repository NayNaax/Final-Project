const { contextBridge, ipcRenderer, shell } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    onThemeChanged: (theme) => ipcRenderer.send("theme-changed", theme),
    openExternal: (url) => shell.openExternal(url),
});
