const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'renderer', 'preload.js')
    },
    icon: path.join(__dirname, 'assets', 'icon.png'), // Optional: add an app icon
    titleBarStyle: 'default'
  });

  // Load the app
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  // Open DevTools in development
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// IPC handlers for file operations
ipcMain.handle('select-image', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Select Image',
      filters: [
        {
          name: 'Images',
          extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp']
        }
      ],
      properties: ['openFile']
    });

    if (!result.canceled && result.filePaths.length > 0) {
      const filePath = result.filePaths[0];
      const fileData = fs.readFileSync(filePath);
      const base64Data = fileData.toString('base64');
      const mimeType = getMimeType(filePath);
      
      return {
        success: true,
        filePath: filePath,
        fileName: path.basename(filePath),
        dataUrl: `data:${mimeType};base64,${base64Data}`
      };
    } else {
      return { success: false, message: 'No file selected' };
    }
  } catch (error) {
    console.error('Error selecting image:', error);
    return { success: false, message: error.message };
  }
});

ipcMain.handle('save-image', async (event, saveData) => {
  try {
    const { dataURL, size, format, extension } = saveData;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const defaultName = `cropped_${size}x${size}_${timestamp}.${extension}`;
    
    // Create appropriate file filters based on format
    const filters = [];
    if (format === 'png') {
      filters.push(
        { name: 'PNG Images', extensions: ['png'] },
        { name: 'JPEG Images', extensions: ['jpg', 'jpeg'] },
        { name: 'All Images', extensions: ['png', 'jpg', 'jpeg'] }
      );
    } else {
      filters.push(
        { name: 'JPEG Images', extensions: ['jpg', 'jpeg'] },
        { name: 'PNG Images', extensions: ['png'] },
        { name: 'All Images', extensions: ['png', 'jpg', 'jpeg'] }
      );
    }
    
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Save Cropped Image As...',
      defaultPath: defaultName,
      filters: filters,
      properties: ['createDirectory']
    });

    if (!result.canceled && result.filePath) {
      let buffer;
      
      if (dataURL.startsWith('data:')) {
        const base64Data = dataURL.split(',')[1];
        buffer = Buffer.from(base64Data, 'base64');
      } else {
        return { success: false, message: 'Invalid image data format' };
      }
      
      fs.writeFileSync(result.filePath, buffer);
      
      const fileStats = fs.statSync(result.filePath);
      const fileSizeKB = (fileStats.size / 1024).toFixed(1);
      
      return {
        success: true,
        filePath: result.filePath,
        message: `Image saved successfully!\nSize: ${size}×${size}px\nFormat: ${format.toUpperCase()}\nFile size: ${fileSizeKB} KB`
      };
    } else {
      return { success: false, message: 'Save cancelled' };
    }
  } catch (error) {
    console.error('Error saving image:', error);
    return { success: false, message: error.message };
  }
});

// Helper function to get MIME type based on file extension
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.bmp': 'image/bmp',
    '.webp': 'image/webp'
  };
  return mimeTypes[ext] || 'image/jpeg';
}