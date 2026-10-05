/* HERO CLASH v1.0
   Economy + RU/EN foundation.
   Backend is optional for local/demo play, but REQUIRED for real payments
   and authoritative Coins/Gems/Energy/XP in production.
*/

const API_BASE = (window.HERO_CLASH_API || localStorage.getItem("hero_clash_api") || "").replace(/\/$/, "");
const STATE_KEY = "hero_clash_state_v1";
const LANG_KEY = "hero_clash_language";

const ECONOMY = {
  energy: { max: 30, regenMinutes: 6, battleCost: 3, dailyPurchases: 3 },
  energyPacks: [
    { id:"energy_10", name:"Energy +10", gram:2, amount:10 },
    { id:"energy_30", name:"Energy +30", gram:5, amount:30 },
    { id:"energy_full", name:"Full Restore", gram:3, full:true }
  ],
  gems: [
    { id:"gems_1", gram:1, gems:100 },
    { id:"gems_5", gram:5, gems:550 },
    { id:"gems_10", gram:10, gems:1200 },
    { id:"gems_20", gram:20, gems:2800 },
    { id:"gems_50", gram:50, gems:7500 },
    { id:"gems_100", gram:100, gems:16000 }
  ],
  chests: [
    { id:"chest_basic", key:"basic", gram:3 },
    { id:"chest_rare", key:"rare", gram:7 },
    { id:"chest_epic", key:"epic", gram:15 },
    { id:"chest_legendary", key:"legendary", gram:30 }
  ],
  worlds: Array.from({length:10}, (_, i) => ({
    id:i+1,
    coinsMin:[100,180,300,500,800,1300,2000,3200,5000,8000][i],
    coinsMax:[180,300,500,800,1300,2000,3200,5000,8000,12000][i]
  })),
  heroLevelCap:50
};

const HEROES = [
  {id:"lumi", name:"Lumi", rarity:"Rare", icon:"✦", color:"cyan"},
  {id:"roxy", name:"Roxy", rarity:"Epic", icon:"◆", color:"pink"},
  {id:"nox", name:"Nox", rarity:"Legendary", icon:"◈", color:"purple"},
  {id:"blitz", name:"Blitz", rarity:"Legendary", icon:"⚡", color:"gold"}
];

