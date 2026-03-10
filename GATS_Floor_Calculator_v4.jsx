// ═══════════════════════════════════════════════════════════════
// GATS DEVELOPMENT — FLOOR CALCULATOR v4
// Passwords: Worker=GatsTeam2026 | Sales=SalesHN | Admin=flooring2026 | Norms=NormaFloor2026
// ═══════════════════════════════════════════════════════════════
import { useState, useMemo, useEffect } from "react";

// ── COLOURS ──────────────────────────────────────────────────
const C = {
  navy:"#1B3A5C",navyD:"#0F2340",navyM:"#2C5282",navyL:"#3A6FA8",
  gold:"#B8860B",goldL:"#D4A017",goldV:"#E8B84B",goldPale:"#FEF9EC",
  bg:"#F2F5F9",card:"#FFFFFF",border:"#DDE3EC",borderD:"#C5CEDB",
  txt:"#1A2035",txtM:"#4A5568",txtL:"#718096",
  greenL:"#15803D",greenBg:"#DCFCE7",greenBd:"#86EFAC",
  amberL:"#D97706",amberBg:"#FEF3C7",amberBd:"#FCD34D",
  redL:"#DC2626",redBg:"#FEE2E2",redBd:"#FCA5A5",
  blueBg:"#EFF6FF",
  sh:"0 1px 3px rgba(27,58,92,0.07),0 4px 12px rgba(27,58,92,0.04)",
  shM:"0 4px 20px rgba(27,58,92,0.13)",
};

// ── FLOOR TYPES ──────────────────────────────────────────────
const FLOOR = {
  hybrid:    {label:"Hybrid Vinyl",          sub:"Floating · No underlay",       normId:"hybrid_2w", ulDef:"none",   acclim:false, tag:"HV"},
  laminate:  {label:"Laminate",              sub:"Floating · Underlay required",  normId:"lamin_2w",  ulDef:"dunlop", acclim:true,  tag:"LA"},
  eng_5g:    {label:"Engineered 5G Click",   sub:"Floating · Fast snap",          normId:"eng_5g",    ulDef:"dunlop", acclim:true,  tag:"E5"},
  eng_direct:{label:"Eng. Direct Stick",     sub:"Spatula glue · No underlay",    normId:"eng_dir",   ulDef:"none",   acclim:true,  tag:"ED"},
  eng_pva:   {label:"Engineered PVA",        sub:"Tongue & groove · On underlay", normId:"eng_pva",   ulDef:"dunlop", acclim:true,  tag:"EP"},
};
const UNDERLAY = {
  none:   {label:"No underlay",            norm:0,   mat:0  },
  dunlop: {label:"Dunlop foam (standard)", norm:0.6, mat:3.5},
  a1:     {label:"Advantage 3 rubber 5mm", norm:0.6, mat:5.5},
  regupol:{label:"Regupol rubber 5mm",     norm:0.6, mat:8.0},
};
const PATTERN = {straight:{label:"Straight",mult:1.0},herringbone:{label:"Herringbone ×1.6",mult:1.6}};
const COMPLEX = {
  open:   {label:"Open plan",        sub:"Large rooms, straight runs",     mult:1.0 },
  std:    {label:"Standard",         sub:"2–3 rooms, standard cuts",        mult:1.15},
  complex:{label:"Complex",          sub:"Many angles, corners",            mult:1.4 },
  reverse:{label:"Complex+Reverse",  sub:"Tight spaces, reverse-click",     mult:1.6 },
};

// Removal options (multi-select)
const REMOVAL_OPTS = {
  carpet:   {label:"Carpet + underlay",       normId:"carpet_up",  rbBase:350, rbExtra:0,   tileType:false},
  laminate: {label:"Laminate / floating",     normId:"lamin_up",   rbBase:350, rbExtra:0,   tileType:false},
  tile:     {label:"Tiles (ceramic/porcel.)", normId:"tile_std",   rbBase:550, rbExtra:150, tileType:true},
  tile_hvy: {label:"Heavy tiles/terracotta",  normId:"tile_hvy",   rbBase:750, rbExtra:250, tileType:true},
};

const ROLES_META = {
  beginner:  {label:"Beginner",         abbr:"BEG",color:"#9CA3AF"},
  apprentice:{label:"Apprentice",       abbr:"APP",color:"#0369A1"},
  installer: {label:"Installer",        abbr:"INS",color:"#166534"},
  senior:    {label:"Senior Installer", abbr:"SNR",color:"#7C3AED"},
  project:   {label:"Project Manager",  abbr:"PM", color:"#B8860B"},
  driver:    {label:"Driver",           abbr:"DRV",color:"#475569"},
};

// ── DEFAULT NORMS (from field measurements + MyNorm sheet) ────
const DEFAULT_NORMS = [
  // Installation
  {id:"hybrid_2w", grp:"Installation",  label:"Hybrid Vinyl (2-person team)",     norm:4.75,  unit:"m²",    role:"installer",  note:"9.5 min/m² solo · from 27m² field data"},
  {id:"hybrid_1w", grp:"Installation",  label:"Hybrid Vinyl (solo)",              norm:9.5,   unit:"m²",    role:"installer",  note:"1 worker reference"},
  {id:"hybrid_hall",grp:"Installation", label:"Hybrid (hallway / complex solo)",  norm:16.4,  unit:"m²",    role:"installer",  note:"Tight spaces, many cuts"},
  {id:"lamin_2w",  grp:"Installation",  label:"Laminate (2-person team)",         norm:8.5,   unit:"m²",    role:"installer",  note:"Floating, standard"},
  {id:"lamin_1w",  grp:"Installation",  label:"Laminate (solo)",                  norm:9.02,  unit:"m²",    role:"installer",  note:"Single worker"},
  {id:"eng_5g",    grp:"Installation",  label:"Engineered 5G Click",              norm:7.5,   unit:"m²",    role:"senior",     note:"Fast snap system, 2 workers"},
  {id:"eng_dir",   grp:"Installation",  label:"Engineered Direct Stick",          norm:14.0,  unit:"m²",    role:"senior",     note:"Spatula glue method"},
  {id:"eng_pva",   grp:"Installation",  label:"Engineered PVA Glue",             norm:19.78, unit:"m²",    role:"senior",     note:"Tongue & groove + underlay · 14m² field"},
  {id:"underlay",  grp:"Installation",  label:"Underlay (foam/rubber)",           norm:0.6,   unit:"m²",    role:"helper",     note:"Dunlop / A1 / Regupol"},
  // Removal
  {id:"carpet_up", grp:"Removal",       label:"Carpet + underlay takeup",        norm:3.7,   unit:"m²",    role:"helper",     note:"Standard, non-glued"},
  {id:"carpet_gl", grp:"Removal",       label:"Carpet (glued to floor)",         norm:5.5,   unit:"m²",    role:"helper",     note:"Extra scraping time"},
  {id:"lamin_up",  grp:"Removal",       label:"Laminate / floating floor",       norm:3.0,   unit:"m²",    role:"helper",     note:"Standard floating"},
  {id:"tile_std",  grp:"Removal",       label:"Tile removal (ceramic/porcel.)",  norm:8.0,   unit:"m²",    role:"helper",     note:"2 perforator attachments"},
  {id:"tile_hvy",  grp:"Removal",       label:"Heavy tile / terracotta",         norm:12.0,  unit:"m²",    role:"helper",     note:"Very heavy, reinforced bags needed"},
  {id:"smooth_man",grp:"Removal",       label:"Smoothedges — manual",            norm:3.0,   unit:"lm",    role:"helper",     note:"Hammer & crowbar · 3.04 min/lm field"},
  {id:"smooth_prf",grp:"Removal",       label:"Smoothedges — perforator",        norm:0.9,   unit:"lm",    role:"helper",     note:"3× faster · 0.83 min/lm field"},
  // Finishing
  {id:"trim",      grp:"Finishing",     label:"Trim (aluminium, concrete)",      norm:7.5,   unit:"lm",    role:"installer",  note:"11 ops: measure·drill·plug·click"},
  {id:"scotia",    grp:"Finishing",     label:"Scotia (standard + angles)",      norm:3.3,   unit:"lm",    role:"helper",     note:"Incl. returns & miters · 2.5 field"},
  {id:"skirt_new", grp:"Finishing",     label:"Skirting — new install",          norm:4.1,   unit:"lm",    role:"installer",  note:"Cut, drill, glue, nail"},
  {id:"skirt_re",  grp:"Finishing",     label:"Skirting — take up & reinstall",  norm:3.5,   unit:"lm",    role:"installer",  note:"Remove, clean, refix"},
  {id:"door_wood", grp:"Finishing",     label:"Timber door frame undercut",      norm:14,    unit:"door×2",role:"installer",  note:"Multitool blade per door"},
  {id:"door_metal",grp:"Finishing",     label:"Metal door frame filler",         norm:10,    unit:"door×2",role:"installer",  note:"Filler + primer per door"},
  {id:"step_str",  grp:"Finishing",     label:"Step — straight",                 norm:25,    unit:"step",  role:"senior",     note:"Hybrid/laminate cut + glue"},
  {id:"step_spi",  grp:"Finishing",     label:"Step — spiral/winding",           norm:45,    unit:"step",  role:"senior",     note:"Complex angles, senior only"},
  // Preparation
  {id:"floor_lev", grp:"Preparation",   label:"Floor levelling (2 workers)",     norm:3.25,  unit:"m²",    role:"installer",  note:"Self-levelling compound · 65m² field"},
  {id:"primer",    grp:"Preparation",   label:"Primer DP90 (roller)",            norm:2.5,   unit:"m²",    role:"helper",     note:"1 coat, work into surface"},
  {id:"plywood_1", grp:"Preparation",   label:"Plywood 1 layer (screw)",         norm:10.0,  unit:"m²",    role:"installer",  note:"2 workers, screws only"},
  {id:"plywood_2", grp:"Preparation",   label:"Plywood 2nd layer 12mm",          norm:9.18,  unit:"m²",    role:"installer",  note:"2 workers incl. lifting"},
  // Logistics
  {id:"tool_load", grp:"Logistics",     label:"Tool load/unload + setup",        norm:30,    unit:"fixed", role:"helper",     note:"Both load & unload"},
  {id:"tea_break", grp:"Logistics",     label:"Tea breaks 2×15min per worker",   norm:30,    unit:"worker",role:"helper",     note:"Paid non-productive time"},
  {id:"cli_brief", grp:"Logistics",     label:"Client briefing + site walkthrough",norm:30,  unit:"fixed", role:"project",    note:"PM at job start"},
  {id:"pm_daily",  grp:"Logistics",     label:"PM daily oversight",              norm:60,    unit:"day",   role:"project",    note:"Per working day on site"},
  // Cleanup
  {id:"cleanup",   grp:"Cleanup",       label:"Final cleanup (basic debris)",    norm:0.5,   unit:"m²",    role:"apprentice", note:"Sweep, vacuum, remove debris"},
];

// ── DEFAULT STAFF ROLES ───────────────────────────────────────
const DEFAULT_STAFF_ROLES = [
  {id:"beginner",  label:"Beginner",         desc:"New hire, inexperienced, many mistakes",                      poolCoef:0.60, normMult:1.80, rate:28, color:"#9CA3AF"},
  {id:"apprentice",label:"Apprentice",       desc:">6 months, basic skills, minimum competency achieved",        poolCoef:0.85, normMult:1.40, rate:35, color:"#0369A1"},
  {id:"installer", label:"Installer",        desc:"Full installation start-to-finish. No stairs. Slower than best norm.", poolCoef:1.00, normMult:1.10, rate:40, color:"#166534"},
  {id:"senior",    label:"Senior Installer", desc:"All positions, stairs, best norm quality",                    poolCoef:1.25, normMult:1.00, rate:50, color:"#7C3AED"},
  {id:"project",   label:"Project Manager",  desc:"Organises processes, materials, consumables, site control. Up to 3 sites simultaneously.", poolCoef:1.50, normMult:1.00, rate:80, color:"#B8860B", kpi:true},
];

// ── DEFAULT TIERS ────────────────────────────────────────────
const DEFAULT_TIERS = [
  {id:"A", label:"Tier A — Standard",  margin:35, note:"Standard residential project"},
  {id:"B", label:"Tier B — Complex",   margin:45, note:"Difficult access, complex layout"},
  {id:"C", label:"Tier C — Premium",   margin:60, note:"Urgent, premium, or specialty"},
];

