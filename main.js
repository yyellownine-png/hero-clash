const app = document.getElementById("app");

const SAVE_KEY = "hero_clash_save";

const heroes = {
  lumi: {
    name: "Люми",
    emoji: "✨",
    rarity: "LEGENDARY",
    color: "#b56cff",
    basePower: 145,
    skills: ["Световой удар", "Звёздный щит", "Вспышка", "Небесный луч"]
  },
  roxy: {
    name: "Рокси",
    emoji: "🔥",
    rarity: "EPIC",
    color: "#ff5c8a",
    basePower: 125,
    skills: ["Огненный выстрел", "Пламя", "Берсерк", "Метеор"]
  },
  nox: {
    name: "Нокс",
    emoji: "🌑",
    rarity: "EPIC",
    color: "#6577ff",
    basePower: 118,
    skills: ["Теневой удар", "Тьма", "Поглощение", "Бездна"]
  },
  blitz: {
    name: "Блиц",
    emoji: "⚡",
    rarity: "RARE",
    color: "#ffd447",
    basePower: 105,
    skills: ["Разряд", "Импульс", "Шок", "Молния"]
  }
};

const zones = [
  {
    name: "Неоновый лес",
    icon: "🌲",
    level: 1,
    color: "#a855f7",
    enemy: "Неоновый зверь"
  },
  {
    name: "Золотая пустыня",
    icon: "🏜️",
    level: 5,
    color: "#f59e0b",
    enemy: "Песчаный голем"
  },
  {
    name: "Ледяное королевство",
    icon: "❄️",
    level: 10,
    color: "#38bdf8",
    enemy: "Ледяной страж"
  },
  {
    name: "Лавовый мир",
    icon: "🌋",
    level: 15,
    color: "#ef4444",
    enemy: "Лавовый титан"
  },
  {
    name: "Космический город",
    icon: "🌌",
    level: 20,
    color: "#8b5cf6",
    enemy: "Космо-колосс"
  }
];

const defaultState = {
  coins: 12480,
  gems: 24,
  energy: 8,
  maxEnergy: 20,

  xp: 240,
  xpNeeded: 300,
  level: 12,

  zone: 0,
  stage: 3,

  wins: 0,
  battles: 0,

  dailyClaimed: false,
  lastDaily: null,

  heroLevels: {
    lumi: 12,
    roxy: 10,
    nox: 9,
    blitz: 7
  }
};

let state = loadState();

let battleState = {
  enemyHp: 0,
  enemyMaxHp: 0,
  teamHp: 100,
  turn: true,
  skillCooldowns: [0, 0, 0, 0],
  battleOver: false
};

function loadState() {
  try {
    const saved = localStorage.getItem(SAVE_KEY);

    if (!saved) {
      return JSON.parse(JSON.stringify(defaultState));
    }

    return {
      ...defaultState,
      ...JSON.parse(saved),
      heroLevels: {
        ...defaultState.heroLevels,
        ...(JSON.parse(saved).heroLevels || {})
      }
    };
  } catch {
    return JSON.parse(JSON.stringify(defaultState));
  }
}

function saveState() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function money(value) {
  return Number(value).toLocaleString("ru-RU");
}

function heroLevel(id) {
  return state.heroLevels[id] || 1;
}

function heroPower(id) {
  const hero = heroes[id];
  return hero.basePower + heroLevel(id) * 18;
}

function totalPower() {
  return Object.keys(heroes).reduce((sum, id) => {
    return sum + heroPower(id);
  }, 0);
}

function addXP(amount) {
  state.xp += amount;

  while (state.xp >= state.xpNeeded) {
    state.xp -= state.xpNeeded;
    state.level++;
    state.xpNeeded = Math.floor(state.xpNeeded * 1.22);
    state.energy = state.maxEnergy;

    showToast(`🎉 Новый уровень: ${state.level}!`);
  }

  saveState();
}

function spendEnergy(amount) {
  if (state.energy < amount) {
    showToast("⚡ Недостаточно энергии");
    return false;
  }

  state.energy -= amount;
  saveState();
  return true;
}

