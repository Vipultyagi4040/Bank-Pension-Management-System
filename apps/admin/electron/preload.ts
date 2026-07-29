import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  downloadFile: (url: string, filename: string) => ipcRenderer.invoke("download-file", { url, filename })
});