// ── DEFAULT SETTINGS ─────────────────────────────────────────
const DEF_SETTINGS = {
  norms: DEFAULT_NORMS,
  staffRoles: DEFAULT_STAFF_ROLES,
  tiers: DEFAULT_TIERS,
  activeTier: "A",
  poolPct: 60,
  acclimSurcharge: 25,
  greenMult:1.0, yellowMult:0.85, redMult:0.70,
  salesVis: {delivery:true,removal:true,protection:true,furniture:true,finishing:true,cleanup:true},
  workerVis: {taskList:true,consumables:true,scenarios:true,jobNorm:true,tips:true},
  fieldConfig: {},
};

const DEF_JOB = {
  sqm:"",floorType:"hybrid",pattern:"straight",complexity:"std",underlay:"none",
  deliveryOn:false,delivSeparate:false,delivOrganizer:"brigade",floor:"1",hasLift:true,hasParking:true,
  removals:[],rubbish:false,
  protectCarpet:false,protectDust:false,
  furnitureSituation:"empty",furnitureAssembly:false,furnitureFragile:false,
  doorWood:0,doorMetal:0,stepsStr:0,stepsSpi:0,trimLm:"",scotiaLm:"",skirtingType:"none",skirtingLm:"",
  cleanup:true,workers:2,
  clientName:"",clientEmail:"",clientPhone:"",clientAddress:"",preferredDate:"",notes:"",
  taskTimeOverrides:{},
  crewComposition:{beginner:0,apprentice:1,installer:1,senior:0,project:1},
  adminPriceOverride:"",
};

// ── HELPERS ───────────────────────────────────────────────────
const fm=(n,d=0)=>(isNaN(n)||n==null)?"—":n.toLocaleString("en-AU",{minimumFractionDigits:d,maximumFractionDigits:d});
const fd=(n,d=0)=>`$${fm(n,d)}`;
const fh=(m)=>{const h=Math.floor(m/60),mn=Math.round(m%60);return h&&mn?`${h}h ${mn}m`:h?`${h}h`:`${mn}m`;};
const pn=v=>Math.max(0,parseFloat(v)||0);
const pi=v=>Math.max(0,parseInt(v)||0);
const gn=(id,norms)=>{const n=norms.find(x=>x.id===id);return n?n.norm:0;};

// ── CALCULATION ENGINE ────────────────────────────────────────
function calcJob(job,S,timeOverrides={}) {
  const sqm=pn(job.sqm),ft=FLOOR[job.floorType];
  const ul=UNDERLAY[job.underlay];
  const pMul=PATTERN[job.pattern].mult,cMul=COMPLEX[job.complexity].mult;
  const wc=Math.max(1,pi(job.workers)||2);
  const activeTier=S.tiers.find(t=>t.id===S.activeTier)||S.tiers[0];
  const mg=activeTier.margin/100;
  const norms=S.norms;
  const tasks=[],cons=[];

  const add=(id,name,role,minBase,qty=1)=>{
    const total=Math.max(0,(timeOverrides[id]!==undefined?pn(timeOverrides[id]):minBase)*qty);
    const rate=(S.staffRoles.find(r=>r.id===role)||{rate:40}).rate;
    const cost=total/60*rate;
    tasks.push({id,name,role,minBase,qty,total,cost});
  };
  const addC=(name,qty,ce)=>cons.push({name,qty,cost:qty*ce});

  // Always
  add("tool_load","Tool load/unload + setup","helper",gn("tool_load",norms));
  add("tea_break",`Tea breaks 2×15min × ${wc} workers (paid)`,"helper",gn("tea_break",norms)*wc);
  add("client_brief","Client briefing + site walkthrough","project",gn("cli_brief",norms));

  // Delivery
  let surchPct=0;
  if(job.deliveryOn){
    const fl=pi(job.floor)||1,stEx=!job.hasLift?fl*10:0,pk=job.hasParking?0:15;
    add("del_load","Delivery: warehouse loading","driver",25);
    add("del_drive","Delivery: drive to site","driver",25);
    add("del_unload",`Delivery: unload${!job.hasLift?` (stairs fl.${fl})`:""}`, "helper",(job.hasLift?35:55+stEx+pk)*wc);
    if(ft.acclim&&job.delivSeparate){add("del_acclim","Acclimation: PM separate half-day","project",225);surchPct=pn(S.acclimSurcharge)||25;}
    addC("Delivery packaging/straps",2,5);
  }

  // Multi-removal
  job.removals.forEach(r=>{
    const ro=REMOVAL_OPTS[r.type];if(!ro)return;
    const rSqm=pn(r.sqm)||sqm;
    const rNorm=gn(ro.normId,norms);
    add(`removal_${r.type}`,`Removal: ${ro.label}`,"helper",rNorm*rSqm);
    if(r.smoothedges&&pn(r.smoothLm)>0){
      const sn=r.smoothMethod==="perf"?gn("smooth_prf",norms):gn("smooth_man",norms);
      add(`smooth_${r.type}`,`Smoothedges removal — ${ro.label}`,"helper",sn*pn(r.smoothLm));
    }
    if(ro.tileType){addC("Reinforced bags for tile waste (×20)",20,2);addC("Skip bin surcharge",1,150);}
    else addC("Cable tape for carpet/laminate rolls (×2)",2,8);
  });
  if(job.rubbish&&job.removals.length>0){
    const hasTile=job.removals.some(r=>REMOVAL_OPTS[r.type]?.tileType);
    const fl=pi(job.floor)||1,stEx=!job.hasLift?fl*12:0,tEx=hasTile?35:0;
    add("rubbish",`Rubbish to tip (${hasTile?"tile/heavy":"standard"})`,"helper",90+stEx+tEx);
  }

  // Underlay
  if(job.underlay!=="none"&&ul.norm>0&&sqm>0)add("underlay",`Underlay: ${ul.label}`,"helper",gn("underlay",norms)*sqm);

  // Furniture multiplier
  const fMult={empty:1.0,light:1.5,heavy:2.5}[job.furnitureSituation||"empty"];
  if(job.furnitureSituation==="light")add("furniture_mv","Furniture move & return (≤10 items)","helper",60*wc);
  if(job.furnitureSituation==="heavy")add("furniture_mv","Furniture move & return (all rooms, >10 items)","helper",120*wc);
  if(job.furnitureAssembly){
    const r=(S.staffRoles.find(x=>x.id==="installer")||{rate:40}).rate;
    tasks.push({id:"furn_asm",name:"Furniture assembly/disassembly",role:"installer",minBase:150/(r/60),qty:1,total:150/(r/60),cost:150});
  }

  // Installation
  const iNormBase=gn(ft.normId,norms);
  const iNorm=iNormBase*pMul*cMul*(job.furnitureSituation!=="empty"?fMult:1.0);
  if(sqm>0)add("install",`${ft.label} (${iNorm.toFixed(1)} min/m²)`,"installer",iNorm*sqm);

  // Protection (note only — no labour cost if skipped)
  if(job.protectCarpet)add("protect_carpet","Carpet protection film (common areas)","helper",15);
  if(job.protectDust)add("protect_dust","Dust protection film (furniture + kitchen)","helper",20);

  // Stairs
  if(pi(job.stepsStr)>0)add("step_str",`Stairs straight (${job.stepsStr} steps)`,"senior",gn("step_str",norms)*pi(job.stepsStr));
  if(pi(job.stepsSpi)>0)add("step_spi",`Stairs spiral (${job.stepsSpi} steps)`,"senior",gn("step_spi",norms)*pi(job.stepsSpi));

  // Door frames
  const dW=pi(job.doorWood),dM=pi(job.doorMetal);
  if(dW>0){add("door_wood",`Timber frames (${dW} doors × 2)`,"installer",gn("door_wood",norms)*dW);addC(`Multitool blades (${Math.ceil(dW/2)})`,Math.ceil(dW/2),8);}
  if(dM>0){add("door_metal",`Metal frames (${dM} doors × 2)`,"installer",gn("door_metal",norms)*dM);addC("Metal frame filler+primer",1,18);}

  // Trim/Scotia/Skirting
  const trimLm=pn(job.trimLm),scLm=pn(job.scotiaLm);
  if(trimLm>0){add("trim",`Trim installation (${trimLm}lm)`,"installer",gn("trim",norms)*trimLm);addC(`Sikabond (${Math.ceil(trimLm/10)} tubes)`,Math.ceil(trimLm/10),12);}
  if(scLm>0)add("scotia",`Scotia installation (${scLm}lm)`,"helper",gn("scotia",norms)*scLm);
  if(job.skirtingType!=="none"&&pn(job.skirtingLm)>0){
    const nId=job.skirtingType==="new"?"skirt_new":"skirt_re";
    add("skirting",`Skirting ${job.skirtingType==="new"?"new":"reinstall"} (${job.skirtingLm}lm)`,"installer",gn(nId,norms)*pn(job.skirtingLm));
    addC("Skirting fixings set",1,15);
  }

  // Cleanup
  if(job.cleanup&&sqm>0)add("cleanup","Final cleanup (basic debris removal)","apprentice",gn("cleanup",norms)*sqm+15);

  // PM oversight
  const tmpMin=tasks.reduce((a,t)=>a+t.total,0);
  const days=Math.ceil(tmpMin/(420*wc));
  if(days>0)add("pm_daily",`PM oversight (${days} day${days>1?"s":""})`,"project",gn("pm_daily",norms)*days);

  // Totals
  const totalMin=tasks.reduce((a,t)=>a+t.total,0);
  const labCst=tasks.reduce((a,t)=>a+t.cost,0);
  const conCst=cons.reduce((a,c)=>a+c.cost,0);
  const totCst=labCst+conCst;
  const basePrice=totCst/(1-mg);
  const aFee=surchPct>0?basePrice*(surchPct/100):0;
  const price=basePrice+aFee;
  const adminPrice=pn(job.adminPriceOverride)||price;
  const pool=adminPrice*(S.poolPct/100);
  const hPerW=totalMin/60/wc;
  const minPerM2=sqm>0?totalMin/sqm:0;

  const scenarios=[
    {key:"green", label:"🟢 GREEN",  pace:"On target",      mult:S.greenMult,  color:C.greenL,bg:C.greenBg,bd:C.greenBd, tMul:1.0},
    {key:"yellow",label:"🟡 YELLOW", pace:"+25% overtime",  mult:S.yellowMult, color:C.amberL,bg:C.amberBg,bd:C.amberBd, tMul:1.25},
    {key:"red",   label:"🔴 RED",    pace:">+25% over",     mult:S.redMult,    color:C.redL,  bg:C.redBg,  bd:C.redBd,   tMul:1.6},
  ].map(sc=>({...sc,poolAmt:pool*sc.mult,hrPerW:hPerW*sc.tMul}));

  return{tasks,cons,totalMin,labCst,conCst,totCst,price,adminPrice,basePrice,aFee,mg,
    priceA:totCst/(1-0.35),priceB:totCst/(1-0.45),priceC:totCst/(1-0.60),
    pool,days,hPerW,wc,sqm,iNorm,scenarios,pricePerM2:sqm>0?price/sqm:0,minPerM2,
    activeTier,
  };
}

// Pool distribution by crew composition
function calcPoolDistribution(pool,crewComp,staffRoles,scenarios){
  const entries=Object.entries(crewComp).filter(([,n])=>n>0);
  const totalWeight=entries.reduce((s,[id,n])=>{
    const r=staffRoles.find(x=>x.id===id);return s+(r?r.poolCoef*n:0);
  },0);
  if(!totalWeight||!pool)return[];
  return scenarios.map(sc=>({
    ...sc,
    perRole:entries.map(([id,count])=>{
      const r=staffRoles.find(x=>x.id===id)||{label:id,poolCoef:1,rate:40,color:C.txtL};
      const share=(r.poolCoef/totalWeight)*sc.poolAmt;
      const perPerson=share/count;
      return{id,label:r.label,color:r.color,count,poolCoef:r.poolCoef,share,perPerson};
    }),
  }));
}