function header(title = "Hero Clash") {
  return `
    <header class="topbar">
      <div class="brand">
        <div class="brand-icon">⚔️</div>
        <div>
          <div class="brand-title">${title}</div>
          <div class="brand-subtitle">HERO CLASH</div>
        </div>
      </div>

      <div class="resources">
        <div class="resource coin">
          🪙 <span>${money(state.coins)}</span>
        </div>

        <div class="resource gem">
          💎 <span>${state.gems}</span>
        </div>

        <div class="resource energy">
          ⚡ <span>${state.energy}/${state.maxEnergy}</span>
        </div>
      </div>
    </header>
  `;
}

function bottomNav(active = "home") {
  return `
    <nav class="bottom-nav">

      <button class="${active === "home" ? "active" : ""}" onclick="home()">
        <span>🏠</span>
        <small>Главная</small>
      </button>

      <button class="${active === "heroes" ? "active" : ""}" onclick="heroesPage()">
        <span>🧬</span>
        <small>Герои</small>
      </button>

      <button class="battle-nav ${active === "battle" ? "active" : ""}" onclick="battle()">
        <span>⚔️</span>
        <small>Бой</small>
      </button>

      <button class="${active === "rewards" ? "active" : ""}" onclick="rewards()">
        <span>🎁</span>
        <small>Награды</small>
      </button>

      <button class="${active === "shop" ? "active" : ""}" onclick="shop()">
        <span>🛍️</span>
        <small>Магазин</small>
      </button>

    </nav>
  `;
}

function home() {
  const progress = Math.min(
    100,
    Math.floor((state.xp / state.xpNeeded) * 100)
  );

  app.innerHTML = `
    ${header()}

    <main class="page">

      <section class="hero-banner">
        <div class="banner-content">
          <div class="eyebrow">SEASON 01</div>
          <h1>CLASH<br><span>OF HEROES</span></h1>
          <p>Собирай команду. Побеждай врагов. Стань легендой.</p>

          <button class="primary-btn" onclick="mapPage()">
            ⚔️ ИГРАТЬ
          </button>
        </div>

        <div class="banner-character">
          ✨
        </div>
      </section>

      <section class="level-card">
        <div class="level-top">
          <div>
            <span class="muted">УРОВЕНЬ</span>
            <strong>LVL ${state.level}</strong>
          </div>

          <div class="xp-text">
            ${state.xp} / ${state.xpNeeded} XP
          </div>
        </div>

        <div class="xp-bar">
          <div style="width:${progress}%"></div>
        </div>
      </section>

      <section class="section-title">
        <h2>Твой прогресс</h2>
        <span>⚡ ${totalPower()} POWER</span>
      </section>

      <section class="stats-grid">

        <div class="stat-card">
          <span>🏆</span>
          <strong>${state.wins}</strong>
          <small>Победы</small>
        </div>

        <div class="stat-card">
          <span>⚔️</span>
          <strong>${state.battles}</strong>
          <small>Битвы</small>
        </div>

        <div class="stat-card">
          <span>💎</span>
          <strong>${state.gems}</strong>
          <small>Кристаллы</small>
        </div>

      </section>

      <section class="event-card">
        <div>
          <span class="event-label">🔥 LIMITED EVENT</span>
          <h3>Неоновая охота</h3>
          <p>Победи 10 врагов и получи 5000 🪙</p>
        </div>

        <div class="event-icon">🎯</div>
      </section>

      <section class="section-title">
        <h2>Быстрый старт</h2>
      </section>

      <div class="quick-actions">
        <button onclick="mapPage()">🗺️ Карта</button>
        <button onclick="heroesPage()">🧬 Герои</button>
        <button onclick="rewards()">🎁 Награды</button>
        <button onclick="shop()">🛍️ Магазин</button>
      </div>

    </main>

    ${bottomNav("home")}
  `;

  window.scrollTo(0, 0);
}

