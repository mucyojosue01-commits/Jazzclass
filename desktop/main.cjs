const {app,BrowserWindow,Menu,shell,session}=require('electron');
const path=require('node:path');
const isDev=!app.isPackaged;
function createWindow(){
 const win=new BrowserWindow({width:1500,height:960,minWidth:1050,minHeight:720,backgroundColor:'#08080b',title:'JazzClass Piano Studio',show:false,webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true}});
 win.once('ready-to-show',()=>win.show());
 win.webContents.setWindowOpenHandler(({url})=>{if(url.startsWith('https://'))void shell.openExternal(url);return{action:'deny'};});
 if(isDev)void win.loadURL('http://localhost:5173');else void win.loadFile(path.join(__dirname,'../dist/index.html'));
}
app.whenReady().then(()=>{session.defaultSession.setPermissionRequestHandler((_webContents,permission,callback)=>callback(permission==='midi'));session.defaultSession.setPermissionCheckHandler((_webContents,permission)=>permission==='midi');Menu.setApplicationMenu(null);createWindow();app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createWindow();});});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});