// ── UI PRIMITIVES ─────────────────────────────────────────────
const St={
  card:{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"18px 22px",marginBottom:14,boxShadow:C.sh},
  lbl:{fontSize:11,fontWeight:700,color:C.txtL,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:5,display:"block"},
  inp:{background:"#FAFBFD",border:`1.5px solid ${C.border}`,borderRadius:7,color:C.txt,padding:"9px 13px",fontSize:14,width:"100%",outline:"none",fontFamily:"inherit",boxSizing:"border-box"},
  sec:{fontSize:11,fontWeight:800,color:C.navyD,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:14,paddingBottom:9,borderBottom:`2px solid ${C.goldV}50`,display:"flex",alignItems:"center",gap:8},
  chip:(on,col=C.navy)=>({padding:"7px 13px",borderRadius:7,border:`1.5px solid ${on?col:C.border}`,background:on?col+"14":"transparent",color:on?col:C.txtL,cursor:"pointer",fontSize:12,fontWeight:on?700:400,transition:"all .12s",userSelect:"none",whiteSpace:"nowrap"}),
  btn:(bg=C.navy,fg="#FFF")=>({padding:"10px 22px",borderRadius:8,border:"none",background:bg,color:fg,cursor:"pointer",fontSize:14,fontWeight:600,fontFamily:"inherit",display:"inline-flex",alignItems:"center",gap:8,transition:"all .13s"}),
  badge:(col)=>({display:"inline-block",padding:"2px 7px",borderRadius:999,fontSize:10,fontWeight:700,background:col+"20",color:col}),
};

