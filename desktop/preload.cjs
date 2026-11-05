const {contextBridge}=require('electron');
contextBridge.exposeInMainWorld('jazzClassDesktop',{platform:process.platform,version:process.versions.electron,isDesktop:true});