const I18N = {
  ru: {
    play:"Играть", heroes:"Герои", map:"Карта", shop:"Магазин", rewards:"Награды",
    profile:"Профиль", settings:"Настройки", battle:"Бой", attack:"Атака",
    skill:"Навык", victory:"Победа", defeat:"Поражение", continue:"Продолжить",
    coins:"Монеты", gems:"Кристаллы", energy:"Энергия", xp:"Опыт", level:"Уровень",
    power:"Сила", fragments:"Фрагменты", tickets:"Билеты", premium:"Премиум",
    howto:"Как играть", details:"ПОДРОБНЕЕ", language:"ЯЗЫК",
    welcome:"Добро пожаловать в HERO CLASH!",
    compact:"Собирай героев → сражайся → прокачивай → открывай миры → получай награды.",
    howTitle:"КАК ИГРАТЬ?",
    howIntro:"Твоя задача — собрать сильную команду героев, побеждать врагов, проходить уровни и становиться сильнее с каждой битвой.",
    team:"СОБЕРИ КОМАНДУ", teamText:"Получай новых героев и собирай собственную команду. У каждого героя свои характеристики, способности и стиль боя.",
    fight:"ВСТУПАЙ В БОЙ", fightText:"Выбирай уровень на карте и отправляйся в сражение. Атакуй врагов и используй способности героев.",
    upgrade:"ПРОКАЧИВАЙ ГЕРОЕВ", upgradeText:"Используй Coins, Gems и другие ресурсы, чтобы повышать уровень и силу героев.",
    worlds:"ПРОХОДИ МИРЫ", worldsText:"Побеждай врагов и открывай новые уровни. Чем дальше ты продвигаешься, тем сильнее противники.",
    rewardsTextTitle:"ПОЛУЧАЙ НАГРАДЫ", rewardsText:"Зарабатывай Coins, Gems, XP, фрагменты и билеты за победы, задания и достижения.",
    bestTeam:"СОБЕРИ ЛУЧШУЮ КОМАНДУ", bestTeamText:"Комбинируй разных героев и находи самые сильные тактики для победы.",
    goal:"ТВОЯ ЦЕЛЬ", goalText:"Победить всех врагов → прокачать героев → открыть все миры → собрать сильнейшую команду.",
    start:"НАЧАТЬ ИГРУ", world:"Мир", stage:"Уровень", locked:"ЗАБЛОКИРОВАНО",
    energyInfo:"−3 Energy за бой", boss:"БОСС", miniBoss:"МИНИ-БОСС",
    shopTitle:"МАГАЗИН", gemsShop:"GEMS", chestShop:"СУНДУКИ", energyShop:"ENERGY",
    premiumShop:"PREMIUM", buy:"КУПИТЬ", gram:"GRAM", payGram:"ОПЛАТИТЬ GRAM",
    payUsdt:"ОПЛАТИТЬ USDT", usdt:"USDT (BEP20)", gramTon:"GRAM (TON)",
    noBackend:"Backend ещё не подключён. Демо-покупка не списывает реальные деньги.",
    demoBought:"Демо-покупка выполнена", notEnough:"Недостаточно ресурсов",
    energyFull:"Energy уже полностью восстановлена", battleWin:"Победа! Награда получена.",
    battleLose:"Поражение. Попробуй ещё раз.", firstClear:"Первое прохождение",
    basic:"Basic", rare:"Rare", epic:"Epic", legendary:"Legendary",
    common:"Common", mythic:"Mythic", chest:"Сундук", hero:"Герой",
    starter:"Starter Pack", pass:"Hero Clash Pass", premiumPass:"Premium Pass",
    profileTitle:"ПРОФИЛЬ", stats:"СТАТИСТИКА", battles:"Боёв", wins:"Побед",
    back:"НАЗАД", claim:"ЗАБРАТЬ", daily:"DAILY QUEST", coming:"СКОРО",
    settingsTitle:"НАСТРОЙКИ", russian:"Русский", english:"English",
    chooseLanguage:"Выбери язык игры", languageSaved:"Язык сохранён",
    worldBoss:"WORLD BOSS", mini:"MINI BOSS"
  },
  en: {
    play:"Play", heroes:"Heroes", map:"Map", shop:"Shop", rewards:"Rewards",
    profile:"Profile", settings:"Settings", battle:"Battle", attack:"Attack",
    skill:"Skill", victory:"Victory", defeat:"Defeat", continue:"Continue",
    coins:"Coins", gems:"Gems", energy:"Energy", xp:"XP", level:"Level",
    power:"Power", fragments:"Fragments", tickets:"Tickets", premium:"Premium",
    howto:"How to Play", details:"MORE", language:"LANGUAGE",
    welcome:"Welcome to HERO CLASH!",
    compact:"Collect heroes → fight → upgrade → unlock worlds → earn rewards.",
    howTitle:"HOW TO PLAY",
    howIntro:"Your goal is to build a powerful team, defeat enemies, clear stages and become stronger with every battle.",
    team:"BUILD YOUR TEAM", teamText:"Collect new heroes and build your own team. Every hero has unique stats, abilities and playstyle.",
    fight:"ENTER BATTLE", fightText:"Choose a stage on the map and enter combat. Attack enemies and use your heroes' abilities.",
    upgrade:"UPGRADE HEROES", upgradeText:"Use Coins, Gems and other resources to increase hero level and power.",
    worlds:"CLEAR WORLDS", worldsText:"Defeat enemies and unlock new stages. The farther you go, the stronger the enemies become.",
    rewardsTextTitle:"EARN REWARDS", rewardsText:"Earn Coins, Gems, XP, fragments and tickets from victories, quests and achievements.",
    bestTeam:"BUILD THE BEST TEAM", bestTeamText:"Combine different heroes and find the strongest tactics for victory.",
    goal:"YOUR GOAL", goalText:"Defeat all enemies → upgrade heroes → unlock every world → build the strongest team.",
    start:"START GAME", world:"World", stage:"Stage", locked:"LOCKED",
    energyInfo:"−3 Energy per battle", boss:"BOSS", miniBoss:"MINI BOSS",
    shopTitle:"SHOP", gemsShop:"GEMS", chestShop:"CHESTS", energyShop:"ENERGY",
    premiumShop:"PREMIUM", buy:"BUY", gram:"GRAM", payGram:"PAY WITH GRAM",
    payUsdt:"PAY WITH USDT", usdt:"USDT (BEP20)", gramTon:"GRAM (TON)",
    noBackend:"Backend is not connected yet. Demo purchases do not charge real money.",
    demoBought:"Demo purchase completed", notEnough:"Not enough resources",
    energyFull:"Energy is already full", battleWin:"Victory! Reward received.",
    battleLose:"Defeat. Try again.", firstClear:"First Clear",
    basic:"Basic", rare:"Rare", epic:"Epic", legendary:"Legendary",
    common:"Common", mythic:"Mythic", chest:"Chest", hero:"Hero",
    starter:"Starter Pack", pass:"Hero Clash Pass", premiumPass:"Premium Pass",
    profileTitle:"PROFILE", stats:"STATS", battles:"Battles", wins:"Wins",
    back:"BACK", claim:"CLAIM", daily:"DAILY QUEST", coming:"COMING SOON",
    settingsTitle:"SETTINGS", russian:"Русский", english:"English",
    chooseLanguage:"Choose game language", languageSaved:"Language saved",
    worldBoss:"WORLD BOSS", mini:"MINI BOSS"
  }
};