function mapPage() {
  app.innerHTML = `
    ${header("Карта")}

    <main class="page">

      <div class="page-heading">
        <span class="eyebrow">WORLD MAP</span>
        <h1>Выбери мир</h1>
        <p>Исследуй новые зоны и сражайся с боссами.</p>
      </div>

      <div class="zones">

        ${zones.map((zone, index) => {

          const unlocked = state.level >= zone.level;

          return `
            <button
              class="zone-card ${unlocked ? "" : "locked"}"
              onclick="${unlocked ? `startZone(${index})` : `lockedZone(${zone.level})`}"
            >

              <div
                class="zone-art"
                style="--zone-color:${zone.color}"
              >
                <span>${zone.icon}</span>

                ${
                  !unlocked
                    ? `<div class="lock">🔒</div>`
                    : ""
                }
              </div>

              <div class="zone-info">
                <div>
                  <small>МИР ${index + 1}</small>
                  <h3>${zone.name}</h3>
                </div>

                <div class="zone-stage">
                  ${unlocked ? `Этап ${index === state.zone ? state.stage : 1}` : `LVL ${zone.level}`}
                </div>
              </div>

            </button>
          `;
        }).join("")}

      </div>

    </main>

    ${bottomNav("battle")}
  `;

  window.scrollTo(0, 0);
}

function startZone(index) {
  state.zone = index;
  state.stage = 1;
  saveState();

  battle();
}

function lockedZone(level) {
  showToast(`🔒 Откроется на уровне ${level}`);
}

function battle() {
  if (!spendEnergy(1)) return;

  const zone = zones[state.zone];

  const stageMultiplier = 1 + (state.stage - 1) * 0.22;

  battleState = {
    enemyHp: Math.floor(900 * stageMultiplier + state.level * 55),
    enemyMaxHp: Math.floor(900 * stageMultiplier + state.level * 55),
    teamHp: 100,
    turn: true,
    skillCooldowns: [0, 0, 0, 0],
    battleOver: false
  };

  renderBattle();
}

function renderBattle() {
  const zone = zones[state.zone];

  const hpPercent = Math.max(
    0,
    (battleState.enemyHp / battleState.enemyMaxHp) * 100
  );

  const teamPercent = Math.max(
    0,
    battleState.teamHp
  );

  app.innerHTML = `
    <div class="battle-screen">

      <div class="battle-top">
        <button class="back-btn" onclick="home()">←</button>

        <div>
          <small>${zone.name}</small>
          <strong>ЭТАП ${state.stage}</strong>
        </div>

        <div class="battle-energy">
          ⚡ ${state.energy}
        </div>
      </div>

      <div class="battle-arena">

        <div class="enemy-label">
          <span>👹</span>
          <div>
            <strong>${zone.enemy}</strong>
            <small>LVL ${state.level + 2}</small>
          </div>
        </div>

        <div class="enemy">
          <div class="enemy-glow"></div>
          <div class="enemy-emoji">👹</div>
        </div>

        <div class="hp-wrapper">
          <div class="hp-text">
            <span>HP</span>
            <b>${battleState.enemyHp}</b>
          </div>

          <div class="hp-bar">
            <div style="width:${hpPercent}%"></div>
          </div>
        </div>

        <div class="vs">VS</div>

        <div class="player-team">
          <div class="team-hero main-hero">✨</div>
          <div class="team-hero">🔥</div>
          <div class="team-hero">🌑</div>
          <div class="team-hero">⚡</div>
        </div>

        <div class="team-hp">
          <div class="hp-text">
            <span>КОМАНДА</span>
            <b>${Math.floor(battleState.teamHp)}%</b>
          </div>

          <div class="hp-bar team">
            <div style="width:${teamPercent}%"></div>
          </div>
        </div>

      </div>

      <div class="battle-controls">

        <button class="attack-btn" onclick="attack()">
          ⚔️ АТАКА
        </button>

        <div class="skills">

          ${heroes.lumi.skills.map((skill, i) => `
            <button
              class="skill ${battleState.skillCooldowns[i] > 0 ? "cooldown" : ""}"
              onclick="useSkill(${i})"
              ${battleState.skillCooldowns[i] > 0 ? "disabled" : ""}
            >
              <span>${["✨", "🛡️", "💥", "🌟"][i]}</span>
              <small>${skill}</small>
              ${
                battleState.skillCooldowns[i] > 0
                  ? `<b>${battleState.skillCooldowns[i]}</b>`
                  : ""
              }
            </button>
          `).join("")}

        </div>

      </div>

    </div>
  `;

  window.scrollTo(0, 0);
}

