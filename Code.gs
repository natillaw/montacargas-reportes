const KEY = 'cambia-esta-clave';
const SHEET_ID = ''; // déjalo vacío si creaste el script desde la hoja (Extensiones > Apps Script)
function ss_(){return SHEET_ID?SpreadsheetApp.openById(SHEET_ID):SpreadsheetApp.getActive();}
const RK=['id','u','sn','d','t','e','fa','tr','rf','ob','ck','m'];
const RN=['ID','Unidad','Tienda','Fecha','Tipo','Estado','Falla','Trabajo','Refacciones','Observaciones','Checklist','Mensaje'];
const TK=['id','u','t','d','s','x'], TNM=['ID','Unidad','Pendiente','Fecha','Origen','Hecho'];
const MK=['u','e','d','t'], MNM=['Unidad','Estado','Última visita','Tipo'];

function sh_(n,h){const ss=ss_();let s=ss.getSheetByName(n);
  if(!s){s=ss.insertSheet(n);s.getRange(1,1,1,h.length).setValues([h]).setFontWeight('bold');s.setFrozenRows(1);
    s.getRange(1,1,s.getMaxRows(),h.length).setNumberFormat('@');}
  return s;}
function rows_(s,w){const n=s.getLastRow();return n<2?[]:s.getRange(2,1,n-1,w).getValues();}
function put_(s,w,rows){s.getRange(2,1,Math.max(s.getMaxRows()-1,1),w).clearContent();
  if(rows.length)s.getRange(2,1,rows.length,w).setValues(rows);}
function out_(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);}

function doPost(e){
  let L;
  try{
    const b=JSON.parse(e.postData.contents);
    if(b.key!==KEY)return out_({error:'key'});
    L=LockService.getScriptLock();L.waitLock(20000);
    if(b.type==='report'){
      const s=sh_('Reportes',RN);
      if(!rows_(s,1).map(r=>String(r[0])).includes(String(b.r.id)))
        s.appendRow(RK.map(k=>b.r[k]===undefined?'':String(b.r[k])));
    }
    if(b.type==='hub'){
      put_(sh_('Pendientes',TNM),TK.length,(b.tasks||[]).map(t=>TK.map(k=>t[k]===undefined?'':String(t[k]))));
      put_(sh_('Maquinas',MNM),MK.length,Object.keys(b.mach||{}).map(u=>[u,b.mach[u].e,b.mach[u].d,b.mach[u].t]));
    }
    return out_({ok:1});
  }catch(err){return out_({error:String(err)});}
  finally{if(L)L.releaseLock();}
}

function doGet(e){
  try{
  if((e.parameter.key||'')!==KEY)return out_({error:'key'});
  const reports=rows_(sh_('Reportes',RN),RK.length).map(r=>{const o={};RK.forEach((k,i)=>o[k]=r[i]);o.id=Number(o.id);return o;});
  const tasks=rows_(sh_('Pendientes',TNM),TK.length).map(r=>{const o={};TK.forEach((k,i)=>o[k]=r[i]);o.id=Number(o.id);o.x=Number(o.x)||0;return o;});
  const mach={};rows_(sh_('Maquinas',MNM),MK.length).forEach(r=>mach[r[0]]={e:r[1],d:r[2],t:r[3]});
  return out_({reports,hub:{tasks,mach}});
  }catch(err){return out_({error:String(err)});}
}
