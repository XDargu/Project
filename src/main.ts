import { app, BrowserWindow, Menu, ipcMain, dialog, ipcRenderer } from "electron";
import * as path from "path";
import * as url from "url";
import MenuBuilder from "./components/Menu";
import FileManager from './files/FileManager';
import * as Messaging from "./messaging/MessageDefinitions";

let mainWindow: Electron.BrowserWindow;

// File Manager
let fileManager: FileManager;
let menuBuilder: MenuBuilder;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 1080,
    width: 1920,
    /*fullscreen: true,*/
    /*frame: false,*/
    webPreferences: {
        nodeIntegration: true,
        nodeIntegrationInWorker: true
    }
  });

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, "../index.html"),
      protocol: "file:",
      slashes: true,
  }));

  // Open the DevTools.
  mainWindow.webContents.openDevTools({mode: 'detach'});

  // Emitted when the window is closed.
  mainWindow.on("closed", () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  menuBuilder = new MenuBuilder(onOpenFileClicked, onExportFileClicked, onOpenRecentFileClicked);
  Menu.setApplicationMenu(menuBuilder.buildMenu(mainWindow));

  fileManager = new FileManager();
  fileManager.initialize(onFileHistoryChanged);
}

// File callbacks
function onFileHistoryChanged(paths: string[])
{
  menuBuilder.updateRecentMenu(paths);
  Menu.setApplicationMenu(menuBuilder.buildMenu(mainWindow));
  mainWindow.webContents.send('asynchronous-reply', new Messaging.Message(Messaging.MessageType.UpdateRecentFiles, paths.toString()));
}

function onOpenFileClicked()
{
  fileManager.openFile((path: string, content: string) => {
    mainWindow.webContents.send('asynchronous-reply', new Messaging.Message(Messaging.MessageType.OpenResult, content));
  });
}

function onExportFileClicked()
{
  mainWindow.webContents.send('asynchronous-reply', new Messaging.Message(Messaging.MessageType.RequestSave, ""));
}

function onOpenRecentFileClicked(path : string)
{
  fileManager.loadFile(path, (path: string, content: string) => {
    mainWindow.webContents.send('asynchronous-reply', new Messaging.Message(Messaging.MessageType.OpenResult, content));
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it"s common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
class SessionOptions {
  public showClearDataDialog: boolean = true;
}

let sessionOptions: SessionOptions = new SessionOptions();

ipcMain.on('asynchronous-message', (event: any, arg: Messaging.Message) => {
  switch(arg.type)
  {
    case Messaging.MessageType.Save:
    {
      fileManager.saveFile(arg.data as string);
      break;
    }
    case Messaging.MessageType.Load:
    {
      const filePath = arg.data as string;
      fileManager.loadFile(filePath, (path: string, content: string) => {
        console.log('Returning! ');
        console.log(event);
        event.reply('asynchronous-reply', new Messaging.Message(Messaging.MessageType.OpenResult, content));
      });
      break;
    }
    case Messaging.MessageType.Open:
    {
      fileManager.openFile((path: string, content: string) => {
        console.log('Returning! ');
        console.log(event);
        event.reply('asynchronous-reply', new Messaging.Message(Messaging.MessageType.OpenResult, content));
      });
      break;
    }
    case Messaging.MessageType.Clear:
    {
      if (!sessionOptions.showClearDataDialog) {
        event.reply('asynchronous-reply', new Messaging.Message(Messaging.MessageType.ClearResult, {clear: true, remember: true}));
        break;
      }

      const options = {
        type: 'warning',
        buttons: ['Remove data', 'Cancel'],
        defaultId: 2,
        title: 'Remove data',
        message: 'Are you sure you want to remove all existing data?',
        detail: 'This will remove all recorded data',
        checkboxLabel: "Don't ask again",
        checkboxChecked: false,
      };
    
      dialog.showMessageBox(null, options, (response, checkboxChecked) => {
        const shouldClear: boolean = response == 0;

        if (shouldClear && checkboxChecked) {
          sessionOptions.showClearDataDialog = false;
        }

        event.reply('asynchronous-reply', new Messaging.Message(Messaging.MessageType.ClearResult, {clear: shouldClear, remember: checkboxChecked}));
      });
      break;
    }
  }
})