function attack() {
  if (battleState.battleOver) return;

  const damage = Math.floor(
    heroPower("lumi") * (0.75 + Math.random() * 0.45)
  );

  battleState.enemyHp -= damage;

  showToast(`⚔️ -${damage} HP`);

  if (battleState.enemyHp <= 0) {
    winBattle();
    return;
  }

  enemyTurn();
}

function useSkill(index) {
  if (battleState.battleOver) return;

  if (battleState.skillCooldowns[index] > 0) {
    showToast("⏳ Навык ещё перезаряжается");
    return;
  }

  const multipliers = [1.5, 1.2, 1.8, 2.2];

  const damage = Math.floor(
    heroPower("lumi") * multipliers[index]
  );

  battleState.enemyHp -= damage;

  battleState.skillCooldowns[index] =
    index === 3 ? 4 : 2;

  showToast(`💥 ${heroes.lumi.skills[index]}: -${damage}`);

  if (battleState.enemyHp <= 0) {
    winBattle();
    return;
  }

  enemyTurn();
}

function enemyTurn() {
  if (battleState.battleOver) return;

  const damage = Math.floor(
    5 + Math.random() * 9 + state.stage * 2
  );

  battleState.teamHp -= damage;

  battleState.skillCooldowns =
    battleState.skillCooldowns.map(value =>
      Math.max(0, value - 1)
    );

  if (battleState.teamHp <= 0) {
    battleState.teamHp = 0;
    defeatBattle();
    return;
  }

  renderBattle();
}

function winBattle() {
  battleState.battleOver = true;

  const coins = 500 + state.stage * 120;
  const xp = 80 + state.stage * 20;

  state.coins += coins;
  state.wins++;
  state.battles++;

  addXP(xp);

  saveState();

  app.innerHTML = `
    <div class="result-screen victory">

      <div class="result-glow">🏆</div>

      <div class="result-label">VICTORY</div>

      <h1>ПОБЕДА!</h1>

      <p>Враг повержен.</p>

      <div class="reward-box">

        <div>
          <span>🪙</span>
          <strong>+${money(coins)}</strong>
          <small>Монеты</small>
        </div>

        <div>
          <span>⭐</span>
          <strong>+${xp}</strong>
          <small>Опыт</small>
        </div>

      </div>

      <button class="primary-btn" onclick="nextStage()">
        ПРОДОЛЖИТЬ →
      </button>

      <button class="secondary-btn" onclick="home()">
        На главную
      </button>

    </div>
  `;

  saveState();
}

function nextStage() {
  state.stage++;

  if (state.stage > 10) {
    state.stage = 1;

    if (state.zone < zones.length - 1) {
      state.zone++;
    }
  }

  saveState();
  mapPage();
}

function defeatBattle() {
  battleState.battleOver = true;

  state.battles++;
  saveState();

  app.innerHTML = `
    <div class="result-screen defeat">

      <div class="result-glow">💀</div>

      <div class="result-label">DEFEAT</div>

      <h1>ПОРАЖЕНИЕ</h1>

      <p>Твоя команда потерпела поражение.</p>

      <div class="reward-box">

        <div>
          <span>⚔️</span>
          <strong>Попробуй снова</strong>
          <small>Тренируй героев</small>
        </div>

      </div>

      <button class="primary-btn" onclick="home()">
        ВЕРНУТЬСЯ
      </button>

    </div>
  `;
}