function t(key){ return I18N[state.lang]?.[key] ?? I18N.en[key] ?? key; }

const defaultState = {
  lang:"ru", screen:"home", coins:500, gems:50, energy:30, xp:0, level:1,
  wins:0, battles:0, fragments:0, tickets:1, currentWorld:1, currentStage:1,
  cleared:{}, heroLevels:{lumi:1,roxy:1,nox:1,blitz:1},
  energyPurchasesToday:0, lastEnergyTick:Date.now()
};

let state = loadState();
let battle = null;

function loadState(){
  try {
    const saved = JSON.parse(localStorage.getItem(STATE_KEY) || "null");
    return {...defaultState, ...(saved || {}), lang:localStorage.getItem(LANG_KEY) || saved?.lang || "ru"};
  } catch { return {...defaultState}; }
}
function saveState(){
  state.lastEnergyTick = Date.now();
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}
function tickEnergy(){
  const now = Date.now();
  const last = Number(state.lastEnergyTick || now);
  const gained = Math.floor((now-last)/60000/ECONOMY.energy.regenMinutes);
  if(gained>0 && state.energy<ECONOMY.energy.max){
    state.energy = Math.min(ECONOMY.energy.max, state.energy+gained);
    state.lastEnergyTick = now;
    saveState();
  }
}
setInterval(()=>{ tickEnergy(); if(state.screen==="home") render(); },30000);

function setLang(lang){
  state.lang = lang === "en" ? "en" : "ru";
  localStorage.setItem(LANG_KEY,state.lang);
  saveState();
  document.documentElement.lang = state.lang;
  render();
  toast(t("languageSaved"));
}

function toast(msg){
  const el=document.querySelector("#toast");
  if(!el)return;
  el.textContent=msg; el.classList.add("show");
  clearTimeout(window.__toast); window.__toast=setTimeout(()=>el.classList.remove("show"),2200);
}

function fmt(n){ return new Intl.NumberFormat(state.lang==="ru"?"ru-RU":"en-US").format(Math.floor(n)); }

function rarityKey(r){ return r.toLowerCase().replace(/\s+/g,""); }
function rarityName(r){
  const map={Common:"common",Rare:"rare",Epic:"epic",Legendary:"legendary",Mythic:"mythic"};
  return t(map[r]||r);
}

function nav(screen){ state.screen=screen; saveState(); render(); window.scrollTo({top:0,behavior:"smooth"}); }

