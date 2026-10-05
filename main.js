/* HERO CLASH v1.0
   Economy + RU/EN foundation.
   Backend is optional for local/demo play, but REQUIRED for real payments
   and authoritative Coins/Gems/Energy/XP in production.
*/

const API_BASE = (window.HERO_CLASH_API || localStorage.getItem("hero_clash_api") || "").replace(/\/$/, "");
const TG = window.Telegram?.WebApp || null;
let sessionToken = localStorage.getItem("hero_clash_session") || "";
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
  {id:"lumi", name:"Lumi", rarity:"Rare", icon:"assets/heroes/lumi.svg", color:"cyan"},
  {id:"roxy", name:"Roxy", rarity:"Epic", icon:"assets/heroes/roxy.svg", color:"pink"},
  {id:"nox", name:"Nox", rarity:"Legendary", icon:"assets/heroes/nox.svg", color:"purple"},
  {id:"blitz", name:"Blitz", rarity:"Legendary", icon:"assets/heroes/blitz.svg", color:"gold"}
];

const SHOP_HEROES = [
  {id:"hero_lumi", hero:"lumi", name:"Lumi", rarity:"Rare", gram:15, icon:"assets/heroes/lumi.svg"},
  {id:"hero_roxy", hero:"roxy", name:"Roxy", rarity:"Epic", gram:35, icon:"assets/heroes/roxy.svg"},
  {id:"hero_nox", hero:"nox", name:"Nox", rarity:"Legendary", gram:80, icon:"assets/heroes/nox.svg"},
  {id:"hero_blitz_limited", hero:"blitz", name:"Blitz — Void Limited", rarity:"Limited Legendary", gram:120, icon:"assets/heroes/blitz.svg"}
];