function heroesPage() {
  app.innerHTML = `
    ${header("Герои")}

    <main class="page">

      <div class="page-heading">
        <span class="eyebrow">COLLECTION</span>
        <h1>Твои герои</h1>
        <p>Прокачивай персонажей и увеличивай силу команды.</p>
      </div>

      <div class="power-banner">
        <div>
          <small>ОБЩАЯ СИЛА</small>
          <strong>⚡ ${totalPower()}</strong>
        </div>

        <div>LVL ${state.level}</div>
      </div>

      <div class="heroes-grid">

        ${Object.entries(heroes).map(([id, hero]) => {

          const lvl = heroLevel(id);
          const power = heroPower(id);
          const cost = Math.floor(1000 * Math.pow(1.35, lvl - 1));

          return `
            <div class="hero-card">

              <div
                class="hero-avatar"
                style="--hero-color:${hero.color}"
              >
                ${hero.emoji}
              </div>

              <div class="hero-rarity">
                ${hero.rarity}
              </div>

              <h3>${hero.name}</h3>

              <div class="hero-level">
                LEVEL ${lvl}
              </div>

              <div class="hero-power">
                ⚡ ${power}
              </div>

              <button
                class="upgrade-btn"
                onclick="upgradeHero('${id}')"
              >
                ⬆️ ${money(cost)} 🪙
              </button>

            </div>
          `;
        }).join("")}

      </div>

    </main>

    ${bottomNav("heroes")}
  `;

  window.scrollTo(0, 0);
}

function upgradeHero(id) {
  const lvl = heroLevel(id);
  const cost = Math.floor(1000 * Math.pow(1.35, lvl - 1));

  if (state.coins < cost) {
    showToast("🪙 Недостаточно монет");
    return;
  }

  state.coins -= cost;
  state.heroLevels[id] = lvl + 1;

  saveState();

  showToast(`⬆️ ${heroes[id].name} теперь LVL ${lvl + 1}`);

  heroesPage();
}

function rewards() {
  const today = new Date().toISOString().slice(0, 10);

  const canClaim =
    state.lastDaily !== today;

  app.innerHTML = `
    ${header("Награды")}

    <main class="page">

      <div class="page-heading">
        <span class="eyebrow">REWARDS</span>
        <h1>Награды</h1>
        <p>Забирай ежедневные бонусы и выполняй задания.</p>
      </div>

      <section class="daily-card">

        <div class="daily-icon">🎁</div>

        <div class="daily-info">
          <span>DAILY REWARD</span>
          <h2>Ежедневный бонус</h2>
          <p>500 🪙 + 2 💎</p>
        </div>

        <button
          class="claim-btn"
          onclick="claimDaily()"
          ${canClaim ? "" : "disabled"}
        >
          ${canClaim ? "ЗАБРАТЬ" : "ЗАБРАНО"}
        </button>

      </section>

      <section class="section-title">
        <h2>Задания</h2>
      </section>

      <div class="missions">

        <div class="mission">
          <div class="mission-icon">⚔️</div>

          <div class="mission-info">
            <strong>Боец</strong>
            <span>Проведи 3 битвы</span>
          </div>

          <div class="mission-reward">
            +1000 🪙
          </div>
        </div>

        <div class="mission">
          <div class="mission-icon">🏆</div>

          <div class="mission-info">
            <strong>Победитель</strong>
            <span>Одержи 5 побед</span>
          </div>

          <div class="mission-reward">
            +5 💎
          </div>
        </div>

        <div class="mission">
          <div class="mission-icon">🧬</div>

          <div class="mission-info">
            <strong>Развитие</strong>
            <span>Улучши героя</span>
          </div>

          <div class="mission-reward">
            +1500 🪙
          </div>
        </div>

      </div>

    </main>

    ${bottomNav("rewards")}
  `;

  window.scrollTo(0, 0);
}

function claimDaily() {
  const today = new Date().toISOString().slice(0, 10);

  if (state.lastDaily === today) {
    showToast("🎁 Ты уже забрал награду");
    return;
  }

  state.coins += 500;
  state.gems += 2;
  state.lastDaily = today;

  saveState();

  showToast("🎁 +500 🪙 +2 💎");

  rewards();
}