function layout(content, active="home"){
  const navItems=[
    ["home","⌂",t("play")],["map","◈",t("map")],["heroes","✦",t("heroes")],
    ["shop","◇",t("shop")],["profile","◎",t("profile")]
  ];
  return `
  <div class="shell">
    <header class="topbar">
      <div class="brand">HERO <span>CLASH</span></div>
      <button class="icon-btn" data-action="settings">⚙</button>
    </header>
    ${content}
    <nav class="bottom-nav">
      ${navItems.map(([id,ic,label])=>`<button class="${active===id?"active":""}" data-nav="${id}"><b>${ic}</b><small>${label}</small></button>`).join("")}
    </nav>
  </div>`;
}

function render(){
  tickEnergy();
  document.documentElement.lang=state.lang;
  const app=document.querySelector("#app");
  if(state.screen==="home") app.innerHTML=layout(home(),"home");
  else if(state.screen==="howto") app.innerHTML=layout(howto(),"home");
  else if(state.screen==="map") app.innerHTML=layout(mapScreen(),"map");
  else if(state.screen==="heroes") app.innerHTML=layout(heroes(),"heroes");
  else if(state.screen==="shop") app.innerHTML=layout(shop(),"shop");
  else if(state.screen==="profile") app.innerHTML=layout(profile(),"profile");
  else if(state.screen==="settings") app.innerHTML=layout(settings(),"home");
  else if(state.screen==="battle") app.innerHTML=layout(battleScreen(),"map");
  else if(state.screen==="result") app.innerHTML=layout(resultScreen(),"map");
  bind();
}

function home(){
  return `
  <main class="page">
    <section class="hero-card">
      <div class="hero-glow"></div>
      <div class="eyebrow">HERO CLASH</div>
      <h1>${t("welcome")}</h1>
      <p>${t("compact")}</p>
      <button class="primary" data-action="start">${t("start")} ⚔</button>
    </section>

    <section class="stats-grid">
      ${stat("🪙",fmt(state.coins),t("coins"))}
      ${stat("💎",fmt(state.gems),t("gems"))}
      ${stat("⚡",`${state.energy}/${ECONOMY.energy.max}`,t("energy"))}
      ${stat("⭐",fmt(state.xp),t("xp"))}
    </section>

    <section class="how-compact">
      <div class="section-head"><h2>📖 ${t("howto")}</h2><button data-action="howto">${t("details")}</button></div>
      <p>${t("compact")}</p>
    </section>

    <section class="menu-grid">
      <button data-nav="heroes"><span>🦸</span>${t("heroes")}</button>
      <button data-nav="map"><span>🗺️</span>${t("map")}</button>
      <button data-nav="shop"><span>💎</span>${t("shop")}</button>
      <button data-nav="profile"><span>👤</span>${t("profile")}</button>
    </section>
  </main>`;
}

function stat(icon,value,label){ return `<div class="stat"><span>${icon}</span><strong>${value}</strong><small>${label}</small></div>`; }

function howto(){
  const items=[
    ["🦸",t("team"),t("teamText")],["⚔️",t("fight"),t("fightText")],
    ["🔥",t("upgrade"),t("upgradeText")],["🗺️",t("worlds"),t("worldsText")],
    ["🎁",t("rewardsTextTitle"),t("rewardsText")],["👑",t("bestTeam"),t("bestTeamText")]
  ];
  return `<main class="page">
    <button class="back" data-nav="home">← ${t("back")}</button>
    <section class="panel"><div class="eyebrow">${t("howto")}</div><h1>${t("howTitle")}</h1><p>${t("howIntro")}</p></section>
    <div class="how-list">${items.map((x,i)=>`<article class="how-item"><div class="how-num">${i+1}</div><div class="how-icon">${x[0]}</div><div><h3>${x[1]}</h3><p>${x[2]}</p></div></article>`).join("")}</div>
    <section class="goal"><div>🎯</div><h2>${t("goal")}</h2><p>${t("goalText")}</p></section>
    <button class="primary full" data-action="start">${t("start")} ⚔</button>
  </main>`;
}