const SHOP_PREMIUM = [
  {id:"starter_pack", titleKey:"starterPackTitle", descKey:"starterPackDesc", gram:5, icon:"🚀"},
  {id:"weekly_pack", titleKey:"weeklyPackTitle", descKey:"weeklyPackDesc", gram:15, icon:"⚡"},
  {id:"premium_pass", titleKey:"premiumPassTitle", descKey:"premiumPassDesc", gram:25, icon:"👑"},
  {id:"season_pack", titleKey:"seasonPackTitle", descKey:"seasonPackDesc", gram:50, icon:"🌌"}
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
    shopSubtitle:"Премиальные товары без Pay-to-Win",
    featuredOffer:"ЛИМИТИРОВАННОЕ ПРЕДЛОЖЕНИЕ",
    gemsBonus:"БОНУС", chestBasicDesc:"Coins, Gems, XP и шанс получить Rare Hero.", chestRareDesc:"Больше ресурсов и высокий шанс Rare Hero.",
    chestEpicDesc:"Много ресурсов и шанс получить Epic Hero.", chestLegendaryDesc:"Гарантированно Epic Hero или выше.",
    energy10Desc:"+10 Energy", energy30Desc:"+30 Energy", energyFullDesc:"Полное восстановление Energy",
    heroShopTitle:"ГЕРОИ", premiumPackTitle:"PREMIUM", cosmeticsTitle:"COSMETICS", limited:"LIMITED",
    limitedDesc:"Эксклюзивный герой на ограниченный срок.", rareHeroDesc:"Rare Hero · Level 1", epicHeroDesc:"Epic Hero · Level 1",
    legendaryHeroDesc:"Legendary Hero · Level 1", limitedLegendaryDesc:"Limited Legendary · уникальный стиль",
    starterPackTitle:"STARTER PACK", starterPackDesc:"500 Gems · 5,000 Coins · Rare Hero · Rare Chest",
    weeklyPackTitle:"WEEKLY PACK", weeklyPackDesc:"1,500 Gems · 25,000 Coins · 2 Rare Chests · Energy",
    premiumPassTitle:"PREMIUM PASS", premiumPassDesc:"30 дней · усиленная сезонная дорожка · эксклюзивные награды",
    seasonPackTitle:"MONTHLY / SEASON PACK", seasonPackDesc:"7,500 Gems · 150,000 Coins · Epic + Legendary Chest",
    cosmeticsDesc:"Скины, рамки, эффекты и анимации — без влияния на баланс.",
    paymentChoose:"ВЫБЕРИ СПОСОБ ОПЛАТЫ", payGramShort:"GRAM", payUsdtShort:"USDT BEP20",
    usdtPricePending:"Цена USDT настраивается сервером",
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
    shopSubtitle:"Premium products without Pay-to-Win",
    featuredOffer:"LIMITED OFFER",
    gemsBonus:"BONUS", chestBasicDesc:"Coins, Gems, XP and a chance to get a Rare Hero.", chestRareDesc:"More resources and a high Rare Hero chance.",
    chestEpicDesc:"Large rewards and a chance to get an Epic Hero.", chestLegendaryDesc:"Guaranteed Epic Hero or higher.",
    energy10Desc:"+10 Energy", energy30Desc:"+30 Energy", energyFullDesc:"Fully restore Energy",
    heroShopTitle:"HEROES", premiumPackTitle:"PREMIUM", cosmeticsTitle:"COSMETICS", limited:"LIMITED",
    limitedDesc:"Exclusive hero available for a limited time.", rareHeroDesc:"Rare Hero · Level 1", epicHeroDesc:"Epic Hero · Level 1",
    legendaryHeroDesc:"Legendary Hero · Level 1", limitedLegendaryDesc:"Limited Legendary · unique style",
    starterPackTitle:"STARTER PACK", starterPackDesc:"500 Gems · 5,000 Coins · Rare Hero · Rare Chest",
    weeklyPackTitle:"WEEKLY PACK", weeklyPackDesc:"1,500 Gems · 25,000 Coins · 2 Rare Chests · Energy",
    premiumPassTitle:"PREMIUM PASS", premiumPassDesc:"30 days · boosted seasonal track · exclusive rewards",
    seasonPackTitle:"MONTHLY / SEASON PACK", seasonPackDesc:"7,500 Gems · 150,000 Coins · Epic + Legendary Chest",
    cosmeticsDesc:"Skins, frames, effects and animations — no gameplay advantage.",
    paymentChoose:"CHOOSE PAYMENT METHOD", payGramShort:"GRAM", payUsdtShort:"USDT BEP20",
    usdtPricePending:"USDT price is configured by the server",
    payUsdt:"PAY WITH USDT", usdt:"USDT (BEP20)", gramTon:"GRAM (TON)",
    noBackend:"Backend is not connected yet. Demo purchases do not charge real money.",
    demoBought:"Demo purchase completed", notEnough:"Not enough resources",
    energyFull:"Energy is already full", battleWin:"Victory! Reward received.",
    battleLose:"Defeat. Try again.", firstClear:"First Clear",
    basic:"Basic", rare:"Rare", epic:"Epic", legendary:"Legendary",
    common:"Common", mythic:"Mythic", chest:"Chest", hero:"Hero",
    starter:"Starter Pack", pass:"Hero Clash Pass", premiumPass:"Premium Pass",
    profileTitle:"PROFILE", stats:"STATS", battles:"Battles", wins:"Wins",
    referral:"REFERRAL PROGRAM", referralText:"Invite players and earn bonuses from their purchases.", referrals:"Referrals", referralEarned:"Earned", referralLink:"Your link", copy:"COPY", copied:"Link copied",
    wallet:"WALLET", connectWallet:"CONNECT WALLET", payment:"PAYMENT", waitingPayment:"Waiting for payment confirmation…", paymentCreated:"Order created. Finish the payment in your wallet.", paymentSuccess:"Payment confirmed! Item delivered.", paymentFailed:"Payment not found or expired.",
    referral:"РЕФЕРАЛЬНАЯ ПРОГРАММА", referralText:"Приглашай игроков и получай бонусы за их покупки.", referrals:"Рефералы", referralEarned:"Заработано", referralLink:"Твоя ссылка", copy:"СКОПИРОВАТЬ", copied:"Ссылка скопирована",
    wallet:"КОШЕЛЁК", connectWallet:"ПОДКЛЮЧИТЬ КОШЕЛЁК", payment:"ОПЛАТА", waitingPayment:"Ожидаем подтверждение платежа…", paymentCreated:"Заказ создан. Заверши оплату в кошельке.", paymentSuccess:"Оплата подтверждена! Товар выдан.", paymentFailed:"Платёж не найден или истёк.",
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
  chests:{basic:0,rare:0,epic:0,legendary:0},
  energyPurchasesToday:0, lastEnergyTick:Date.now(), telegramUser:null, referrals:0, referralEarned:0
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


async function api(path, options={}){
  if(!API_BASE) throw new Error(t("noBackend"));
  const headers={"Content-Type":"application/json",...(options.headers||{})};
  if(sessionToken) headers.Authorization=`Bearer ${sessionToken}`;
  const r=await fetch(`${API_BASE}${path}`,{...options,headers});
  const data=await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(data.error||"Server error");
  return data;
}

async function loginToServer(){
  if(!API_BASE || !TG?.initData) return;
  try{
    const data=await api("/api/auth/login",{
      method:"POST",
      body:JSON.stringify({initData:TG.initData, startParam:TG.initDataUnsafe?.start_param||""})
    });
    sessionToken=data.token;
    localStorage.setItem("hero_clash_session",sessionToken);
    state.telegramUser=data.user;
    state.referrals=data.referrals||0;
    state.referralEarned=data.referralEarned||0;
    saveState();
    await syncServerState();
  }catch(e){
    console.warn("Hero Clash auth:",e);
  }
}

async function syncServerState(){
  if(!sessionToken) return;
  try{
    const data=await api("/api/me");
    if(data.user) state.telegramUser=data.user;
    state.referrals=data.referrals||0;
    state.referralEarned=data.referralEarned||0;
    if(data.game){
      Object.assign(state,data.game);
      saveState();
    }
  }catch(e){ console.warn("Hero Clash sync:",e); }
}

async function copyReferral(){
  const link=state.telegramUser?.referralLink;
  if(!link){toast(t("noBackend"));return;}
  try{
    await navigator.clipboard.writeText(link);
    toast(t("copied"));
  }catch{
    prompt(t("referralLink"),link);
  }
}

async function payOrder(productId, method){
  if(!API_BASE){toast(t("noBackend"));return;}
  try{
    const order=await api("/api/order/create",{
      method:"POST",
      body:JSON.stringify({productId,method})
    });
    showPayment(order);
  }catch(e){toast(e.message||"Payment error");}
}

let paymentPoll=null;
function showPayment(order){
  const modal=document.createElement("div");
  modal.className="payment-modal";
  const gram=order.method==="GRAM";
  modal.innerHTML=`
    <div class="payment-sheet">
      <button class="payment-close" id="payment-close">×</button>
      <div class="eyebrow">${t("payment")}</div>
      <h2>${order.productName}</h2>
      <div class="payment-amount">${order.amount} ${order.currency}</div>
      ${gram?`<div id="ton-connect-pay"></div>
        <button class="primary full" id="pay-gram-btn">${t("payGram")}</button>
        <p class="payment-note">${t("paymentCreated")}</p>`
      :`<div class="pay-address">${order.address}</div>
        <button class="primary full" id="copy-usdt">${t("copy")}</button>
        <p class="payment-note">USDT BEP20 · ${order.amount} USDT</p>`}
      <div class="payment-status" id="payment-status">${t("waitingPayment")}</div>
    </div>`;
  document.body.appendChild(modal);
  document.getElementById("payment-close").onclick=()=>{clearInterval(paymentPoll);modal.remove();};

  if(gram) initTonPayment(order);
  else document.getElementById("copy-usdt").onclick=async()=>{
    try{await navigator.clipboard.writeText(order.address);toast(t("copied"));}catch{}
  };

  paymentPoll=setInterval(async()=>{
    try{
      const s=await api(`/api/order/${encodeURIComponent(order.orderId)}`);
      if(s.status==="paid"){
        clearInterval(paymentPoll);
        document.getElementById("payment-status").textContent=t("paymentSuccess");
        await syncServerState();
        render();
      }else if(s.status==="expired"||s.status==="cancelled"){
        clearInterval(paymentPoll);
        document.getElementById("payment-status").textContent=t("paymentFailed");
      }
    }catch{}
  },5000);
}

async function initTonPayment(order){
  if(!window.TON_CONNECT_UI){toast("TON Connect не загрузился");return;}
  try{
    if(!window.__tonUI){
      window.__tonUI=new TON_CONNECT_UI.TonConnectUI({
        manifestUrl:`${location.origin}/tonconnect-manifest.json`,
        buttonRootId:"ton-connect-pay"
      });
      window.__tonUI.uiOptions={language:state.lang==="ru"?"ru":"en",uiPreferences:{theme:"DARK",borderRadius:"m"}};
    }
    const ui=window.__tonUI;
    const send=async()=>{
      if(!ui.wallet){await ui.openModal();return;}
      try{
        await ui.sendTransaction({
          validUntil:Math.floor(Date.now()/1000)+600,
          messages:[{
            address:order.address,
            amount:String(order.amountNano),
            payload:order.commentPayload
          }]
        });
      }catch(e){toast(e?.message||"Transaction cancelled");}
    };
    document.getElementById("pay-gram-btn").onclick=send;
  }catch(e){console.error(e);}
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
      ${stat("⚡",fmt(state.xp),t("xp"))}
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
        <div class="hero-art"><img src="${h.icon}" alt="${escapeHtml(h.name)}"></div>
        <div class="hero-info"><h2>${h.name}</h2><span class="rarity">${rarityName(h.rarity)}</span><p>Lv.${lv}</p><div class="bar"><i style="width:${Math.min(100,lv*2)}%"></i></div></div>
        <button data-upgrade="${h.id}">+ ${t("upgrade")}</button>
      </article>`;
    }).join("")}</div>
  </main>`;
}

function shop(){
  const gemCards=ECONOMY.gems.map((x,i)=>{const bonus=[0,10,20,40,50,60][i];return `<article class="shop-card product"><div class="product-icon">💎</div><div class="product-main"><div class="product-title">${fmt(x.gems)} ${t("gems")}</div>${bonus?`<span class="shop-badge">${t("gemsBonus")} +${bonus}%</span>`:""}<p>${x.gram} ${t("gram")}</p></div><button data-product="${x.id}">${t("buy")}</button></article>`}).join("");
  const cd={basic:"chestBasicDesc",rare:"chestRareDesc",epic:"chestEpicDesc",legendary:"chestLegendaryDesc"};
  const chestCards=ECONOMY.chests.map(x=>`<article class="shop-card product"><div class="product-icon">🎁</div><div class="product-main"><div class="product-title">${t(x.key)} ${t("chest")}</div><p>${t(cd[x.key])}</p><strong>${x.gram} ${t("gram")}</strong></div><button data-product="${x.id}">${t("buy")}</button></article>`).join("");
  const energyCards=ECONOMY.energyPacks.map(x=>{const k=x.id==="energy_10"?"energy10Desc":x.id==="energy_30"?"energy30Desc":"energyFullDesc";return `<article class="shop-card product"><div class="product-icon">⚡</div><div class="product-main"><div class="product-title">${t(k)}</div><p>${x.gram} ${t("gram")}</p></div><button data-product="${x.id}">${t("buy")}</button></article>`}).join("");
  const heroCards=SHOP_HEROES.map(h=>{const d=h.rarity==="Rare"?"rareHeroDesc":h.rarity==="Epic"?"epicHeroDesc":h.rarity==="Legendary"?"legendaryHeroDesc":"limitedLegendaryDesc";return `<article class="shop-card hero-shop-card rarity-${h.rarity.toLowerCase().replace(/\s+/g,"-")}"><div class="hero-shop-art"><img src="${h.icon}" alt="${escapeHtml(h.name)}"></div><div class="product-main"><div class="product-title">${h.name}</div><span class="rarity">${h.rarity}</span><p>${t(d)}</p></div><div class="shop-price">${h.gram} ${t("gram")}</div><button data-product="${h.id}">${t("buy")}</button></article>`}).join("");
  const premiumCards=SHOP_PREMIUM.map(x=>`<article class="shop-card premium-product"><div class="product-icon">${x.icon}</div><div class="product-main"><div class="product-title">${t(x.titleKey)}</div><p>${t(x.descKey)}</p></div><div class="shop-price">${x.gram} ${t("gram")}</div><button data-product="${x.id}">${t("buy")}</button></article>`).join("");
  return `<main class="page shop-page"><div class="section-head"><div><div class="eyebrow">${t("shopTitle")}</div><h1>${t("shopSubtitle")}</h1></div><div class="pill">💎 ${fmt(state.gems)}</div></div>
  <section class="featured-shop"><div class="featured-copy"><div class="eyebrow">${t("featuredOffer")}</div><h2>BLITZ — VOID LIMITED</h2><p>${t("limitedDesc")}</p><div class="featured-price">120 ${t("gram")}</div></div><button class="featured-buy" data-product="hero_blitz_limited">${t("buy")}</button></section>
  <section class="shop-section"><h2>💎 ${t("gemsShop")}</h2>${gemCards}</section>
  <section class="shop-section"><h2>🎁 ${t("chestShop")}</h2>${chestCards}</section>
  <section class="shop-section chest-inventory"><h2>MY CHESTS</h2>${ECONOMY.chests.map(x=>`<article class="shop-card product"><div class="product-icon">${x.key.toUpperCase()}</div><div class="product-main"><div class="product-title">${t(x.key)} ${t("chest")}</div><p>Owned: ${fmt(state.chests?.[x.key]||0)}</p></div><button data-open-chest="${x.key}" ${!(state.chests?.[x.key]>0)?"disabled":""}>OPEN</button></article>`).join("")}</section>
  <section class="shop-section"><h2>🦸 ${t("heroShopTitle")}</h2>${heroCards}</section>
  <section class="shop-section"><h2>🔥 ${t("premiumPackTitle")}</h2>${premiumCards}</section>
  <section class="shop-section"><h2>⚡ ${t("energyShop")}</h2>${energyCards}</section>
  <section class="shop-section cosmetics-shop"><h2>🎨 ${t("cosmeticsTitle")}</h2><p>${t("cosmeticsDesc")}</p><span class="coming-chip">${t("coming")}</span></section>
  <section class="wallet-note"><b>${t("gramTon")}</b><small>UQAZ3funj_qRm0ZN6N6KK35zSL4gYPkxRjTX_QsOKi_8oRBw</small><b>${t("usdt")}</b><small>0xa3CD09200F8A0e8dBd27e0dE56a1B1CF9b14EbD2</small></section></main>`;
}
function profile(){
  const u=state.telegramUser;
  const name=u?.firstName ? `${u.firstName}${u.lastName?` ${u.lastName}`:""}` : "Player";
  const link=u?.referralLink || "Подключи backend";
  return `<main class="page">
    <section class="panel profile">
      <div class="avatar">${(name[0]||"P").toUpperCase()}</div>
      <div class="eyebrow">${t("profileTitle")}</div>
      <h1>${escapeHtml(name)}</h1>
      ${u?.username?`<p>@${escapeHtml(u.username)}</p>`:""}
      <div class="stats-grid">
        ${stat("◈",state.level,t("level"))}
        ${stat("⚔️",state.battles,t("battles"))}
        ${stat("🏆",state.wins,t("wins"))}
        ${stat("🧩",state.fragments,t("fragments"))}
      </div>
    </section>

    <section class="panel referral-panel">
      <div class="eyebrow">${t("referral")}</div>
      <h2>🤝 ${t("referrals")}: ${fmt(state.referrals||0)}</h2>
      <p>${t("referralText")}</p>
      <div class="ref-link">${escapeHtml(link)}</div>
      <button class="primary full" data-action="copyReferral">${t("copy")}</button>
      <div class="ref-earned">💎 ${t("referralEarned")}: ${fmt(state.referralEarned||0)} Gems</div>
    </section>

    <section class="panel"><h2>${t("daily")}</h2>
      <p>3 battles → 100 Gems</p><p>5 enemy wins → 200 Gems</p><p>Upgrade hero → 300 Coins</p><p>Open chest → 100 Gems</p>
    </section>
  </main>`;
}

function escapeHtml(s){
  return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
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
      <div class="fighter enemy"><div class="fighter-art"><img src="assets/enemies/void.svg" alt="Void Enemy"></div><h2>VOID ENEMY</h2><div class="hp"><i style="width:${battle.enemyHp/battle.enemyMax*100}%"></i></div><small>${Math.max(0,battle.enemyHp)} / ${battle.enemyMax} HP</small></div>
      <div class="vs">VS</div>
      <div class="fighter player"><div class="fighter-art"><img src="assets/heroes/lumi.svg" alt="Lumi"></div><h2>${escapeHtml((HEROES.find(h=>h.id===battle.heroId)||HEROES[0]).name)}</h2><div class="hp"><i style="width:${battle.heroHp/battle.heroMax*100}%"></i></div><small>${Math.max(0,battle.heroHp)} / ${battle.heroMax} HP</small></div>
    </section>
    <section class="battle-actions">
      <button class="attack-btn" data-action="attack">${t("attack")} ⚔</button>
      <button data-action="skill" data-skill="skill1">Skill 1</button><button data-action="skill" data-skill="skill2">Skill 2</button>
      <button data-action="skill" data-skill="skill3">Skill 3</button><button data-action="ultimate">Ultimate</button>
    </section>
  </main>`;
}

function resultScreen(){
  const win=battle?.won;
  return `<main class="page result"><div class="result-icon">${win?"🏆":"💀"}</div><div class="eyebrow">${win?t("victory"):t("defeat")}</div><h1>${win?t("battleWin"):t("battleLose")}</h1>
  ${win?`<div class="reward-box"><b>🪙 +${fmt(battle.reward.coins)}</b><b>💎 +${battle.reward.gems}</b><b>⚡ +${battle.reward.xp}</b>${battle.first?`<b>🎁 +${t("firstClear")}</b>`:""}</div>`:""}
  <button class="primary full" data-action="continue">${t("continue")}</button></main>`;
}

async function startBattle(world=state.currentWorld){
  if(!sessionToken){ toast(t("noBackend")); return; }
  try{
    const data=await api("/api/game/battle/start",{method:"POST",body:JSON.stringify({world,stage:state.currentStage})});
    battle={
      battleId:data.battleId,world:data.world,stage:data.stage,
      enemyHp:data.enemyHp,enemyMax:data.enemyMaxHp,
      heroHp:data.heroHp,heroMax:data.heroMaxHp,heroId:data.heroId,
      reward:data.reward,first:data.firstClear,won:false,done:false
    };
    state.energy=Math.max(0,state.energy-ECONOMY.energy.battleCost);
    state.battles++; saveState(); nav("battle");
  }catch(e){toast(e.message||"Battle error");}
}

async function doAttack(action="attack"){
  if(!battle || battle.done)return;
  try{
    const data=await api("/api/game/battle/action",{method:"POST",body:JSON.stringify({battleId:battle.battleId,action})});
    battle.enemyHp=data.enemyHp; battle.heroHp=data.heroHp;
    if(data.status==="won"||data.status==="lost"){
      battle.done=true; battle.won=data.status==="won"; battle.reward=data.reward||battle.reward;
      if(battle.won) await syncServerState();
      nav("result");
    }else render();
  }catch(e){toast(e.message||"Battle error");}
}

async function upgradeHero(id){
  if(!sessionToken){toast(t("noBackend"));return;}
  try{
    const data=await api("/api/game/hero/upgrade",{method:"POST",body:JSON.stringify({hero:id})});
    if(data.game) Object.assign(state,data.game);
    saveState(); render();
  }catch(e){toast(e.message||"Upgrade error");}
}

async function openChest(type){
  if(!sessionToken){toast(t("noBackend"));return;}
  try{
    const data=await api("/api/game/chest/open",{method:"POST",body:JSON.stringify({type})});
    state.chests=data.chests||state.chests;
    state.gems+=Number(data.gems||0);state.coins+=Number(data.coins||0);state.fragments+=Number(data.fragments||0);
    if(data.hero){state.telegramUser=state.telegramUser||{};}
    saveState();
    const heroText=data.hero?` · ${data.hero.toUpperCase()}`:"";
    toast(`+${fmt(data.gems)} Gems · +${fmt(data.coins)} Coins${heroText}`);
    render();
  }catch(e){toast(e.message||"Chest error");}
}

async function createOrder(productId, method){
  return payOrder(productId,method);
}

function buyProduct(productId){
  if(!API_BASE){toast(t("noBackend"));return;}
  const modal=document.createElement("div"); modal.className="payment-modal"; modal.id="payment-choice";
  modal.innerHTML=`<div class="payment-sheet payment-choice-sheet"><button class="payment-close" id="choice-close">×</button><div class="eyebrow">${t("paymentChoose")}</div><h2>Hero Clash Shop</h2><button class="payment-method" id="choice-gram"><span>💎</span><div><b>${t("payGramShort")}</b><small>${t("gramTon")}</small></div><strong>→</strong></button><button class="payment-method" id="choice-usdt"><span>₮</span><div><b>${t("payUsdtShort")}</b><small>${t("usdt")}</small></div><strong>→</strong></button></div>`;
  document.body.appendChild(modal);
  document.getElementById("choice-close").onclick=()=>modal.remove();
  document.getElementById("choice-gram").onclick=()=>{modal.remove();payOrder(productId,"GRAM");};
  document.getElementById("choice-usdt").onclick=()=>{modal.remove();payOrder(productId,"USDT");};
}

function bind(){
  document.querySelectorAll("[data-nav]").forEach(b=>b.onclick=()=>nav(b.dataset.nav));
  document.querySelectorAll("[data-action]").forEach(b=>b.onclick=()=>{
    const a=b.dataset.action;
    if(a==="settings")nav("settings");
    if(a==="howto")nav("howto");
    if(a==="start")startBattle(state.currentWorld);
    if(a==="attack")doAttack("attack");
    if(a==="skill")doAttack(b.dataset.skill||"skill1");
    if(a==="ultimate")doAttack("ultimate");
    if(a==="continue")nav("map");
    if(a==="copyReferral")copyReferral();
  });
  document.querySelectorAll("[data-lang]").forEach(b=>b.onclick=()=>setLang(b.dataset.lang));
  document.querySelectorAll("[data-world]").forEach(b=>b.onclick=()=>startBattle(Number(b.dataset.world)));
  document.querySelectorAll("[data-upgrade]").forEach(b=>b.onclick=()=>upgradeHero(b.dataset.upgrade));
  document.querySelectorAll("[data-product]").forEach(b=>b.onclick=()=>buyProduct(b.dataset.product));
  document.querySelectorAll("[data-open-chest]").forEach(b=>b.onclick=()=>openChest(b.dataset.openChest));
}

if(window.Telegram?.WebApp){
  Telegram.WebApp.ready();
  Telegram.WebApp.expand();
}
render();
loginToServer();