function claimMission() {
  state.coins += 1000;
  saveState();

  showToast("🏆 Награда получена");
}

function shop() {
  app.innerHTML = `
    ${header("Магазин")}

    <main class="page">

      <div class="page-heading">
        <span class="eyebrow">MARKET</span>
        <h1>Магазин</h1>
        <p>Усиль свою команду и пополни ресурсы.</p>
      </div>

      <div class="shop-grid">

        <div class="shop-card featured">

          <div class="shop-art">🎁</div>

          <span class="shop-tag">BEST VALUE</span>

          <h3>Hero Chest</h3>

          <p>Случайная награда героя.</p>

          <div class="shop-price">
            1000 🪙
          </div>

          <button onclick="buyChest()">
            КУПИТЬ
          </button>

        </div>

        <div class="shop-card">

          <div class="shop-art">⚡</div>

          <h3>Energy Pack</h3>

          <p>+10 энергии.</p>

          <div class="shop-price">
            500 🪙
          </div>

          <button onclick="buyEnergy()">
            КУПИТЬ
          </button>

        </div>

        <div class="shop-card">

          <div class="shop-art">💎</div>

          <h3>Gem Pack</h3>

          <p>+10 кристаллов.</p>

          <div class="shop-price">
            1000 🪙
          </div>

          <button onclick="buyGems()">
            КУПИТЬ
          </button>

        </div>

      </div>

    </main>

    ${bottomNav("shop")}
  `;

  window.scrollTo(0, 0);
}

function buyChest() {
  if (state.coins < 1000) {
    showToast("🪙 Недостаточно монет");
    return;
  }

  state.coins -= 1000;

  const rewards = [
    ["coins", 2500],
    ["gems", 8],
    ["energy", 10]
  ];

  const reward =
    rewards[Math.floor(Math.random() * rewards.length)];

  state[reward[0]] += reward[1];

  saveState();

  showToast(`🎁 Ты получил +${reward[1]} ${reward[0]}`);

  shop();
}

function buyEnergy() {
  if (state.coins < 500) {
    showToast("🪙 Недостаточно монет");
    return;
  }

  state.coins -= 500;
  state.energy = Math.min(
    state.maxEnergy,
    state.energy + 10
  );

  saveState();

  showToast("⚡ +10 энергии");

  shop();
}

function buyGems() {
  if (state.coins < 1000) {
    showToast("🪙 Недостаточно монет");
    return;
  }

  state.coins -= 1000;
  state.gems += 10;

  saveState();

  showToast("💎 +10 кристаллов");

  shop();
}

function showToast(message) {
  const old = document.querySelector(".game-toast");

  if (old) {
    old.remove();
  }

  const toast = document.createElement("div");

  toast.className = "game-toast";
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 10);

  setTimeout(() => {
    toast.classList.remove("show");

    setTimeout(() => {
      toast.remove();
    }, 250);
  }, 1800);
}

function initTelegram() {
  try {
    if (
      typeof window.Telegram !== "undefined" &&
      window.Telegram.WebApp
    ) {
      const tg = window.Telegram.WebApp;

      tg.ready();
      tg.expand();

      if (tg.setHeaderColor) {
        tg.setHeaderColor("#090812");
      }

      if (tg.setBackgroundColor) {
        tg.setBackgroundColor("#090812");
      }
    }
  } catch (error) {
    console.log("Telegram WebApp:", error);
  }
}

/* Global functions for buttons */
window.home = home;
window.mapPage = mapPage;
window.battle = battle;
window.attack = attack;
window.useSkill = useSkill;
window.heroesPage = heroesPage;
window.upgradeHero = upgradeHero;
window.rewards = rewards;
window.claimDaily = claimDaily;
window.claimMission = claimMission;
window.shop = shop;
window.buyChest = buyChest;
window.buyEnergy = buyEnergy;
window.buyGems = buyGems;
window.startZone = startZone;
window.lockedZone = lockedZone;
window.nextStage = nextStage;

/* Start application */
initTelegram();
home();