function mapScreen(){
  const worlds=ECONOMY.worlds;
  return `<main class="page">
    <div class="section-head"><div><div class="eyebrow">${t("map")}</div><h1>${t("world")}</h1></div><div class="pill">⚡ ${state.energy}/${ECONOMY.energy.max}</div></div>
    <div class="world-list">${worlds.map(w=>{
      const unlocked=w.id<=state.currentWorld;
      const boss=w.id%1===0;
      return `<article class="world-card ${unlocked?"":"locked"}">
        <div class="world-number">${String(w.id).padStart(2,"0")}</div>
        <div class="world-info"><h3>${t("world")} ${w.id}</h3><p>20 ${t("stage")} · 🪙 ${fmt(w.coinsMin)}–${fmt(w.coinsMax)}</p></div>
        ${unlocked?`<button data-world="${w.id}">${t("play")}</button>`:`<span class="lock">🔒</span>`}
      </article>`;
    }).join("")}</div>
  </main>`;
}

function heroes(){
  return `<main class="page">
    <div class="section-head"><div><div class="eyebrow">${t("heroes")}</div><h1>${t("heroes")}</h1></div><div class="pill">Lv.${ECONOMY.heroLevelCap}</div></div>
    <div class="hero-list">${HEROES.map(h=>{
      const lv=state.heroLevels[h.id]||1;
      return `<article class="hero-card ${h.color}">
        <div class="hero-art">${h.icon}</div>
        <div class="hero-info"><h2>${h.name}</h2><span class="rarity">${rarityName(h.rarity)}</span><p>Lv.${lv}</p><div class="bar"><i style="width:${Math.min(100,lv*2)}%"></i></div></div>
        <button data-upgrade="${h.id}">+ ${t("upgrade")}</button>
      </article>`;
    }).join("")}</div>
  </main>`;
}

function shop(){
  const gemCards=ECONOMY.gems.map(x=>`
    <article class="product"><div class="product-icon">💎</div><div><h3>${fmt(x.gems)} Gems</h3><p>${x.gram} ${t("gram")}</p></div><button data-product="${x.id}">${t("buy")}</button></article>`).join("");
  const chestCards=ECONOMY.chests.map(x=>`
    <article class="product"><div class="product-icon">🎁</div><div><h3>${t(x.key)} ${t("chest")}</h3><p>${x.gram} ${t("gram")}</p></div><button data-product="${x.id}">${t("buy")}</button></article>`).join("");
  const energyCards=ECONOMY.energyPacks.map(x=>`
    <article class="product"><div class="product-icon">⚡</div><div><h3>${t(x.id==="energy_full"?"energy":"energy")} ${x.full?"MAX":"+"+x.amount}</h3><p>${x.gram} ${t("gram")}</p></div><button data-product="${x.id}">${t("buy")}</button></article>`).join("");
  return `<main class="page">
    <div class="section-head"><div class="eyebrow">${t("shopTitle")}</div><div class="pill">💎 ${fmt(state.gems)}</div></div>
    <section class="shop-section"><h2>💎 ${t("gemsShop")}</h2>${gemCards}</section>
    <section class="shop-section"><h2>🎁 ${t("chestShop")}</h2>${chestCards}</section>
    <section class="shop-section"><h2>⚡ ${t("energyShop")}</h2>${energyCards}</section>
    <section class="shop-section"><h2>🔥 ${t("premiumShop")}</h2>
      <article class="premium-product"><div><h2>HERO CLASH PASS</h2><p>30 days · ${t("premium")}</p></div><strong>20–25 GRAM</strong><button data-product="premium_pass">${t("buy")}</button></article>
      <article class="premium-product"><div><h2>STARTER PACK</h2><p>500 Gems · 5,000 Coins · 100 Energy · Rare Hero · Rare Chest</p></div><strong>5 GRAM</strong><button data-product="starter_pack">${t("buy")}</button></article>
    </section>
    <section class="wallet-note"><b>${t("gramTon")}</b><small>UQAZ3funj_qRm0ZN6N6KK35zSL4gYPkxRjTX_QsOKi_8oRBw</small><b>${t("usdt")}</b><small>0xa3CD09200F8A0e8dBd27e0dE56a1B1CF9b14EbD2</small></section>
  </main>`;
}

