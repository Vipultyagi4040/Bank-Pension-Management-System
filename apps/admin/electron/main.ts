import { app, BrowserWindow, ipcMain, shell } from "electron";
import path from "path";
import fs from "fs";

const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 768,
    minWidth: 320,
    minHeight: 480,
    title: "Bank Pension Management System",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "..", "..", "app", "dist", "index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle("download-file", async (_event, { url, filename }: { url: string; filename: string }) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Download failed");
    const buffer = Buffer.from(await response.arrayBuffer());
    const downloadsPath = app.getPath("downloads");
    const filePath = path.join(downloadsPath, filename);
    fs.writeFileSync(filePath, buffer);
    return { success: true, path: filePath };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});
