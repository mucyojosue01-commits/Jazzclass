import {useEffect,useState} from 'react';
type InstallPromptEvent=Event&{prompt:()=>Promise<void>;userChoice:Promise<{outcome:'accepted'|'dismissed';platform:string}>};
export default function InstallAppButton(){
 const [prompt,setPrompt]=useState<InstallPromptEvent|null>(null),[installed,setInstalled]=useState(false),[help,setHelp]=useState(false);
 useEffect(()=>{const onPrompt=(event:Event)=>{event.preventDefault();setPrompt(event as InstallPromptEvent);};const onInstalled=()=>{setInstalled(true);setPrompt(null);setHelp(false);};setInstalled(window.matchMedia('(display-mode: standalone)').matches||Boolean((navigator as Navigator&{standalone?:boolean}).standalone));window.addEventListener('beforeinstallprompt',onPrompt);window.addEventListener('appinstalled',onInstalled);return()=>{window.removeEventListener('beforeinstallprompt',onPrompt);window.removeEventListener('appinstalled',onInstalled);};},[]);
 if(installed)return <span className="pwa-installed" aria-label="JazzClass installed">✓ APP INSTALLED</span>;
 if(!prompt)return <button className="pwa-install-button" onClick={()=>setHelp(v=>!v)} aria-expanded={help}>＋ INSTALL APP</button>;
 const install=async()=>{await prompt.prompt();const choice=await prompt.userChoice;if(choice.outcome==='accepted')setInstalled(true);setPrompt(null);};
 return <button className="pwa-install-button" onClick={()=>void install()}>↓ INSTALL APP</button>;
}