function profile(){
  return `<main class="page"><section class="panel profile">
    <div class="avatar">HC</div><div class="eyebrow">${t("profileTitle")}</div><h1>Player</h1>
    <div class="stats-grid">
      ${stat("⭐",state.level,t("level"))}${stat("⚔️",state.battles,t("battles"))}${stat("🏆",state.wins,t("wins"))}${stat("🧩",state.fragments,t("fragments"))}
    </div>
  </section>
  <section class="panel"><h2>${t("daily")}</h2><p>3 battles → 100 Gems</p><p>5 enemy wins → 200 Gems</p><p>Upgrade hero → 300 Coins</p><p>Open chest → 100 Gems</p></section>
  </main>`;
}

function settings(){
  return `<main class="page"><button class="back" data-nav="home">← ${t("back")}</button>
    <section class="panel"><div class="eyebrow">${t("settingsTitle")}</div><h1>${t("language")}</h1><p>${t("chooseLanguage")}</p>
      <div class="lang-grid">
        <button class="${state.lang==="ru"?"selected":""}" data-lang="ru">🇷🇺 ${t("russian")}</button>
        <button class="${state.lang==="en"?"selected":""}" data-lang="en">🇬🇧 ${t("english")}</button>
      </div>
    </section>
  </main>`;
}

function battleScreen(){
  if(!battle) return mapScreen();
  return `<main class="page">
    <div class="battle-top"><span>WORLD ${battle.world} · ${t("stage")} ${battle.stage}</span><span>⚡ ${state.energy}</span></div>
    <section class="arena">
      <div class="fighter enemy"><div class="fighter-art">☠</div><h2>VOID ENEMY</h2><div class="hp"><i style="width:${battle.enemyHp/battle.enemyMax*100}%"></i></div><small>${Math.max(0,battle.enemyHp)} / ${battle.enemyMax} HP</small></div>
      <div class="vs">VS</div>
      <div class="fighter player"><div class="fighter-art">✦</div><h2>LUMI</h2><div class="hp"><i style="width:${battle.heroHp/battle.heroMax*100}%"></i></div><small>${Math.max(0,battle.heroHp)} / ${battle.heroMax} HP</small></div>
    </section>
    <section class="battle-actions">
      <button class="attack-btn" data-action="attack">${t("attack")} ⚔</button>
      <button data-action="skill">Skill 1 🔥</button><button data-action="skill">Skill 2 ❄</button>
      <button data-action="skill">Skill 3 ⚡</button><button data-action="skill">Ultimate 💥</button>
    </section>
  </main>`;
}

function resultScreen(){
  const win=battle?.won;
  return `<main class="page result"><div class="result-icon">${win?"🏆":"💀"}</div><div class="eyebrow">${win?t("victory"):t("defeat")}</div><h1>${win?t("battleWin"):t("battleLose")}</h1>
  ${win?`<div class="reward-box"><b>🪙 +${fmt(battle.reward.coins)}</b><b>💎 +${battle.reward.gems}</b><b>⭐ +${battle.reward.xp}</b>${battle.first?`<b>🎁 +${t("firstClear")}</b>`:""}</div>`:""}
  <button class="primary full" data-action="continue">${t("continue")}</button></main>`;
}

function startBattle(world=state.currentWorld){
  if(state.energy<ECONOMY.energy.battleCost){ toast(t("notEnough")); return; }
  state.energy-=ECONOMY.energy.battleCost;
  const stage = state.currentStage;
  const base=ECONOMY.worlds[world-1]||ECONOMY.worlds[0];
  const enemyMax=500+world*350+stage*80;
  battle={world,stage,enemyHp:enemyMax,enemyMax,heroHp:1000,heroMax:1000,went:false,won:false,
    reward:{coins:Math.floor(base.coinsMin+Math.random()*(base.coinsMax-base.coinsMin+1)),gems:2+Math.floor(Math.random()*4),xp:20+world*5},
    first:!state.cleared[`${world}-${stage}`]};
  state.battles++; saveState(); nav("battle");
}

