import sketch from"sketch";const UI=require("sketch/ui"),Settings=require("sketch/settings");import"babel-polyfill";const fetch=require("sketch-polyfill-fetch"),HOST="https://icanicon.io",loginRequest=async()=>{const e=Settings.sessionVariable("username"),s=Settings.sessionVariable("password"),t=`${HOST}/api/login/`;let a=new FormData;a.append("username",e),a.append("password",s);const n={method:"POST",body:a};try{const e=await fetch(t,n),s=await e.text();let a=JSON.parse(s).access;if(a){const e=Settings.sessionVariable("username");UI.message(`Logged in as ${e}`),Settings.setSessionVariable("token",a)}else UI.message("Error during login, please check your username and password for IcanIcon"),Settings.setSessionVariable("token",null)}catch(e){UI.message("Error during login, please check your username and password for IcanIcon")}},login=()=>{const e={initialValue:"Password"},s=(e,s)=>{Settings.setSessionVariable("password",s)};UI.getInputFromUser("Please introduce your username for IcanIcon",{initialValue:"Username"},(t,a)=>{Settings.setSessionVariable("username",a),UI.getInputFromUser("Please introduce your password for IcanIcon",e,s)})},getTeams=async()=>{const e=Settings.sessionVariable("token"),s=`${HOST}/api/teams/`,t={headers:{Authorization:"Bearer "+e}};try{const e=await fetch(s,t),a=await e.json();Settings.setSessionVariable("teams",a)}catch(e){UI.message(e),console.log("Error",e)}},selectTeam=()=>{const e=Settings.sessionVariable("teams"),s=e.map(e=>e.name);UI.getInputFromUser("Please select a team.",{type:UI.INPUT_TYPE.selection,possibleValues:s},(s,t)=>{UI.message(`Current team: ${t}`),t=e.find(e=>e.name===t),Settings.setSessionVariable("currentTeam",t)})},exportIcon=(e,s,t)=>{if(console.log(e.type),"Artboard"===e.type||"Group"===e.type){const s=e,a={formats:"svg",output:!1};let n=sketch.export(s,a);t.push({svg:n,name:e.name})}},createOrUpdateSketchBoard=async e=>{let s=[],t=[];e.pages.forEach(e=>{s=[];const a=e.name;e.layers.forEach(e=>exportIcon(e,0,s)),t.push({segment:a,icons:s})}),console.log(t);const a=splitRequest(t),n=Settings.sessionVariable("currentTeam").id,o=Settings.sessionVariable("token"),r=Settings.sessionVariable("boardName"),i=a.reduce((e,s)=>e+s.icons.length,0),c=`${HOST}/api/createOrUpdateSketchBoard/`;let l=[],g=1;UI.message("Uploading: 0%");try{for(const e in a){const s=a[e];for(const t in s.icons){const a=s.icons[t],u={first_request:"0"===`${e}`&&"0"===`${t}`,first_segment_request:"0"===`${t}`,team:n,board_name:r,segment_name:s.name,icons:a},p={method:"POST",headers:{Authorization:"Bearer "+o,"Content-Type":"application/json"},body:JSON.stringify(u)},m=await fetch(c,p),d=parseFloat(g.toFixed(2))/parseFloat(i.toFixed(2))*100;if(UI.message(`Uploading: ${d}%`),g+=1,l.push(m.status),200!==m.status)return}}}catch(e){return UI.message(`Error: ${e}`),void console.log(e)}UI.message("Your icons are exported successfully.")},setBoardName=e=>{let s=e.path;if(!s)throw UI.message("Please set a name for your sketch project and save before syncing with IcanIcon"),new Error("No projectName set");const t=(s=s.split("/").pop()).replace(".sketch","");Settings.setSessionVariable("boardName",t)};function splitRequest(e){let s=[];for(const t in e){const a=e[t].segment;s.push({name:a,icons:[]}),s[t].icons=e[t].icons.reduce((e,s,t)=>{const a=Math.floor(t/10);return e[a]||(e[a]=[]),e[a].push(s),e},[])}return s}export default async function(){console.log("---Running IcanIcon plugin---");const e=sketch.getSelectedDocument();setBoardName(e),Settings.sessionVariable("token")?await loginRequest():(await login(),await loginRequest()),await getTeams(),await selectTeam(),createOrUpdateSketchBoard(e),console.log("---Icanicon end---")};