function Ck({label,sub,on,onChange,icon,disabled,warn}){
  return(
    <div onClick={()=>!disabled&&onChange(!on)} style={{display:"flex",alignItems:"flex-start",gap:10,cursor:disabled?"not-allowed":"pointer",padding:"9px 12px",borderRadius:8,border:`1.5px solid ${warn?C.amberL:on?C.navyL:C.border}`,background:warn?C.amberBg:on?C.blueBg:"transparent",transition:"all .13s",opacity:disabled?0.4:1,userSelect:"none",marginBottom:6}}>
      <div style={{width:18,height:18,borderRadius:4,border:`2px solid ${on?C.navy:C.borderD}`,background:on?C.navy:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
        {on&&<span style={{color:"#fff",fontSize:11,fontWeight:900}}>✓</span>}
      </div>
      <div><div style={{fontSize:13,color:on?C.navy:C.txt,fontWeight:on?600:400,lineHeight:1.3}}>{icon&&<span style={{marginRight:5}}>{icon}</span>}{label}</div>
      {sub&&<div style={{fontSize:11,color:warn?C.amberL:C.txtL,marginTop:2,lineHeight:1.4}}>{sub}</div>}</div>
    </div>
  );
}
function NI({label,val,set,sfx,min=0,step=1,note,small}){
  return(<div>{label&&<label style={St.lbl}>{label}</label>}<div style={{position:"relative"}}><input type="number" min={min} step={step} value={val} placeholder="0" onChange={e=>set(e.target.value)} style={{...St.inp,paddingRight:sfx?38:13,fontSize:small?12:14,padding:small?"6px 10px":"9px 13px",paddingRight:sfx?38:13}}/>{sfx&&<span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",fontSize:11,color:C.txtL,pointerEvents:"none"}}>{sfx}</span>}</div>{note&&<div style={{fontSize:10,color:C.txtL,marginTop:3,lineHeight:1.35}}>{note}</div>}</div>);
}
function SI({label,val,set,opts,note}){
  return(<div>{label&&<label style={St.lbl}>{label}</label>}<select value={val} onChange={e=>set(e.target.value)} style={{...St.inp,cursor:"pointer"}}>{opts.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select>{note&&<div style={{fontSize:10,color:C.txtL,marginTop:3}}>{note}</div>}</div>);
}
function Chips({label,items,val,set,col}){return(<div style={{marginBottom:10}}>{label&&<label style={St.lbl}>{label}</label>}<div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{items.map(([k,l])=><span key={k} onClick={()=>set(k)} style={St.chip(val===k,col||C.navy)}>{l}</span>)}</div></div>);}
function Gr({children,cols,gap=10,mb=10}){const n=cols||(Array.isArray(children)?children.filter(Boolean).length:1);return <div style={{display:"grid",gridTemplateColumns:`repeat(${n},1fr)`,gap,marginBottom:mb}}>{children}</div>;}
function Alrt({col,icon,children}){const bgs={[C.amberL]:C.amberBg,[C.redL]:C.redBg,[C.greenL]:C.greenBg};return(<div style={{padding:"9px 13px",borderRadius:8,background:bgs[col]||C.blueBg,border:`1px solid ${col}40`,fontSize:12,color:C.txt,marginBottom:8,lineHeight:1.5}}>{icon&&<span style={{marginRight:6}}>{icon}</span>}{children}</div>);}
function SH({icon,children,action}){return <div style={St.sec}><span style={{fontSize:15}}>{icon}</span><span style={{flex:1}}>{children}</span>{action}</div>;}
function Div(){return <div style={{borderTop:`1px solid ${C.border}`,margin:"10px 0"}}/>;}

// Print button used on every page
function PrintBtn({onClick}){
  return <button onClick={onClick} title="Print this page" style={{padding:"5px 10px",borderRadius:6,border:`1px solid ${C.border}`,background:C.card,cursor:"pointer",fontSize:11,color:C.txtL,display:"inline-flex",alignItems:"center",gap:5,fontFamily:"inherit"}}>🖨️ Print</button>;
}

// ═══════════════════════════════════════════════════════════════
// FORM SECTIONS
// ═══════════════════════════════════════════════════════════════

function SecFloor({j,s}){
  const ft=FLOOR[j.floorType];
  useEffect(()=>s("underlay")(FLOOR[j.floorType].ulDef),[j.floorType]);
  return(<div style={St.card}>
    <SH icon="🪵">Floor Type & Method</SH>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
      {Object.entries(FLOOR).map(([k,v])=>(
        <div key={k} onClick={()=>s("floorType")(k)} style={{...St.chip(j.floorType===k),display:"flex",gap:10,alignItems:"flex-start",padding:"11px 13px",height:"auto",borderRadius:8}}>
          <div style={{...St.badge(j.floorType===k?C.navy:C.txtL),marginTop:2,flexShrink:0}}>{v.tag}</div>
          <div><div style={{fontSize:12,fontWeight:600}}>{v.label}</div><div style={{fontSize:10,opacity:.65,marginTop:1}}>{v.sub}</div></div>
        </div>))}
    </div>
    {ft.acclim&&<Alrt col={C.amberL} icon="⏱"><strong>Acclimation required:</strong> {ft.label} must sit on-site 24–48h before installation per manufacturer specification.</Alrt>}
    <Gr cols={2}>
      <Chips label="Pattern" items={Object.entries(PATTERN).map(([k,v])=>[k,v.label])} val={j.pattern} set={s("pattern")}/>
      <Chips label="Complexity" items={Object.entries(COMPLEX).map(([k,v])=>[k,v.label])} val={j.complexity} set={s("complexity")} col={C.navyL}/>
    </Gr>
    {j.complexity!=="open"&&<div style={{fontSize:11,color:C.txtL,background:C.bg,padding:"6px 11px",borderRadius:6,marginTop:4}}>{COMPLEX[j.complexity].sub}</div>}
  </div>);
}

function SecSize({j,s}){
  return(<div style={St.card}><SH icon="📐">Job Size & Team</SH>
    <Gr cols={2}>
      <NI label="Total floor area" val={j.sqm} set={s("sqm")} sfx="m²" step={0.5}/>
      <div><label style={St.lbl}>Perimeter hint (auto)</label>
        <div style={{...St.inp,color:C.txtL,cursor:"default",display:"flex",alignItems:"center"}}>{pn(j.sqm)?`≈ ${Math.round(pn(j.sqm))} lm`:"-"}</div></div>
    </Gr>
    <Gr cols={2}>
      <NI label="Workers on job" val={j.workers} set={v=>s("workers")(Math.max(1,Math.min(4,parseInt(v)||2)))} sfx="people" min={1}/>
      <SI label="Underlay type" val={j.underlay} set={s("underlay")} opts={Object.entries(UNDERLAY).map(([k,v])=>[k,v.label])} note="Auto-set from floor type — override here"/>
    </Gr>
  </div>);
}

function SecDelivery({j,s,settings}){
  const ft=FLOOR[j.floorType],sp=pn(settings.acclimSurcharge)||25;
  return(<div style={St.card}><SH icon="🚐">Material Delivery</SH>
    <Ck label="Include material delivery in this quote" icon="🚚" sub="Warehouse → site delivery" on={j.deliveryOn} onChange={v=>s("deliveryOn")(v)}/>
    {j.deliveryOn&&(<>
      <Gr cols={2} mb={8}>
        <Chips label="Building access" items={[["true","🛗 Lift"],["false","🪜 Stairs only"]]} val={String(j.hasLift)} set={v=>s("hasLift")(v==="true")} col={C.navyL}/>
        {!j.hasLift&&<NI label="Floor level" val={j.floor} set={s("floor")} min={1} sfx="fl."/>}
      </Gr>
      <Ck label="Parking available" icon="🅿️" on={j.hasParking} onChange={v=>s("hasParking")(v)}/>
      <SI label="Who organises delivery?" val={j.delivOrganizer} set={s("delivOrganizer")}
        opts={[["brigade","Our brigade organises"],["sales","Client / salesperson organises"]]}/>
      {ft.acclim&&(<>
        <Alrt col={C.amberL} icon="📅"><strong>{ft.label}:</strong> 24–48h on-site acclimation required before installation.</Alrt>
        <Ck label="Deliver 24–48h early — separate acclimation trip" sub={`+PM half-day + ${sp}% acclimation surcharge on total`} icon="📦" on={j.delivSeparate} onChange={v=>s("delivSeparate")(v)}/>
        {j.delivSeparate&&<Alrt col={C.redL} icon="💲"><strong>Acclimation surcharge +{sp}%</strong> will be added to the project total.</Alrt>}
      </>)}
    </>)}
  </div>);
}

// ── MULTI-REMOVAL ─────────────────────────────────────────────
function SecRemoval({j,s}){
  const toggleType=(type)=>{
    const existing=j.removals.find(r=>r.type===type);
    if(existing) s("removals")(j.removals.filter(r=>r.type!==type));
    else s("removals")([...j.removals,{type,sqm:j.sqm,smoothedges:false,smoothLm:"",smoothMethod:"manual"}]);
  };
  const updateR=(type,field,val)=>s("removals")(j.removals.map(r=>r.type===type?{...r,[field]:val}:r));
  const hasAny=j.removals.length>0;
  const hasTile=j.removals.some(r=>REMOVAL_OPTS[r.type]?.tileType);
  return(<div style={St.card}><SH icon="🧹">Floor Removal & Prep</SH>
    <div style={{fontSize:11,color:C.txtL,marginBottom:10}}>Select all floor types that need to be removed on this job. Each type gets its own area field.</div>
    {Object.entries(REMOVAL_OPTS).map(([k,v])=>{
      const sel=j.removals.find(r=>r.type===k);
      return(<div key={k} style={{marginBottom:8}}>
        <Ck label={v.label} icon={v.tileType?"🪨":"🏠"} on={!!sel} onChange={()=>toggleType(k)}
          sub={v.tileType?"Heavy waste — premium tip charges apply":undefined}/>
        {sel&&(<div style={{marginLeft:28,padding:"8px 12px",background:C.bg,borderRadius:8,marginBottom:4}}>
          <Gr cols={2}>
            <NI label="Area to remove" val={sel.sqm} set={v=>updateR(k,"sqm",v)} sfx="m²" note="Leave blank = use install area"/>
            <div>
              <Ck label="Smoothedges / nail strips" on={sel.smoothedges} onChange={v=>updateR(k,"smoothedges",v)}/>
              {sel.smoothedges&&(<>
                <NI label="Length" val={sel.smoothLm} set={v=>updateR(k,"smoothLm",v)} sfx="lm" small/>
                <Chips label="" items={[["manual","🔨 Manual (3 min/lm)"],["perf","⚡ Perforator (0.9 min/lm)"]]} val={sel.smoothMethod} set={v=>updateR(k,"smoothMethod",v)}/>
              </>)}
            </div>
          </Gr>
        </div>)}
      </div>);
    })}
    {hasAny&&(<>
      <Div/>
      <Ck label="Rubbish removal to tip" icon="🚛" sub={hasTile?"Heavy tile waste — premium tip rate":"Standard rubbish removal"} on={j.rubbish} onChange={v=>s("rubbish")(v)}/>
      {!j.rubbish&&hasAny&&<Alrt col={C.amberL} icon="📦">Waste will be left at the client's premises in the work area. Bagging into sacks and carrying to the parking is NOT included in this scope. Client is responsible for final rubbish removal.</Alrt>}
    </>)}
  </div>);
}

// ── PROTECTION ────────────────────────────────────────────────
function SecProtection({j,s}){
  return(<div style={St.card}><SH icon="🛡️">Protection</SH>
    <Ck label="Carpet protection film — common area (lift to apartment door)" icon="🎞️"
      on={j.protectCarpet} onChange={v=>s("protectCarpet")(v)}
      sub="If not selected: client is responsible for any damage to common area carpet during works"/>
    {!j.protectCarpet&&<Alrt col={C.amberL} icon="⚠️">No carpet protection film selected. Client accepts full responsibility for any damage to common area surfaces during material transport and works.</Alrt>}
    <Ck label="Dust protection film — furniture & kitchen cabinets" icon="🏠"
      on={j.protectDust} onChange={v=>s("protectDust")(v)}
      sub="If not selected: dust complaints will not be accepted"/>
    {!j.protectDust&&<Alrt col={C.amberL} icon="💨">No dust protection selected. Client acknowledges that renovation work produces dust and waives the right to claim against GATS Development for dust on furniture or kitchen surfaces.</Alrt>}
  </div>);
}

// ── FURNITURE ─────────────────────────────────────────────────
function SecFurniture({j,s}){
  const FURN_SITUATIONS=[
    {id:"empty", label:"Empty / Client moves", sub:"No furniture or client moves without crew delays", mult:"×1.0",col:C.greenL},
    {id:"light", label:"Light (≤10 items)",    sub:"Move and return up to 10 items during works",      mult:"×1.5",col:C.amberL},
    {id:"heavy", label:"Heavy (all rooms, >10)",sub:"Move and return furniture in all rooms",          mult:"×2.5",col:C.redL},
  ];
  return(<div style={St.card}><SH icon="🪑">Furniture & Appliances</SH>
    <div style={{fontSize:11,color:C.txtL,marginBottom:10}}>Furniture situation affects installation time. ⚠️ We do NOT move furniture between floors.</div>
    <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
      {FURN_SITUATIONS.map(f=>(
        <div key={f.id} onClick={()=>s("furnitureSituation")(f.id)}
          style={{...St.chip(j.furnitureSituation===f.id,f.col),padding:"10px 14px",flex:1,minWidth:130,borderRadius:9,display:"flex",flexDirection:"column",gap:3}}>
          <div style={{fontWeight:700,fontSize:13}}>{f.label}</div>
          <div style={{fontSize:10,opacity:.7,lineHeight:1.3}}>{f.sub}</div>
          <div style={{fontSize:14,fontWeight:900,marginTop:3,color:j.furnitureSituation===f.id?f.col:C.txtL}}>{f.mult}</div>
        </div>))}
    </div>
    <Ck label="Assembly / disassembly required" icon="🔧" sub="+$150 AUD fixed charge"
      on={j.furnitureAssembly} onChange={v=>s("furnitureAssembly")(v)}/>
    <Ck label="Fragile / antique / stone top / aquarium present" icon="⚠️"
      sub="Requires special quote — standard service does not cover these items"
      on={j.furnitureFragile} onChange={v=>s("furnitureFragile")(v)} warn={j.furnitureFragile}/>
    {j.furnitureFragile&&<Alrt col={C.redL} icon="🚫">Special items identified. Standard quote does NOT cover moving fragile, antique, stone-top, or aquarium items. A separate specialist quote is required. The client must arrange alternative handling or confirm exclusion in writing.</Alrt>}
    <Ck label="Move dishwasher" icon="🍽️"
      sub="⚠️ Must be disconnected by licensed plumber BEFORE works and reconnected AFTER. GATS does not disconnect or reconnect plumbing."
      on={j.moveDishwasher||false} onChange={v=>s("moveDishwasher")(v)}/>
    {j.moveDishwasher&&<Alrt col={C.amberL} icon="🔧">Client must arrange a licensed plumber to disconnect the dishwasher before works start and reconnect it after completion. Works cannot proceed until confirmed disconnected.</Alrt>}
  </div>);
}

function SecFinishing({j,s}){
  return(<div style={St.card}><SH icon="📐">Finishing Works</SH>
    <label style={St.lbl}>Door Frames</label>
    <Gr cols={2} mb={8}>
      <NI label="Timber frames" val={j.doorWood} set={v=>s("doorWood")(Math.max(0,parseInt(v)||0))} sfx="doors" note="1 door = 2 frames · multitool undercut"/>
      <NI label="Metal / steel frames" val={j.doorMetal} set={v=>s("doorMetal")(Math.max(0,parseInt(v)||0))} sfx="doors" note="1 door = 2 frames · filler+primer"/>
    </Gr>
    <Div/>
    <label style={St.lbl}>Stairs (additional to floor area)</label>
    <Gr cols={2} mb={8}>
      <NI label="Straight steps" val={j.stepsStr} set={v=>s("stepsStr")(Math.max(0,parseInt(v)||0))} sfx="steps"/>
      <NI label="Spiral / winding steps" val={j.stepsSpi} set={v=>s("stepsSpi")(Math.max(0,parseInt(v)||0))} sfx="steps"/>
    </Gr>
    <Div/>
    <NI label="Trim installation (entry door, balcony, bathroom, sliding)" val={j.trimLm} set={s("trimLm")} sfx="lm"/>
    <div style={{marginTop:8}}><NI label="Scotia installation" val={j.scotiaLm} set={s("scotiaLm")} sfx="lm" note="Incl. returns & angles"/></div>
    <div style={{marginTop:8}}>
      <Chips label="Skirting boards" items={[["none","No skirting"],["new","Cut & install new"],["re","Take up & reinstall"]]} val={j.skirtingType} set={s("skirtingType")} col={C.navyL}/>
      {j.skirtingType!=="none"&&<NI label="Skirting length" val={j.skirtingLm} set={s("skirtingLm")} sfx="lm"/>}
    </div>
  </div>);
}

function SecCleanup({j,s}){
  return(<div style={St.card}><SH icon="🗑️">Cleanup & Handover</SH>
    <Ck label="Final cleanup — basic debris removal" icon="🧹"
      sub="Sweeping, vacuuming, and removal of construction debris. NOT professional cleaning."
      on={j.cleanup} onChange={v=>s("cleanup")(v)}/>
    {j.cleanup&&<div style={{fontSize:11,color:C.txtL,padding:"6px 10px",background:C.bg,borderRadius:6,marginTop:4}}>Includes: sweep all surfaces, vacuum floor, collect and remove work debris. Does NOT include: mopping, window cleaning, appliance cleaning, or post-renovation deep clean.</div>}
  </div>);
}

function JobForm({j,s,mode,settings}){
  const sv=settings.salesVis||{};
  const show=k=>mode==="admin"||(mode==="worker")||sv[k]!==false;
  return(<>
    <SecFloor j={j} s={s}/>
    <SecSize j={j} s={s}/>
    {show("delivery")&&<SecDelivery j={j} s={s} settings={settings}/>}
    {show("removal")&&<SecRemoval j={j} s={s}/>}
    {show("protection")&&<SecProtection j={j} s={s}/>}
    {show("furniture")&&<SecFurniture j={j} s={s}/>}
    {show("finishing")&&<SecFinishing j={j} s={s}/>}
    {show("cleanup")&&<SecCleanup j={j} s={s}/>}
  </>);
}

// ═══════════════════════════════════════════════════════════════
// ADMIN BREAKDOWN PANEL
// ═══════════════════════════════════════════════════════════════
function AdminBreakdown({c,job,s,settings,setSettings}){
  const [exp,setExp]=useState(true);
  const tiers=settings.tiers||DEFAULT_TIERS;

  if(!c.sqm)return(<div style={{...St.card,textAlign:"center",padding:"40px",color:C.txtL}}><div style={{fontSize:28,marginBottom:8}}>🔍</div>Fill in job details to see cost breakdown</div>);

  const applyTier=(tier)=>{
    setSettings(p=>({...p,activeTier:tier.id}));
  };

  return(<>
    {/* KPI row */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
      {[
        ["Labour + Materials",fd(c.totCst),C.redL],
        ["Quote Price",fd(c.adminPrice),C.navy],
        ["Margin",fd(c.adminPrice-c.totCst)+" ("+Math.round((c.adminPrice-c.totCst)/c.adminPrice*100)+"%)",C.greenL],
        ["Brigade Pool",fd(c.pool),"#7C3AED"],
      ].map(([l,v,col])=>(
        <div key={l} style={{background:C.bg,borderRadius:9,padding:"10px 14px",border:`1px solid ${C.border}`}}>
          <div style={{fontSize:9,color:C.txtL,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:2}}>{l}</div>
          <div style={{fontFamily:"monospace",fontWeight:900,fontSize:17,color:col}}>{v}</div>
        </div>))}
    </div>

    {/* Tier selector — clickable to apply */}
    <div style={St.card}>
      <SH icon="💲">Pricing Tiers — Click to Apply</SH>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:10}}>
        {tiers.map(tier=>{
          const p=c.totCst/(1-tier.margin/100),active=settings.activeTier===tier.id;
          return(
            <div key={tier.id} onClick={()=>applyTier(tier)}
              style={{border:`2px solid ${active?C.navy:C.border}`,borderRadius:9,padding:"10px 12px",background:active?C.navy:"transparent",cursor:"pointer",transition:"all .15s",textAlign:"center"}}>
              <div style={{fontSize:11,fontWeight:700,color:active?"#fff":C.navy,marginBottom:2}}>{tier.id}</div>
              <div style={{fontFamily:"monospace",fontWeight:900,fontSize:16,color:active?C.goldV:C.navy}}>{fd(p)}</div>
              <div style={{fontSize:9,color:active?C.goldV+"aa":C.txtL,marginTop:2}}>{tier.margin}% margin</div>
            </div>);
        })}
      </div>
      <div style={{fontSize:11,color:C.txtL,marginBottom:8}}>Active tier: <strong style={{color:C.navy}}>{c.activeTier?.label}</strong></div>

      {/* Admin price override */}
      <div>
        <label style={St.lbl}>Admin Quote Override Price (optional)</label>
        <input type="number" value={job.adminPriceOverride} placeholder={`Calculated: ${fd(c.basePrice)}`}
          onChange={e=>s("adminPriceOverride")(e.target.value)}
          style={{...St.inp,borderColor:job.adminPriceOverride?C.amberL:C.border}}/>
        <div style={{fontSize:10,color:C.txtL,marginTop:3}}>If set, this price overrides the calculated quote for pool/margin display. Salesperson may quote a different amount.</div>
        {job.adminPriceOverride&&<div style={{marginTop:4,padding:"6px 10px",background:C.amberBg,borderRadius:6,fontSize:11,color:C.amberL}}>⚡ Price override active: {fd(pn(job.adminPriceOverride))} (calculated base: {fd(c.basePrice)})</div>}
      </div>
    </div>

    {/* Time metrics */}
    <div style={{...St.card,padding:"12px 16px",marginBottom:14}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",textAlign:"center",gap:4}}>
        {[
          ["Person-hours",fh(c.totalMin)],
          ["Workers",`${c.wc} people`],
          ["Est. days",`${c.days}d`],
          ["Min / m²",c.sqm?`${c.minPerM2.toFixed(1)} min/m²`:"—"],
        ].map(([l,v])=>(<div key={l}><div style={{fontSize:9,color:C.txtL,marginBottom:2}}>{l}</div><div style={{fontSize:13,fontWeight:700,color:C.navy}}>{v}</div></div>))}
      </div>
      {c.sqm>0&&<div style={{marginTop:8,padding:"6px 10px",background:C.bg,borderRadius:6,fontSize:11,color:C.txtL,textAlign:"center"}}>Total job: <strong>{c.minPerM2.toFixed(1)} min/m²</strong> (all tasks combined, {c.wc} workers)</div>}
    </div>

    {/* Task table */}
    <div style={St.card}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <SH icon="📋">Task Breakdown</SH>
        <button onClick={()=>setExp(p=>!p)} style={{fontSize:11,color:C.navyL,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit"}}>{exp?"▲":"▼"} ({c.tasks.length})</button>
      </div>
      {exp&&<div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
          <thead><tr style={{background:C.navy,color:"#fff"}}>{["Task","Role","Time","Labour $","Client $","Margin $"].map(h=><th key={h} style={{padding:"6px 8px",textAlign:h==="Task"?"left":"right",fontSize:10,fontWeight:600}}>{h}</th>)}</tr></thead>
          <tbody>
            {c.tasks.map((t,i)=>{const cp=t.cost/(1-c.mg),ma=cp-t.cost;return(
              <tr key={t.id} style={{background:i%2===0?C.bg:C.card}}>
                <td style={{padding:"6px 8px",color:C.txt,maxWidth:220,fontSize:11}}>{t.name}</td>
                <td style={{padding:"6px 8px",textAlign:"right"}}><span style={St.badge(ROLES_META[t.role]?.color||C.txtL)}>{ROLES_META[t.role]?.abbr||t.role}</span></td>
                <td style={{padding:"6px 8px",textAlign:"right",fontFamily:"monospace"}}>{fh(t.total)}</td>
                <td style={{padding:"6px 8px",textAlign:"right",fontFamily:"monospace",color:C.redL}}>{fd(t.cost,0)}</td>
                <td style={{padding:"6px 8px",textAlign:"right",fontFamily:"monospace",color:C.navy,fontWeight:600}}>{fd(cp,0)}</td>
                <td style={{padding:"6px 8px",textAlign:"right",fontFamily:"monospace",color:C.greenL}}>{fd(ma,0)}</td>
              </tr>);})}
            {c.cons.map((t,i)=>(
              <tr key={"c"+i} style={{background:"#FFFBEB"}}>
                <td style={{padding:"6px 8px",color:C.txtM,fontStyle:"italic",fontSize:11}}>📦 {t.name}</td>
                <td style={{padding:"6px 8px",textAlign:"right"}}><span style={St.badge(C.amberL)}>MAT</span></td>
                <td style={{padding:"6px 8px",textAlign:"right"}}>—</td>
                <td style={{padding:"6px 8px",textAlign:"right",fontFamily:"monospace",color:C.amberL}}>{fd(t.cost,0)}</td>
                <td style={{padding:"6px 8px",textAlign:"right",fontFamily:"monospace",color:C.amberL}}>{fd(t.cost/(1-c.mg),0)}</td>
                <td style={{padding:"6px 8px",textAlign:"right",fontFamily:"monospace",color:C.greenL}}>{fd(t.cost/(1-c.mg)-t.cost,0)}</td>
              </tr>))}
            <tr style={{background:C.navy,color:"#fff",fontWeight:700}}>
              <td style={{padding:"7px 8px"}} colSpan={2}>TOTAL</td>
              <td style={{padding:"7px 8px",textAlign:"right",fontFamily:"monospace"}}>{fh(c.totalMin)}</td>
              <td style={{padding:"7px 8px",textAlign:"right",fontFamily:"monospace"}}>{fd(c.totCst,0)}</td>
              <td style={{padding:"7px 8px",textAlign:"right",fontFamily:"monospace"}}>{fd(c.adminPrice,0)}</td>
              <td style={{padding:"7px 8px",textAlign:"right",fontFamily:"monospace"}}>{fd(c.adminPrice-c.totCst,0)}</td>
            </tr>
          </tbody>
        </table>
      </div>}
    </div>

    {/* Scenarios */}
    <div style={St.card}><SH icon="🚦">Brigade Pool Scenarios</SH>
      {c.scenarios.map(sc=>(
        <div key={sc.key} style={{background:sc.bg,border:`1.5px solid ${sc.bd}`,borderRadius:8,padding:"10px 14px",marginBottom:8}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><div style={{fontSize:13,fontWeight:700,color:sc.color}}>{sc.label}</div>
              <div style={{fontSize:11,color:C.txtL}}>{sc.pace} · {fm(sc.hrPerW,1)}h/worker</div></div>
            <div style={{textAlign:"right"}}><div style={{fontFamily:"monospace",fontWeight:900,fontSize:18,color:sc.color}}>{fd(sc.poolAmt)}</div>
              <div style={{fontSize:10,color:C.txtL}}>brigade pool</div></div>
          </div>
        </div>))}
    </div>
  </>);
}

// ═══════════════════════════════════════════════════════════════
// ADMIN SETTINGS PANEL
// ═══════════════════════════════════════════════════════════════
function AdminSettings({settings,setSettings}){
  const [loc,setLoc]=useState(()=>JSON.parse(JSON.stringify(settings)));
  const sf=(k,v)=>setLoc(p=>({...p,[k]:parseFloat(v)||0}));
  const sv=k=>setLoc(p=>({...p,salesVis:{...p.salesVis,[k]:!p.salesVis[k]}}));
  const wv=k=>setLoc(p=>({...p,workerVis:{...p.workerVis,[k]:!p.workerVis[k]}}));
  const save=()=>{setSettings({...loc});alert("✅ Settings saved");};

  const updTier=(i,field,val)=>setLoc(p=>{const t=[...p.tiers];t[i]={...t[i],[field]:field==="margin"?parseFloat(val)||0:val};return{...p,tiers:t};});
  const updRole=(i,field,val)=>setLoc(p=>{const r=[...p.staffRoles];r[i]={...r[i],[field]:["poolCoef","normMult","rate"].includes(field)?parseFloat(val)||0:val};return{...p,staffRoles:r};});

  const SV_LABELS={delivery:"Delivery section",removal:"Removal section",protection:"Protection section",furniture:"Furniture section",finishing:"Finishing works",cleanup:"Cleanup"};
  const WV_LABELS={taskList:"Task list with time",consumables:"Consumables block",scenarios:"Green/Yellow/Red scenarios",jobNorm:"Target time & norm",tips:"How-to tips"};

  const VTog=({checked,onClick,label})=>(
    <div onClick={onClick} style={{...St.chip(checked,checked?C.greenL:C.navyL),padding:"7px 10px",display:"flex",alignItems:"center",gap:7,borderRadius:7,cursor:"pointer"}}>
      <div style={{width:14,height:14,borderRadius:3,border:`2px solid ${checked?C.greenL:C.borderD}`,background:checked?C.greenL:"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
        {checked&&<span style={{color:"#fff",fontSize:9,fontWeight:900}}>✓</span>}
      </div>
      <span style={{fontSize:11}}>{label}</span>
    </div>
  );

  return(<div>
    <div style={{...St.card,borderColor:C.goldV+"80",background:C.goldPale}}>
      <div style={{fontSize:14,fontWeight:800,color:C.navy}}>⚙️ Admin Settings</div>
      <div style={{fontSize:12,color:C.txtL,marginTop:2}}>Saved to browser. Controls rates, margins, visibility, norms, and roles.</div>
    </div>

    <div style={St.card}><SH icon="💲">Margin & Pool</SH>
      <Gr cols={2}><NI label="Labour pool % of revenue" val={loc.poolPct} set={v=>sf("poolPct",v)} sfx="%"/>
        <NI label="Acclimation surcharge %" val={loc.acclimSurcharge} set={v=>sf("acclimSurcharge",v)} sfx="%"/></Gr>
    </div>

    <div style={St.card}><SH icon="🏷️">Pricing Tiers — Edit Labels & Margins</SH>
      {(loc.tiers||[]).map((t,i)=>(
        <div key={t.id} style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
          <div style={{...St.badge(C.navy),width:24,textAlign:"center"}}>{t.id}</div>
          <input value={t.label} onChange={e=>updTier(i,"label",e.target.value)} style={{...St.inp,flex:2,fontSize:12}}/>
          <input value={t.margin} onChange={e=>updTier(i,"margin",e.target.value)} style={{...St.inp,width:70,fontSize:12}} type="number" min={0} max={99}/>
          <span style={{fontSize:11,color:C.txtL,flexShrink:0}}>% margin</span>
          <input value={t.note} onChange={e=>updTier(i,"note",e.target.value)} style={{...St.inp,flex:2,fontSize:11}}/>
        </div>))}
    </div>

    <div style={St.card}><SH icon="🚦">Traffic Light Multipliers</SH>
      {[["🟢 GREEN","greenMult","1.0"],["🟡 YELLOW","yellowMult","0.85"],["🔴 RED","redMult","0.70"]].map(([l,k,h])=>(
        <div key={k} style={{display:"flex",alignItems:"center",gap:12,marginBottom:9}}>
          <span style={{flex:1,fontSize:13}}>{l}</span><div style={{width:100}}><NI val={loc[k]} set={v=>sf(k,v)} step={0.05}/></div></div>))}
    </div>

    <div style={St.card}><SH icon="👷">Staff Roles — Edit Coefficients & Rates</SH>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
          <thead><tr style={{background:C.navy,color:"#fff"}}>{["Role","Pool Coef","Norm Mult","Rate $/h","Description"].map(h=><th key={h} style={{padding:"6px 8px",textAlign:"left",fontSize:10}}>{h}</th>)}</tr></thead>
          <tbody>{(loc.staffRoles||[]).map((r,i)=>(
            <tr key={r.id} style={{background:i%2===0?C.bg:C.card}}>
              <td style={{padding:"5px 8px"}}><input value={r.label} onChange={e=>updRole(i,"label",e.target.value)} style={{...St.inp,fontSize:11,padding:"4px 7px",background:"transparent",border:"none",fontWeight:700,color:r.color}}/></td>
              <td style={{padding:"5px 8px"}}><input type="number" value={r.poolCoef} step={0.05} onChange={e=>updRole(i,"poolCoef",e.target.value)} style={{...St.inp,fontSize:11,padding:"4px 7px",width:60}}/></td>
              <td style={{padding:"5px 8px"}}><input type="number" value={r.normMult} step={0.05} onChange={e=>updRole(i,"normMult",e.target.value)} style={{...St.inp,fontSize:11,padding:"4px 7px",width:60}}/></td>
              <td style={{padding:"5px 8px"}}><input type="number" value={r.rate} step={1} onChange={e=>updRole(i,"rate",e.target.value)} style={{...St.inp,fontSize:11,padding:"4px 7px",width:60}}/></td>
              <td style={{padding:"5px 8px"}}><input value={r.desc} onChange={e=>updRole(i,"desc",e.target.value)} style={{...St.inp,fontSize:10,padding:"4px 7px",color:C.txtL}}/></td>
            </tr>))}</tbody>
        </table>
      </div>
    </div>

    <div style={St.card}><SH icon="📋">Salesperson — Visible Sections</SH>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
        {Object.entries(SV_LABELS).map(([k,l])=><VTog key={k} checked={loc.salesVis[k]!==false} onClick={()=>sv(k)} label={l}/>)}
      </div>
    </div>

    <div style={St.card}><SH icon="👷">Worker Tab — Visible Blocks</SH>
      <div style={{fontSize:11,color:C.txtL,marginBottom:8}}>Workers never see the total quote price — only their pool.</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
        {Object.entries(WV_LABELS).map(([k,l])=><VTog key={k} checked={loc.workerVis[k]!==false} onClick={()=>wv(k)} label={l}/>)}
      </div>
    </div>

    <div style={{display:"flex",gap:10}}>
      <button onClick={()=>setLoc(JSON.parse(JSON.stringify(DEF_SETTINGS)))} style={{flex:1,padding:"10px",background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,cursor:"pointer",fontSize:13,fontFamily:"inherit",color:C.txtL}}>Reset All</button>
      <button onClick={save} style={{...St.btn(C.navy),flex:2,justifyContent:"center"}}>💾 Save Settings</button>
    </div>
  </div>);
}

// ═══════════════════════════════════════════════════════════════
// НОРМАТИВЫ TAB
// ═══════════════════════════════════════════════════════════════
function NormsTab({settings,setSettings}){
  const [norms,setNorms]=useState(()=>JSON.parse(JSON.stringify(settings.norms||DEFAULT_NORMS)));
  const [filter,setFilter]=useState("All");
  const [editRole,setEditRole]=useState(false);
  const groups=["All",...[...new Set((settings.norms||DEFAULT_NORMS).map(n=>n.grp))]];

  const updN=(i,f,v)=>setNorms(p=>{const n=[...p];n[i]={...n[i],[f]:f==="norm"?parseFloat(v)||0:v};return n;});
  const saveN=()=>{setSettings(p=>({...p,norms:[...norms]}));alert("✅ Norms saved — all calculations updated");};

  const shown=norms.filter(n=>filter==="All"||n.grp===filter);

  return(<div>
    <div style={{...St.card,background:`linear-gradient(135deg,${C.navyD},${C.navyM})`,color:"#fff",marginBottom:14}}>
      <div style={{fontSize:16,fontWeight:800,fontFamily:"Georgia,serif"}}>📊 Production Norms</div>
      <div style={{fontSize:12,opacity:.7,marginTop:3}}>All calculations in every tab are driven by these values. Edit norm → all quotes recalculate instantly.</div>
    </div>

    <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
      {groups.map(g=><span key={g} onClick={()=>setFilter(g)} style={St.chip(filter===g,C.navy)}>{g}</span>)}
      <div style={{marginLeft:"auto",display:"flex",gap:8}}>
        <button onClick={saveN} style={{...St.btn(C.navy),fontSize:12,padding:"7px 14px"}}>💾 Save Norms</button>
      </div>
    </div>

    <div style={{...St.card,padding:0,overflow:"hidden"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
        <thead><tr style={{background:C.navy,color:"#fff"}}>
          {["Category","Task Name","Norm","Unit","Role","Notes"].map(h=><th key={h} style={{padding:"8px 10px",textAlign:"left",fontSize:10,fontWeight:600}}>{h}</th>)}
        </tr></thead>
        <tbody>
          {shown.map((n,idx)=>{
            const realIdx=norms.findIndex(x=>x.id===n.id);
            const role=settings.staffRoles?.find(r=>r.id===n.role)||{label:n.role,color:C.txtL};
            return(
              <tr key={n.id} style={{background:idx%2===0?C.bg:C.card}}>
                <td style={{padding:"5px 8px"}}><span style={{...St.badge(C.navyL),fontSize:9}}>{n.grp}</span></td>
                <td style={{padding:"5px 8px"}}><input value={n.label} onChange={e=>updN(realIdx,"label",e.target.value)} style={{...St.inp,fontSize:11,padding:"3px 7px",minWidth:200,background:"transparent",border:`1px solid transparent`}} onFocus={e=>e.target.style.borderColor=C.border} onBlur={e=>e.target.style.borderColor="transparent"}/></td>
                <td style={{padding:"5px 8px",textAlign:"right"}}>
                  <input type="number" value={n.norm} step={0.01} onChange={e=>updN(realIdx,"norm",e.target.value)} style={{...St.inp,width:80,fontSize:13,fontWeight:700,color:C.navy,padding:"3px 6px",textAlign:"right"}}/></td>
                <td style={{padding:"5px 8px"}}><span style={{fontSize:10,color:C.txtL}}>{n.unit}</span></td>
                <td style={{padding:"5px 8px"}}><span style={St.badge(role.color)}>{role.label}</span></td>
                <td style={{padding:"5px 8px"}}><input value={n.note||""} onChange={e=>updN(realIdx,"note",e.target.value)} style={{...St.inp,fontSize:10,padding:"3px 7px",color:C.txtL,minWidth:150,background:"transparent",border:`1px solid transparent`}} onFocus={e=>e.target.style.borderColor=C.border} onBlur={e=>e.target.style.borderColor="transparent"}/></td>
              </tr>);
          })}
        </tbody>
      </table>
    </div>

    {/* Staff role coefficients */}
    <div style={{...St.card,marginTop:14}}>
      <SH icon="👷" action={<button onClick={()=>setEditRole(p=>!p)} style={{fontSize:11,color:C.navyL,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit"}}>{editRole?"▲ Hide":"▼ Edit roles"}</button>}>
        Staff Role Coefficients
      </SH>
      <div style={{fontSize:11,color:C.txtL,marginBottom:8}}>Pool coefficient = share of brigade pool. Norm multiplier = how much slower vs. best norm (Senior=1.0). Higher pay = must work at lower norm multiplier.</div>
      {editRole&&(
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
            <thead><tr style={{background:C.bg}}>
              {["Role","Pool Coef","Norm Mult","Rate $/h","Description"].map(h=><th key={h} style={{padding:"6px 8px",textAlign:"left",fontSize:10,color:C.txtL,fontWeight:700}}>{h}</th>)}
            </tr></thead>
            <tbody>
              {(settings.staffRoles||DEFAULT_STAFF_ROLES).map(r=>(
                <tr key={r.id} style={{borderBottom:`1px solid ${C.border}`}}>
                  <td style={{padding:"7px 8px",fontWeight:700}}><span style={{color:r.color}}>■</span> {r.label}</td>
                  <td style={{padding:"7px 8px",fontFamily:"monospace",color:C.navy,fontWeight:700}}>{r.poolCoef}×</td>
                  <td style={{padding:"7px 8px",fontFamily:"monospace",color:r.normMult===1?"#16A34A":C.amberL,fontWeight:700}}>{r.normMult}×</td>
                  <td style={{padding:"7px 8px",fontFamily:"monospace"}}>${r.rate}/h</td>
                  <td style={{padding:"7px 8px",fontSize:10,color:C.txtL}}>{r.desc}</td>
                </tr>))}
            </tbody>
          </table>
          <div style={{fontSize:10,color:C.txtL,marginTop:8,padding:"6px 10px",background:C.bg,borderRadius:6}}>
            To edit role coefficients, use the <strong>⚙️ Internal</strong> tab → Settings → Staff Roles section.
          </div>
        </div>
      )}
    </div>
  </div>);
}

// ═══════════════════════════════════════════════════════════════
// SALES PANEL
// ═══════════════════════════════════════════════════════════════
function SalesPanel({c,job,s,onPrint,onSend}){
  const [showItems,setShowItems]=useState(true);
  if(!c.sqm)return(<div style={{...St.card,textAlign:"center",padding:"48px 20px",color:C.txtL}}><div style={{fontSize:32,marginBottom:8}}>📋</div>Fill in job details to generate a quote</div>);
  return(<>
    <div style={{background:`linear-gradient(135deg,${C.navyD},${C.navyM})`,borderRadius:12,padding:"22px 24px",marginBottom:14,color:"#fff",boxShadow:C.shM}}>
      <div style={{fontSize:10,opacity:.6,textTransform:"uppercase",letterSpacing:".12em",marginBottom:4}}>Project Quote — {c.activeTier?.label}</div>
      <div style={{fontSize:44,fontWeight:900,fontFamily:"Georgia,serif",color:C.goldV,letterSpacing:"-1px",lineHeight:1}}>{fd(c.price)}</div>
      <div style={{fontSize:11,opacity:.55,marginTop:3}}>excl. GST · {fd(c.pricePerM2)}/m² · {fm(c.minPerM2,1)} min/m²</div>
      <div style={{marginTop:12,display:"flex",gap:8,flexWrap:"wrap"}}>
        <div style={{background:"rgba(255,255,255,0.1)",borderRadius:6,padding:"5px 10px",fontSize:11}}>⏱ {c.days} day{c.days>1?"s":""} · {c.wc} workers</div>
        <div style={{background:"rgba(255,255,255,0.1)",borderRadius:6,padding:"5px 10px",fontSize:11}}>📐 {fm(c.sqm)}m² {FLOOR[job.floorType]?.label}</div>
      </div>
    </div>

    <div style={St.card}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <SH icon="📋">Included Works</SH>
        <button onClick={()=>setShowItems(p=>!p)} style={{fontSize:11,color:C.navyL,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit"}}>{showItems?"▲":"▼"}</button>
      </div>
      {showItems&&c.tasks.map(t=>{const cp=t.cost/(1-c.mg);return(
        <div key={t.id} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}`,fontSize:12}}>
          <span style={{flex:1,color:C.txt}}>{t.name.replace(/\(\d+\.\d+ min\/m²\)/,"").replace(/\(\d+\.\d+ min\/m[²]?\)/,"").trim()}</span>
          <span style={{fontFamily:"monospace",fontWeight:600,color:C.navy,marginLeft:8}}>{fd(cp,0)}</span>
        </div>);})}
      <div style={{display:"flex",justifyContent:"space-between",paddingTop:10,fontWeight:700,fontSize:14}}>
        <span>Total (excl. GST)</span><span style={{fontFamily:"monospace",color:C.navy}}>{fd(c.price)}</span>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",paddingTop:4,fontSize:12,color:C.txtL}}>
        <span>GST (10%)</span><span style={{fontFamily:"monospace"}}>{fd(c.price*0.1)}</span>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",paddingTop:6,fontWeight:900,fontSize:16,borderTop:`2px solid ${C.navy}`,marginTop:6}}>
        <span style={{color:C.navy}}>TOTAL (incl. GST)</span>
        <span style={{fontFamily:"monospace",color:C.navy}}>{fd(c.price*1.1)}</span>
      </div>
    </div>

    {/* Client details */}
    <div style={St.card}><SH icon="👤">Client Details</SH>
      <Gr cols={2}>
        <div><label style={St.lbl}>Client name</label><input style={St.inp} value={job.clientName} onChange={e=>s("clientName")(e.target.value)} placeholder="Full name"/></div>
        <div><label style={St.lbl}>Email</label><input style={St.inp} type="email" value={job.clientEmail} onChange={e=>s("clientEmail")(e.target.value)} placeholder="client@email.com"/></div>
      </Gr>
      <Gr cols={2}>
        <div><label style={St.lbl}>Phone</label><input style={St.inp} value={job.clientPhone} onChange={e=>s("clientPhone")(e.target.value)} placeholder="+61 4xx xxx xxx"/></div>
        <div><label style={St.lbl}>Preferred start</label><input style={St.inp} type="date" value={job.preferredDate} onChange={e=>s("preferredDate")(e.target.value)}/></div>
      </Gr>
      <div><label style={St.lbl}>Site address</label><input style={St.inp} value={job.clientAddress} onChange={e=>s("clientAddress")(e.target.value)} placeholder="Full address"/></div>
      <div style={{marginTop:8}}><label style={St.lbl}>Notes</label><textarea style={{...St.inp,height:60,resize:"vertical"}} value={job.notes} onChange={e=>s("notes")(e.target.value)} placeholder="Access, parking, special requirements…"/></div>
      <div style={{display:"flex",gap:10,marginTop:12}}>
        <button onClick={onSend} style={{...St.btn(C.navyD),flex:2,justifyContent:"center"}}>📧 Email Quote</button>
        <button onClick={onPrint} style={{...St.btn(C.navy),flex:1,justifyContent:"center"}}>🖨️ Print</button>
      </div>
    </div>

    <div style={St.card}><SH icon="📅">Availability Calendar</SH>
      <div style={{borderRadius:8,overflow:"hidden",border:`1px solid ${C.border}`}}>
        <iframe src="https://calendar.google.com/calendar/embed?src=8djf7l3m9r3fhv9o1178oub974%40group.calendar.google.com&ctz=Australia%2FSydney"
          style={{border:0,width:"100%",height:380,display:"block"}} frameBorder="0" scrolling="no"/>
      </div>
    </div>
  </>);
}

// ═══════════════════════════════════════════════════════════════
// WORKER / MY PAY TAB
// ═══════════════════════════════════════════════════════════════
function WorkerView({c,job,s,settings}){
  const wv=settings.workerVis||{};
  const staffRoles=settings.staffRoles||DEFAULT_STAFF_ROLES;

  // Editable task times
  const overrides=job.taskTimeOverrides||{};
  const setOverride=(id,val)=>s("taskTimeOverrides")({...overrides,[id]:val===""?"":parseFloat(val)});

  // Crew composition
  const crew=job.crewComposition||{beginner:0,apprentice:1,installer:1,senior:0,project:1};
  const setCrew=(role,val)=>s("crewComposition")({...crew,[role]:Math.max(0,parseInt(val)||0)});

  const poolDist=useMemo(()=>calcPoolDistribution(c.pool,crew,staffRoles,c.scenarios),[c.pool,crew,staffRoles,c.scenarios]);

  if(!c.sqm)return(<div style={{...St.card,textAlign:"center",padding:"56px 24px",color:C.txtL}}>
    <div style={{fontSize:44,marginBottom:12}}>💰</div>
    <div style={{fontSize:17,fontWeight:700,color:C.navy,marginBottom:6}}>Worker Pay Calculator</div>
    <div style={{fontSize:13,lineHeight:1.6}}>Fill in job details to see your pool and time targets.</div>
  </div>);

  return(<>
    {/* Pool hero */}
    <div style={{background:`linear-gradient(135deg,${C.navyD},${C.navyM})`,borderRadius:12,padding:"24px",marginBottom:14,color:"#fff",textAlign:"center"}}>
      <div style={{fontSize:10,opacity:.6,textTransform:"uppercase",letterSpacing:".13em",marginBottom:6}}>Brigade Pool — This Job</div>
      <div style={{fontSize:52,fontWeight:900,fontFamily:"Georgia,serif",color:C.goldV,letterSpacing:"-2px",lineHeight:1}}>{fd(c.pool)}</div>
      <div style={{fontSize:11,opacity:.5,marginTop:4}}>Distributed by role · total quote not shown</div>
    </div>

    {/* Target time */}
    {wv.jobNorm!==false&&<div style={{...St.card,textAlign:"center",padding:"14px"}}>
      <div style={{fontSize:9,color:C.txtL,textTransform:"uppercase",letterSpacing:".1em",marginBottom:6}}>Job Targets</div>
      <div style={{display:"flex",justifyContent:"center",gap:20,flexWrap:"wrap"}}>
        {[[`${fm(c.hPerW,1)}h`,"per worker"],[`${fm(c.iNorm,1)} min/m²`,"install norm"],[`${c.days}d`,"duration"],[`${fm(c.minPerM2,1)} min/m²`,"total all tasks"]].map(([v,l])=>(
          <div key={l}><div style={{fontSize:22,fontWeight:800,color:C.navy,fontFamily:"monospace",lineHeight:1}}>{v}</div><div style={{fontSize:10,color:C.txtL,marginTop:2}}>{l}</div></div>))}
      </div>
    </div>}

    {/* Crew composition + pool distribution */}
    <div style={St.card}><SH icon="👥">Crew on This Job</SH>
      <div style={{fontSize:11,color:C.txtL,marginBottom:10}}>Set how many of each role are on site. Pool is split by role coefficient.</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
        {staffRoles.map(r=>(
          <div key={r.id} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",background:C.bg,borderRadius:7,border:`1px solid ${C.border}`}}>
            <span style={{...St.badge(r.color),flexShrink:0}}>{ROLES_META[r.id]?.abbr||r.id}</span>
            <span style={{flex:1,fontSize:11,color:C.txt}}>{r.label}<br/><span style={{fontSize:9,color:C.txtL}}>×{r.poolCoef} pool</span></span>
            <input type="number" min={0} value={crew[r.id]||0} onChange={e=>setCrew(r.id,e.target.value)}
              style={{...St.inp,width:50,fontSize:13,fontWeight:700,textAlign:"center",padding:"4px"}}/>
          </div>))}
      </div>
    </div>

    {/* Pool distribution per scenario */}
    {wv.scenarios!==false&&poolDist.map((sc,si)=>(
      <div key={sc.key} style={{...St.card,border:`2px solid ${sc.bd}`,background:sc.bg,marginBottom:10,padding:"14px 18px"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
          <div><div style={{fontSize:15,fontWeight:800,color:sc.color}}>{sc.label}</div>
            <div style={{fontSize:11,color:C.txtL}}>{sc.pace} · {fm(sc.hrPerW,1)}h/worker</div></div>
          <div style={{textAlign:"right"}}><div style={{fontFamily:"monospace",fontWeight:900,fontSize:20,color:sc.color}}>{fd(sc.poolAmt)}</div>
            <div style={{fontSize:10,color:C.txtL}}>total pool</div></div>
        </div>
        {sc.perRole.map(pr=>(
          <div key={pr.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderTop:`1px solid ${sc.bd}50`,fontSize:12}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={St.badge(pr.color)}>{pr.count}×</span>
              <span style={{color:C.txt}}>{pr.label}</span>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:"monospace",fontWeight:700,color:sc.color}}>{fd(pr.perPerson)}<span style={{fontSize:10,color:C.txtL,fontWeight:400}}>/person</span></div>
              <div style={{fontSize:9,color:C.txtL}}>≈ {fd(pr.perPerson/sc.hrPerW,0)}/h effective</div>
            </div>
          </div>))}
      </div>))}

    {/* Editable task breakdown */}
    {wv.taskList!==false&&<div style={St.card}><SH icon="📋">Task Breakdown — Edit Time to See Pool Change</SH>
      <div style={{fontSize:11,color:C.amberL,marginBottom:10,padding:"6px 10px",background:C.amberBg,borderRadius:6}}>⚡ Edit times below to see how actual pace affects your pool in real time.</div>
      {c.tasks.map((t,i)=>{
        const R=ROLES_META[t.role]||{abbr:"?",color:C.txtL};
        const ov=overrides[t.id];
        return(
          <div key={t.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:`1px solid ${C.border}`}}>
            <span style={St.badge(R.color)}>{R.abbr}</span>
            <span style={{flex:1,fontSize:11,color:C.txt,lineHeight:1.3}}>{t.name}</span>
            <input type="number" min={0} step={1}
              value={ov!==undefined?ov:Math.round(t.total)}
              onChange={e=>setOverride(t.id,e.target.value)}
              style={{...St.inp,width:65,fontSize:12,padding:"4px 6px",textAlign:"right",fontFamily:"monospace",fontWeight:700,borderColor:ov!==undefined?C.amberL:C.border}}/>
            <span style={{fontSize:10,color:C.txtL,flexShrink:0}}>min</span>
            {ov!==undefined&&<button onClick={()=>{const n={...overrides};delete n[t.id];s("taskTimeOverrides")(n);}} style={{fontSize:10,color:C.txtL,background:"none",border:"none",cursor:"pointer"}}>↺</button>}
          </div>);
      })}
      <div style={{display:"flex",justifyContent:"space-between",paddingTop:8,fontWeight:700,fontSize:13}}>
        <span style={{color:C.txtL}}>Total person-time</span>
        <span style={{fontFamily:"monospace",color:C.navy}}>{fh(c.totalMin)}</span>
      </div>
    </div>}

    {/* Consumables */}
    {wv.consumables!==false&&c.cons.length>0&&<div style={St.card}><SH icon="📦">Consumables Included</SH>
      <div style={{fontSize:11,color:C.txtL,marginBottom:8}}>Provided materials — handle with care.</div>
      {c.cons.map((t,i)=>(
        <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}`,fontSize:12}}>
          <span>{t.name}</span>
          <span style={{...St.badge(C.greenL)}}>included</span>
        </div>))}
    </div>}

    {/* Tips */}
    {wv.tips!==false&&<div style={St.card}><SH icon="💡">How to Earn More Per Hour</SH>
      {[["⚡","Sync constantly","Helper preps next zone while installer finishes current one."],
        ["📸","Log stages immediately","Close AppSheet stages when done — delay creates confusion."],
        ["🚫","Log defects immediately","Logged = paused timer = not your KPI. Covering = rework = your cost."],
        [`🎯`,`Know your norm: ${fm(c.iNorm,1)} min/m²`,"Check every 2h. Adjust pace if falling behind."],
      ].map(([ic,t,d])=>(
        <div key={t} style={{display:"flex",gap:12,marginBottom:10}}><div style={{fontSize:18,flexShrink:0}}>{ic}</div>
          <div><div style={{fontSize:13,fontWeight:600,color:C.navy}}>{t}</div><div style={{fontSize:11,color:C.txtL,marginTop:1,lineHeight:1.4}}>{d}</div></div></div>))}
    </div>}
  </>);
}

// ═══════════════════════════════════════════════════════════════
// LOGIN MODAL
// ═══════════════════════════════════════════════════════════════
function LoginModal({title,sub,correctPwd,onLogin,onClose}){
  const [p,setP]=useState(""),[err,setErr]=useState("");
  const go=()=>{if(p===correctPwd)onLogin();else setErr("Incorrect password.");};
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(11,26,50,0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:500,backdropFilter:"blur(3px)"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:C.card,borderRadius:14,padding:36,width:320,boxShadow:C.shM}}>
        <div style={{width:46,height:46,background:C.navy,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,marginBottom:14}}>🔐</div>
        <div style={{fontSize:17,fontWeight:800,color:C.navy,marginBottom:3}}>{title}</div>
        <div style={{fontSize:12,color:C.txtL,marginBottom:18,lineHeight:1.5}}>{sub}</div>
        <input type="password" value={p} autoFocus placeholder="Password" onChange={e=>setP(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()} style={{...St.inp,marginBottom:err?6:14}}/>
        {err&&<div style={{color:C.redL,fontSize:11,marginBottom:10}}>{err}</div>}
        <div style={{display:"flex",gap:8}}>
          <button onClick={onClose} style={{flex:1,padding:"10px",background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,cursor:"pointer",fontSize:13,fontFamily:"inherit",color:C.txtL}}>Cancel</button>
          <button onClick={go} style={{...St.btn(C.navy),flex:2,justifyContent:"center"}}>Enter</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PRINT & EMAIL
// ═══════════════════════════════════════════════════════════════
function doPrint(job,c,mode){
  const w=window.open("","_blank");if(!w)return;
  const rows=c.tasks.map(t=>{const cp=t.cost/(1-c.mg);return`<tr><td>${t.name.replace(/\(\d+\.\d+ min\/m²\)/,"").trim()}</td><td style="text-align:right;font-family:monospace">${fh(t.total)}</td><td style="text-align:right;font-family:monospace">${fd(cp,0)}</td></tr>`;}).join("");
  w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>GATS Quote</title><style>body{font-family:Arial,sans-serif;max-width:800px;margin:30px auto;padding:20px;color:#1a2035}.hdr{display:flex;justify-content:space-between;border-bottom:3px solid #E8B84B;padding-bottom:14px;margin-bottom:20px}.logo{font-size:28px;font-weight:900;color:#1B3A5C;font-family:Georgia,serif}.info{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px}.ib{background:#F2F5F9;padding:10px 14px;border-radius:7px}.il{font-size:9px;color:#718096;text-transform:uppercase;margin-bottom:3px}.iv{font-size:13px;font-weight:600}.hero{background:#1B3A5C;color:#fff;padding:20px;border-radius:8px;text-align:center;margin-bottom:20px}.price{font-size:40px;font-weight:900;color:#E8B84B;font-family:Georgia,serif}table{width:100%;border-collapse:collapse}th{background:#1B3A5C;color:#fff;padding:7px 10px;text-align:left;font-size:11px}td{padding:6px 10px;border-bottom:1px solid #e2e8f0;font-size:12px}.tot{background:#F2F5F9;font-weight:700}.grand{background:#1B3A5C;color:#fff;font-weight:900}@media print{button{display:none}}</style></head><body>
<div class="hdr"><div><div class="logo">GATS</div><div style="font-size:11px;color:#718096">GATS Development Pty Ltd · contact@gatsdevelopment.com.au</div></div>
<div style="text-align:right"><div style="font-weight:700;color:#1B3A5C">Floor Installation Quote</div><div style="font-size:10px;color:#718096">Date: ${new Date().toLocaleDateString("en-AU")} · Valid 30 days</div><div style="font-size:10px;color:#718096">Tier: ${c.activeTier?.label||"A"}</div></div></div>
<div class="info"><div class="ib"><div class="il">Client</div><div class="iv">${job.clientName||"—"}</div></div><div class="ib"><div class="il">Address</div><div class="iv">${job.clientAddress||"—"}</div></div><div class="ib"><div class="il">Email / Phone</div><div class="iv">${job.clientEmail||"—"} / ${job.clientPhone||"—"}</div></div><div class="ib"><div class="il">Preferred Start</div><div class="iv">${job.preferredDate||"TBD"}</div></div></div>
<div class="hero"><div style="font-size:10px;opacity:.6;text-transform:uppercase;margin-bottom:4px">Total (incl. GST)</div><div class="price">${fd(c.price*1.1)}</div><div style="font-size:11px;opacity:.55;margin-top:4px">${fm(c.sqm)}m² ${FLOOR[job.floorType]?.label} · ${c.days} day${c.days>1?"s":""} · ${c.wc} worker${c.wc>1?"s":""} · ${fm(c.minPerM2,1)} min/m²</div></div>
<table><thead><tr><th>Description</th><th style="text-align:right">Time</th><th style="text-align:right">Price</th></tr></thead><tbody>${rows}
<tr class="tot"><td colspan="2"><strong>Subtotal (excl. GST)</strong></td><td style="text-align:right;font-family:monospace"><strong>${fd(c.price,0)}</strong></td></tr>
<tr class="tot"><td colspan="2">GST 10%</td><td style="text-align:right;font-family:monospace">${fd(c.price*0.1,0)}</td></tr>
<tr class="grand"><td colspan="2"><strong>TOTAL (incl. GST)</strong></td><td style="text-align:right;font-family:monospace;font-size:15px"><strong>${fd(c.price*1.1,0)}</strong></td></tr></tbody></table>
${job.notes?`<p style="font-size:12px;margin-top:16px"><strong>Notes:</strong> ${job.notes}</p>`:""}
<p style="font-size:9px;color:#999;margin-top:24px;border-top:1px solid #e2e8f0;padding-top:10px">GATS Development Pty Ltd · contact@gatsdevelopment.com.au · gatsdevelopment.com.au · Valid 30 days. All prices AUD. GST registered. Subject to site inspection. Furniture protection, dust protection and rubbish removal scope as agreed at quote.</p>
<button onclick="window.print()" style="margin-top:14px;padding:10px 20px;background:#1B3A5C;color:#fff;border:none;border-radius:6px;cursor:pointer">🖨️ Print / Save PDF</button></body></html>`);
  w.document.close();
}

function doEmail(job,c){
  if(!job.clientEmail){alert("Enter client email first.");return;}
  const sub=`Floor Installation Quote — ${job.clientAddress||job.clientName||"Your Property"}`;
  const body=`Dear ${job.clientName||"there"},\n\nThank you for contacting GATS Development.\n\nPROJECT QUOTE\n─────────────────────────\nScope:    ${fm(c.sqm)}m² ${FLOOR[job.floorType]?.label}\nAddress:  ${job.clientAddress||"—"}\nDuration: ${c.days} working day${c.days>1?"s":""} · ${c.wc} worker${c.wc>1?"s":""}\nStart:    ${job.preferredDate||"TBD"}\nTier:     ${c.activeTier?.label||"A"}\n\nTOTAL (incl. GST): ${fd(c.price*1.1)}\n(excl. GST: ${fd(c.price)})\n\nINCLUDED WORKS\n─────────────────────────\n${c.tasks.map(t=>`• ${t.name.replace(/\(\d+\.\d+ min\/m²\)/,"").trim()}`).join("\n")}\n\n${!job.protectCarpet?"⚠️ NOTE: Carpet protection in common areas not included — client is responsible for common area surfaces.\n":""}${!job.protectDust?"⚠️ NOTE: Dust protection for furniture/kitchen not included — client waives dust-related claims.\n":""}\n${job.notes?"NOTES\n─────────────────────────\n"+job.notes+"\n\n":""}This quote is valid for 30 days. To accept or arrange a site visit, reply to this email.\n\nKind regards,\nGATS Development\n📧 contact@gatsdevelopment.com.au\n🌐 gatsdevelopment.com.au`;
  window.location.href=`mailto:${job.clientEmail}?cc=contact%40gatsdevelopment.com.au&subject=${encodeURIComponent(sub)}&body=${encodeURIComponent(body)}`;
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
export default function App(){
  const [settings,setSettings]=useState(()=>{
    try{const sv=localStorage.getItem("gats_v4");return sv?JSON.parse(sv):JSON.parse(JSON.stringify(DEF_SETTINGS));}
    catch{return JSON.parse(JSON.stringify(DEF_SETTINGS));}
  });
  useEffect(()=>{try{localStorage.setItem("gats_v4",JSON.stringify(settings));}catch{};},[settings]);

  const [mode,setMode]=useState("worker");
  const [unlocked,setUnlocked]=useState({worker:false,sales:false,admin:false,norms:false});
  const [showLogin,setShowLogin]=useState(null);
  const [adminTab,setAdminTab]=useState("breakdown");
  const [job,setJob]=useState(()=>JSON.parse(JSON.stringify(DEF_JOB)));
  const s=field=>value=>setJob(p=>({...p,[field]:value}));

  useEffect(()=>setJob(p=>({...p,underlay:FLOOR[p.floorType].ulDef})),[job.floorType]);

  const c=useMemo(()=>calcJob(job,settings,job.taskTimeOverrides||{}),[job,settings]);

  const TABS=[
    {k:"worker",l:"💰 My Pay",   pwd:"GatsTeam2026"},
    {k:"sales", l:"📋 Quote",    pwd:"SalesHN"},
    {k:"admin", l:"⚙️ Internal", pwd:"flooring2026"},
    {k:"norms", l:"📊 Нормативы",pwd:"NormaFloor2026"},
  ];

  const trySwitch=m=>{
    if(unlocked[m]||m===mode){setMode(m);return;}
    setShowLogin(m);
  };
  const onLogin=(m)=>{setUnlocked(p=>({...p,[m]:true}));setMode(m);setShowLogin(null);};

  return(
    <div style={{fontFamily:"'Segoe UI',system-ui,sans-serif",background:C.bg,minHeight:"100vh",color:C.txt}}>
      <style>{`*{box-sizing:border-box}input,select,textarea,button{font-family:inherit}input[type=number]::-webkit-inner-spin-button{opacity:.5}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:${C.borderD};border-radius:3px}@media(max-width:860px){.mg{grid-template-columns:1fr!important}.sticky{position:static!important}}`}</style>

      {/* HEADER */}
      <header style={{background:`linear-gradient(90deg,${C.navyD},${C.navy})`,borderBottom:`3px solid ${C.goldV}`,position:"sticky",top:0,zIndex:200,boxShadow:C.shM}}>
        <div style={{maxWidth:1260,margin:"0 auto",display:"flex",alignItems:"center",height:60,padding:"0 20px",gap:16}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:42,height:42,background:C.goldV,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:20,color:C.navyD,fontFamily:"Georgia,serif"}}>G</div>
            <div>
              <div style={{fontWeight:800,fontSize:17,color:"#fff",fontFamily:"Georgia,serif",lineHeight:1.1}}>GATS Development</div>
              <div style={{fontSize:9,color:C.goldV,letterSpacing:".15em",textTransform:"uppercase",opacity:.8}}>Floor Calculator v4</div>
            </div>
          </div>
          <nav style={{display:"flex",gap:3,marginLeft:"auto"}}>
            {TABS.map(t=>(
              <button key={t.k} onClick={()=>trySwitch(t.k)}
                style={{padding:"7px 14px",borderRadius:7,border:`1.5px solid ${mode===t.k?C.goldV:"rgba(255,255,255,0.15)"}`,background:mode===t.k?"rgba(232,184,75,0.15)":"transparent",color:mode===t.k?C.goldV:"rgba(255,255,255,0.75)",cursor:"pointer",fontSize:12,fontWeight:mode===t.k?700:400,transition:"all .13s"}}>
                {t.l}{!unlocked[t.k]?" 🔒":""}
              </button>))}
          </nav>
        </div>
      </header>

      {/* LOGIN MODAL */}
      {showLogin&&<LoginModal
        title={TABS.find(t=>t.k===showLogin)?.l+" — Access"}
        sub={{worker:"Worker pay calculator. Enter team password.",sales:"Create and send client quotes.",admin:"Full cost breakdown, margins, and settings.",norms:"View and edit production norms."}[showLogin]||""}
        correctPwd={TABS.find(t=>t.k===showLogin)?.pwd||""}
        onLogin={()=>onLogin(showLogin)} onClose={()=>setShowLogin(null)}/>}

      {/* CONTENT */}
      <main style={{maxWidth:1260,margin:"0 auto",padding:"22px 18px 80px"}}>

        {/* ── WORKER TAB ── */}
        {mode==="worker"&&unlocked.worker&&(
          <div className="mg" style={{display:"grid",gridTemplateColumns:"1fr 400px",gap:20,alignItems:"start"}}>
            <div>
              <div style={{...St.card,background:`linear-gradient(135deg,${C.navy},${C.navyM})`,color:"#fff",padding:"14px 20px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{fontSize:14,fontWeight:700}}>👷 Worker Pay Calculator</div>
                  <div style={{fontSize:12,opacity:.6,marginTop:2}}>Fill in job — see your pool and time targets on the right.</div></div>
                <PrintBtn onClick={()=>doPrint(job,c,"worker")}/>
              </div>
              <JobForm j={job} s={s} mode="worker" settings={settings}/>
            </div>
            <div className="sticky" style={{position:"sticky",top:78}}><WorkerView c={c} job={job} s={s} settings={settings}/></div>
          </div>)}

        {/* ── SALES TAB ── */}
        {mode==="sales"&&unlocked.sales&&(
          <div className="mg" style={{display:"grid",gridTemplateColumns:"1fr 400px",gap:20,alignItems:"start"}}>
            <div>
              <div style={{...St.card,background:`linear-gradient(135deg,${C.navy},${C.navyM})`,color:"#fff",padding:"14px 20px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{fontSize:14,fontWeight:700}}>📋 Sales Quote Builder</div>
                  <div style={{fontSize:12,opacity:.6,marginTop:2}}>Fill in details → generate, email or print client quote.</div></div>
                <PrintBtn onClick={()=>doPrint(job,c,"sales")}/>
              </div>
              <JobForm j={job} s={s} mode="sales" settings={settings}/>
            </div>
            <div className="sticky" style={{position:"sticky",top:78}}>
              <SalesPanel c={c} job={job} s={s} onPrint={()=>doPrint(job,c,"sales")} onSend={()=>doEmail(job,c)}/>
            </div>
          </div>)}

        {/* ── ADMIN TAB ── */}
        {mode==="admin"&&unlocked.admin&&(
          <div className="mg" style={{display:"grid",gridTemplateColumns:"1fr 460px",gap:20,alignItems:"start"}}>
            <div>
              <div style={{...St.card,borderColor:C.goldV+"60",background:C.goldPale,padding:"14px 20px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{fontSize:14,fontWeight:700,color:C.navyD}}>⚙️ Internal View</div>
                  <div style={{fontSize:12,color:C.txtL,marginTop:2}}>Salesperson & workers cannot see this.</div></div>
                <PrintBtn onClick={()=>doPrint(job,c,"admin")}/>
              </div>
              <JobForm j={job} s={s} mode="admin" settings={settings}/>
            </div>
            <div className="sticky" style={{position:"sticky",top:78}}>
              <div style={{display:"flex",gap:6,marginBottom:14}}>
                {[["breakdown","📊 Breakdown"],["settings","⚙️ Settings"]].map(([k,l])=>(
                  <button key={k} onClick={()=>setAdminTab(k)} style={{...St.btn(adminTab===k?C.navy:C.bg,adminTab===k?"#fff":C.txtL),flex:1,justifyContent:"center",border:`1px solid ${adminTab===k?C.navy:C.border}`,fontSize:13,padding:"9px 14px"}}>{l}</button>))}
              </div>
              {adminTab==="breakdown"&&<AdminBreakdown c={c} job={job} s={s} settings={settings} setSettings={setSettings}/>}
              {adminTab==="settings"&&<AdminSettings settings={settings} setSettings={setSettings}/>}
            </div>
          </div>)}

        {/* ── NORMS TAB ── */}
        {mode==="norms"&&unlocked.norms&&(
          <div>
            <div style={{...St.card,background:`linear-gradient(135deg,${C.navyD},${C.navyM})`,color:"#fff",padding:"14px 20px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><div style={{fontSize:14,fontWeight:700}}>📊 Production Norms (Нормативы)</div>
                <div style={{fontSize:12,opacity:.6,marginTop:2}}>All calculations in every tab use these values. Edit → instant recalculation everywhere.</div></div>
              <PrintBtn onClick={()=>window.print()}/>
            </div>
            <NormsTab settings={settings} setSettings={setSettings}/>
          </div>)}

        {/* Show lock screen if not unlocked */}
        {!unlocked[mode]&&<div style={{...St.card,textAlign:"center",padding:"80px 24px"}}>
          <div style={{fontSize:48,marginBottom:16}}>🔐</div>
          <div style={{fontSize:18,fontWeight:700,color:C.navy,marginBottom:8}}>{TABS.find(t=>t.k===mode)?.l}</div>
          <div style={{fontSize:13,color:C.txtL,marginBottom:20}}>Enter your password to access this section.</div>
          <button onClick={()=>setShowLogin(mode)} style={{...St.btn(C.navy),justifyContent:"center",margin:"0 auto"}}>Enter Password</button>
        </div>}
      </main>
    </div>
  );
}

/*
═══════════════════════════════════════════════════════
PHP DEPLOYMENT
═══════════════════════════════════════════════════════
Passwords:
  Worker:  GatsTeam2026
  Sales:   SalesHN
  Admin:   flooring2026
  Norms:   NormaFloor2026

index.php:
<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>GATS Floor Calculator</title>
<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<style>body{margin:0;padding:0}</style></head><body>
<div id="root"></div>
<script type="text/babel">
// PASTE ENTIRE COMPONENT CODE HERE (remove the import line at top)
ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
</script></body></html>
*/