function doAttack(mult=1){
  if(!battle)return;
  const damage=Math.floor((120+Math.random()*80)*mult);
  battle.enemyHp-=damage;
  if(battle.enemyHp<=0){
    battle.enemyHp=0; battle.won=true;
    state.wins++; state.coins+=battle.reward.coins; state.gems+=battle.reward.gems; state.xp+=battle.reward.xp;
    if(battle.first){state.gems+=10; state.fragments+=1; state.cleared[`${battle.world}-${battle.stage}`]=true;}
    if(state.xp>=100){state.xp-=100;state.level++;}
    if(battle.stage%20===0){battle.reward.gems+=25; state.gems+=25;}
    else if(battle.stage%5===0){battle.reward.gems+=5; state.gems+=5;}
    saveState(); nav("result"); return;
  }
  const enemyDamage=70+Math.floor(Math.random()*50);
  battle.heroHp-=enemyDamage;
  if(battle.heroHp<=0){ battle.heroHp=0; battle.won=false; saveState(); nav("result"); return; }
  render();
}

function upgradeHero(id){
  const lv=state.heroLevels[id]||1;
  if(lv>=ECONOMY.heroLevelCap){toast("MAX");return;}
  const cost=Math.max(100,Math.floor(100*Math.pow(1.35,lv-1)));
  if(state.coins<cost){toast(t("notEnough"));return;}
  state.coins-=cost;state.heroLevels[id]=lv+1;saveState();render();
}

async function createOrder(productId, method){
  if(!API_BASE){ toast(t("noBackend")); return; }
  try{
    const r=await fetch(`${API_BASE}/api/order/create`,{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({productId,method})
    });
    const data=await r.json();
    if(!r.ok) throw new Error(data.error||"Order error");
    localStorage.setItem("hero_clash_order",JSON.stringify(data));
    alert(`${method==="GRAM"?t("payGram"):t("payUsdt")}\n${data.amount} ${data.currency}\n\nOrder: ${data.orderId}`);
  }catch(e){toast(e.message||"Payment error");}
}

function buyProduct(productId){
  if(productId==="energy_10"||productId==="energy_30"||productId==="energy_full"){
    const p=ECONOMY.energyPacks.find(x=>x.id===productId);
    if(state.energyPurchasesToday>=ECONOMY.energy.dailyPurchases){toast(t("notEnough"));return;}
    if(p.full) state.energy=ECONOMY.energy.max; else state.energy=Math.min(ECONOMY.energy.max,state.energy+p.amount);
    state.energyPurchasesToday++;saveState();toast(t("demoBought"));render();return;
  }
  createOrder(productId,"GRAM");
}

function bind(){
  document.querySelectorAll("[data-nav]").forEach(b=>b.onclick=()=>nav(b.dataset.nav));
  document.querySelectorAll("[data-action]").forEach(b=>b.onclick=()=>{
    const a=b.dataset.action;
    if(a==="settings")nav("settings");
    if(a==="howto")nav("howto");
    if(a==="start")startBattle(state.currentWorld);
    if(a==="attack")doAttack(1);
    if(a==="skill")doAttack(1.6);
    if(a==="continue")nav("map");
  });
  document.querySelectorAll("[data-lang]").forEach(b=>b.onclick=()=>setLang(b.dataset.lang));
  document.querySelectorAll("[data-world]").forEach(b=>b.onclick=()=>startBattle(Number(b.dataset.world)));
  document.querySelectorAll("[data-upgrade]").forEach(b=>b.onclick=()=>upgradeHero(b.dataset.upgrade));
  document.querySelectorAll("[data-product]").forEach(b=>b.onclick=()=>buyProduct(b.dataset.product));
}

if(window.Telegram?.WebApp){
  Telegram.WebApp.ready();
  Telegram.WebApp.expand();
}
render();
