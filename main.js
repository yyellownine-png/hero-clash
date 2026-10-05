const app = document.getElementById("app");

const SAVE_KEY = "hero_clash_v3";

const heroes = {
  lumi: {
    name: "Люми",
    emoji: "✨",
    rarity: "LEGENDARY",
    color: "#b56cff",
    power: 150,
    skills: [
      "Световой удар",
      "Звёздный щит",
      "Вспышка",
      "Небесный луч"
    ]
  },

  roxy: {
    name: "Рокси",
    emoji: "🔥",
    rarity: "EPIC",
    color: "#ff5c8a",
    power: 130,
    skills: [
      "Огненный выстрел",
      "Пламя",
      "Берсерк",
      "Метеор"
    ]
  },

  nox: {
    name: "Нокс",
    emoji: "🌑",
    rarity: "EPIC",
    color: "#6577ff",
    power: 122,
    skills: [
      "Теневой удар",
      "Тьма",
      "Поглощение",
      "Бездна"
    ]
  },

  blitz: {
    name: "Блиц",
    emoji: "⚡",
    rarity: "RARE",
    color: "#ffd447",
    power: 110,
    skills: [
      "Разряд",
      "Импульс",
      "Шок",
      "Молния"
    ]
  }
};

const worlds = [
  {
    id: 0,
    name: "Неоновый лес",
    icon: "🌲",
    color: "#a855f7",
    level: 1,
    boss: "Неоновый зверь",
    bossIcon: "🐺"
  },

  {
    id: 1,
    name: "Золотая пустыня",
    icon: "🏜️",
    color: "#f59e0b",
    level: 5,
    boss: "Песчаный голем",
    bossIcon: "🗿"
  },

  {
    id: 2,
    name: "Ледяное королевство",
    icon: "❄️",
    color: "#38bdf8",
    level: 10,
    boss: "Ледяной страж",
    bossIcon: "👾"
  },

  {
    id: 3,
    name: "Лавовый мир",
    icon: "🌋",
    color: "#ef4444",
    level: 15,
    boss: "Лавовый титан",
    bossIcon: "👹"
  },

  {
    id: 4,
    name: "Космический город",
    icon: "🌌",
    color: "#8b5cf6",
    level: 20,
    boss: "Космо-колосс",
    bossIcon: "👽"
  }
];

const defaultState = {
  coins: 12480,
  gems: 24,

  energy: 12,
  maxEnergy: 20,

  level: 12,
  xp: 240,
  xpNeeded: 300,

  currentWorld: 0,
  currentStage: 1,

  unlockedWorld: 0,

  completedStages: {},

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
  maxTeamHp: 100,

  cooldowns: [0, 0, 0, 0],

  turn: true,
  finished: false
};

/* =========================
   SAVE
========================= */

function loadState() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(SAVE_KEY)
    );

    if (!saved) {
      return structuredClone(defaultState);
    }

    return {
      ...defaultState,
      ...saved,

      heroLevels: {
        ...defaultState.heroLevels,
        ...(saved.heroLevels || {})
      },

      completedStages: {
        ...defaultState.completedStages,
        ...(saved.completedStages || {})
      }
    };

  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(
    SAVE_KEY,
    JSON.stringify(state)
  );
}

/* =========================
   HELPERS
========================= */

function money(value) {
  return Number(value).toLocaleString("ru-RU");
}

function heroLevel(id) {
  return state.heroLevels[id] || 1;
}

function heroPower(id) {
  return heroes[id].power +
    heroLevel(id) * 18;
}

function totalPower() {
  return Object.keys(heroes)
    .reduce(
      (sum, id) => sum + heroPower(id),
      0
    );
}

function stageKey(world, stage) {
  return `${world}_${stage}`;
}

function isStageCompleted(world, stage) {
  return !!state.completedStages[
    stageKey(world, stage)
  ];
}

function stageUnlocked(world, stage) {

  if (world === 0 && stage === 1) {
    return true;
  }

  if (stage > 1) {
    return isStageCompleted(
      world,
      stage - 1
    );
  }

  return state.level >= worlds[world].level;
}

function addXP(amount) {

  state.xp += amount;

  while (state.xp >= state.xpNeeded) {

    state.xp -= state.xpNeeded;

    state.level++;

    state.xpNeeded =
      Math.floor(
        state.xpNeeded * 1.2
      );

    state.energy =
      state.maxEnergy;

    showToast(
      `🎉 Новый уровень: ${state.level}`
    );
  }

  saveState();
}

function spendEnergy(amount) {

  if (state.energy < amount) {

    showToast(
      "⚡ Недостаточно энергии"
    );

    return false;
  }

  state.energy -= amount;

  saveState();

  return true;
}

/* =========================
   TELEGRAM
========================= */

function initTelegram() {

  try {

    if (
      window.Telegram &&
      window.Telegram.WebApp
    ) {

      const tg =
        window.Telegram.WebApp;

      tg.ready();
      tg.expand();

      if (tg.setHeaderColor) {
        tg.setHeaderColor("#080710");
      }

      if (tg.setBackgroundColor) {
        tg.setBackgroundColor("#080710");
      }
    }

  } catch (e) {
    console.log(e);
  }
}

/* =========================
   HEADER
========================= */

function header(title = "Hero Clash") {

  return `
    <header class="topbar">

      <div class="brand">

        <div class="brand-icon">
          ⚔️
        </div>

        <div>
          <div class="brand-title">
            ${title}
          </div>

          <div class="brand-subtitle">
            HERO CLASH
          </div>
        </div>

      </div>

      <div class="resources">

        <div class="resource">
          🪙 ${money(state.coins)}
        </div>

        <div class="resource">
          💎 ${state.gems}
        </div>

        <div class="resource">
          ⚡ ${state.energy}/${state.maxEnergy}
        </div>

      </div>

    </header>
  `;
}

/* =========================
   NAV
========================= */

function bottomNav(active) {

  return `
    <nav class="bottom-nav">

      <button
        class="${active === "home" ? "active" : ""}"
        onclick="home()"
      >
        <span>🏠</span>
        <small>Главная</small>
      </button>

      <button
        class="${active === "heroes" ? "active" : ""}"
        onclick="heroesPage()"
      >
        <span>🧬</span>
        <small>Герои</small>
      </button>

      <button
        class="battle-nav ${active === "battle" ? "active" : ""}"
        onclick="mapPage()"
      >
        <span>⚔️</span>
        <small>Бой</small>
      </button>

      <button
        class="${active === "rewards" ? "active" : ""}"
        onclick="rewards()"
      >
        <span>🎁</span>
        <small>Награды</small>
      </button>

      <button
        class="${active === "shop" ? "active" : ""}"
        onclick="shop()"
      >
        <span>🛍️</span>
        <small>Магазин</small>
      </button>

    </nav>
  `;
}

/* =========================
   HOME
========================= */

function home() {

  const progress =
    Math.min(
      100,
      Math.floor(
        state.xp /
        state.xpNeeded *
        100
      )
    );

  app.innerHTML = `

    ${header()}

    <main class="page">

      <section class="hero-banner">

        <div class="banner-content">

          <div class="eyebrow">
            SEASON 01
          </div>

          <h1>
            CLASH<br>
            <span>OF HEROES</span>
          </h1>

          <p>
            Собери команду героев
            и сразись с монстрами
            всех миров.
          </p>

          <button
            class="primary-btn"
            onclick="mapPage()"
          >
            ⚔️ НАЧАТЬ БОЙ
          </button>

        </div>

        <div class="banner-character">
          ✨
        </div>

      </section>

      <section class="level-card">

        <div class="level-top">

          <div>
            <span class="muted">
              УРОВЕНЬ
            </span>

            <strong>
              LVL ${state.level}
            </strong>
          </div>

          <div class="xp-text">
            ${state.xp}/${state.xpNeeded} XP
          </div>

        </div>

        <div class="xp-bar">
          <div
            style="width:${progress}%"
          ></div>
        </div>

      </section>

      <div class="section-title">
        <h2>
          Твой прогресс
        </h2>

        <span>
          ⚡ ${totalPower()} POWER
        </span>
      </div>

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
          <span>🌍</span>
          <strong>${state.unlockedWorld + 1}</strong>
          <small>Миры</small>
        </div>

      </section>

      <section class="event-card">

        <div>

          <span class="event-label">
            🔥 LIMITED EVENT
          </span>

          <h3>
            Неоновая охота
          </h3>

          <p>
            Победи 10 врагов
            и получи 5000 🪙
          </p>

        </div>

        <div class="event-icon">
          🎯
        </div>

      </section>

      <div class="section-title">
        <h2>
          Быстрый старт
        </h2>
      </div>

      <div class="quick-actions">

        <button onclick="mapPage()">
          🗺️ Карта
        </button>

        <button onclick="heroesPage()">
          🧬 Герои
        </button>

        <button onclick="rewards()">
          🎁 Награды
        </button>

        <button onclick="shop()">
          🛍️ Магазин
        </button>

      </div>

    </main>

    ${bottomNav("home")}
  `;

  window.scrollTo(0, 0);
}

/* =========================
   WORLD MAP
========================= */

function mapPage() {

  app.innerHTML = `

    ${header("Карта")}

    <main class="page">

      <div class="page-heading">

        <div class="eyebrow">
          WORLD MAP
        </div>

        <h1>
          Миры
        </h1>

        <p>
          Проходи этапы,
          побеждай боссов
          и открывай новые миры.
        </p>

      </div>

      <div class="zones">

        ${worlds.map(world => {

          const unlocked =
            state.level >= world.level ||
            world.id <= state.unlockedWorld;

          const completed =
            Array.from(
              { length: 10 },
              (_, i) =>
                isStageCompleted(
                  world.id,
                  i + 1
                )
            ).filter(Boolean).length;

          return `

            <button
              class="zone-card ${unlocked ? "" : "locked"}"
              onclick="
                ${
                  unlocked
                    ? `openWorld(${world.id})`
                    : `lockedWorld(${world.level})`
                }
              "
            >

              <div
                class="zone-art"
                style="
                  --zone-color:${world.color};
                  background:
                    radial-gradient(
                      circle at center,
                      ${world.color}22,
                      transparent 60%
                    ),
                    #11101a;
                "
              >

                <div class="zone-number">
                  WORLD ${world.id + 1}
                </div>

                <span>
                  ${world.icon}
                </span>

                ${
                  !unlocked
                    ? `<div class="lock">🔒</div>`
                    : ""
                }

              </div>

              <div class="zone-info">

                <div>

                  <small>
                    ${world.boss}
                  </small>

                  <h3>
                    ${world.name}
                  </h3>

                </div>

                <div class="zone-stage">
                  ${
                    unlocked
                      ? `${completed}/10`
                      : `LVL ${world.level}`
                  }
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

/* =========================
   WORLD
========================= */

function openWorld(worldId) {

  state.currentWorld =
    worldId;

  saveState();

  renderStages();
}

function lockedWorld(level) {

  showToast(
    `🔒 Откроется на уровне ${level}`
  );
}

function renderStages() {

  const world =
    worlds[state.currentWorld];

  app.innerHTML = `

    ${header(world.name)}

    <main class="page">

      <div class="page-heading">

        <div class="eyebrow">
          ${world.icon} WORLD ${world.id + 1}
        </div>

        <h1>
          ${world.name}
        </h1>

        <p>
          Босс мира:
          <b>${world.boss}</b>
        </p>

      </div>

      <div class="stages">

        ${Array.from(
          { length: 10 },
          (_, i) => {

            const stage = i + 1;

            const completed =
              isStageCompleted(
                world.id,
                stage
              );

            const unlocked =
              stageUnlocked(
                world.id,
                stage
              );

            const boss =
              stage === 10;

            return `

              <button
                class="zone-card ${
                  unlocked ? "" : "locked"
                }"
                onclick="
                  ${
                    unlocked
                      ? `startStage(${stage})`
                      : `lockedStage(${stage})`
                  }
                "
              >

                <div
                  class="zone-art"
                  style="
                    --zone-color:${world.color};
                    background:
                      radial-gradient(
                        circle,
                        ${world.color}20,
                        transparent 65%
                      ),
                      #11101a;
                  "
                >

                  <div class="zone-number">
                    STAGE ${stage}
                  </div>

                  <span>
                    ${
                      completed
                        ? "🏆"
                        : boss
                          ? world.bossIcon
                          : "⚔️"
                    }
                  </span>

                  ${
                    !unlocked
                      ? `<div class="lock">🔒</div>`
                      : ""
                  }

                </div>

                <div class="zone-info">

                  <div>

                    <small>
                      ${
                        boss
                          ? "BOSS"
                          : "STAGE"
                      }
                    </small>

                    <h3>
                      ${
                        boss
                          ? world.boss
                          : `Этап ${stage}`
                      }
                    </h3>

                  </div>

                  <div class="zone-stage">
                    ${
                      completed
                        ? "✓"
                        : unlocked
                          ? "▶"
                          : "🔒"
                    }
                  </div>

                </div>

              </button>

            `;
          }
        ).join("")}

      </div>

    </main>

    ${bottomNav("battle")}
  `;

  window.scrollTo(0, 0);
}

function lockedStage(stage) {

  showToast(
    `🔒 Сначала пройди этап ${stage - 1}`
  );
}

/* =========================
   START STAGE
========================= */

function startStage(stage) {

  if (!stageUnlocked(
    state.currentWorld,
    stage
  )) {

    lockedStage(stage);

    return;
  }

  if (!spendEnergy(1)) {
    return;
  }

  state.currentStage =
    stage;

  const world =
    worlds[state.currentWorld];

  const boss =
    stage === 10;

  const difficulty =
    1 +
    state.currentWorld * .35 +
    (stage - 1) * .18;

  const baseHP =
    boss
      ? 2600
      : 1000;

  const enemyMaxHP =
    Math.floor(
      baseHP *
      difficulty +
      state.level * 70
    );

  battleState = {

    enemyHp: enemyMaxHP,

    enemyMaxHp: enemyMaxHP,

    teamHp: 100,

    maxTeamHp: 100,

    cooldowns: [0,0,0,0],

    turn: true,

    finished: false
  };

  renderBattle();
}

/* =========================
   BATTLE
========================= */

function renderBattle() {

  const world =
    worlds[state.currentWorld];

  const boss =
    state.currentStage === 10;

  const hpPercent =
    Math.max(
      0,
      battleState.enemyHp /
      battleState.enemyMaxHp *
      100
    );

  const teamPercent =
    Math.max(
      0,
      battleState.teamHp
    );

  app.innerHTML = `

    <div class="battle-screen">

      <div class="battle-top">

        <button
          class="back-btn"
          onclick="renderStages()"
        >
          ←
        </button>

        <div>

          <small>
            ${world.name}
          </small>

          <strong>
            ${
              boss
                ? "👑 BOSS"
                : `ЭТАП ${state.currentStage}`
            }
          </strong>

        </div>

        <div class="battle-energy">
          ⚡ ${state.energy}
        </div>

      </div>

      <div class="battle-arena">

        <div class="enemy-label">

          <span>
            ${boss
              ? world.bossIcon
              : "👹"
            }
          </span>

          <div>

            <strong>
              ${
                boss
                  ? world.boss
                  : `${world.boss} - ${state.currentStage}`
              }
            </strong>

            <small>
              LVL ${state.level + state.currentWorld + 2}
            </small>

          </div>

        </div>

        <div class="enemy">

          <div class="enemy-emoji">
            ${
              boss
                ? world.bossIcon
                : "👹"
            }
          </div>

        </div>

        <div class="hp-wrapper">

          <div class="hp-text">

            <span>
              HP
            </span>

            <b>
              ${money(
                Math.max(
                  0,
                  battleState.enemyHp
                )
              )}
            </b>

          </div>

          <div class="hp-bar">

            <div
              style="
                width:${hpPercent}%
              "
            ></div>

          </div>

        </div>

        <div class="vs">
          VS
        </div>

        <div class="player-team">

          <div class="team-hero main-hero">
            ✨
          </div>

          <div class="team-hero">
            🔥
          </div>

          <div class="team-hero">
            🌑
          </div>

          <div class="team-hero">
            ⚡
          </div>

        </div>

        <div
          class="hp-wrapper"
          style="margin-top:10px"
        >

          <div class="hp-text">

            <span>
              КОМАНДА
            </span>

            <b>
              ${Math.floor(
                battleState.teamHp
              )}%
            </b>

          </div>

          <div class="hp-bar team">

            <div
              style="
                width:${teamPercent}%
              "
            ></div>

          </div>

        </div>

      </div>

      <div class="battle-controls">

        <button
          class="attack-btn"
          onclick="attack()"
        >
          ⚔️ АТАКА
        </button>

        <div class="skills">

          ${heroes.lumi.skills.map(
            (skill, index) => {

              const cooldown =
                battleState.cooldowns[index];

              return `

                <button
                  class="skill ${
                    cooldown > 0
                      ? "cooldown"
                      : ""
                  }"
                  onclick="useSkill(${index})"
                  ${
                    cooldown > 0
                      ? "disabled"
                      : ""
                  }
                >

                  <span>
                    ${
                      ["✨","🛡️","💥","🌟"][index]
                    }
                  </span>

                  <small>
                    ${skill}
                  </small>

                  ${
                    cooldown > 0
                      ? `<b>${cooldown}</b>`
                      : ""
                  }

                </button>

              `;
            }
          ).join("")}

        </div>

      </div>

    </div>
  `;

  window.scrollTo(0,0);
}

/* =========================
   ATTACK
========================= */

function attack() {

  if (battleState.finished) {
    return;
  }

  let damage =
    heroPower("lumi") *
    (.75 + Math.random() * .45);

  const critical =
    Math.random() < .12;

  if (critical) {
    damage *= 2;

    showToast(
      `💥 КРИТИЧЕСКИЙ УДАР! -${Math.floor(damage)}`
    );

  } else {

    showToast(
      `⚔️ -${Math.floor(damage)} HP`
    );
  }

  battleState.enemyHp -=
    Math.floor(damage);

  if (
    battleState.enemyHp <= 0
  ) {

    battleState.enemyHp = 0;

    winBattle();

    return;
  }

  enemyTurn();
}

/* =========================
   SKILLS
========================= */

function useSkill(index) {

  if (battleState.finished) {
    return;
  }

  if (
    battleState.cooldowns[index] > 0
  ) {

    showToast(
      "⏳ Способность перезаряжается"
    );

    return;
  }

  const multipliers =
    [1.45, 1.2, 1.8, 2.3];

  let damage =
    heroPower("lumi") *
    multipliers[index];

  if (index === 1) {

    battleState.teamHp =
      Math.min(
        100,
        battleState.teamHp + 18
      );

    showToast(
      "🛡️ Щит восстановил HP"
    );

  } else {

    battleState.enemyHp -=
      Math.floor(damage);

    showToast(
      `💥 ${heroes.lumi.skills[index]} -${Math.floor(damage)}`
    );
  }

  battleState.cooldowns[index] =
    index === 3
      ? 4
      : 2;

  if (
    battleState.enemyHp <= 0
  ) {

    battleState.enemyHp = 0;

    winBattle();

    return;
  }

  enemyTurn();
}

/* =========================
   ENEMY
========================= */

function enemyTurn() {

  if (battleState.finished) {
    return;
  }

  const damage =
    Math.floor(
      5 +
      Math.random() * 10 +
      state.currentWorld * 2 +
      state.currentStage
    );

  battleState.teamHp -=
    damage;

  battleState.cooldowns =
    battleState.cooldowns.map(
      value =>
        Math.max(
          0,
          value - 1
        )
    );

  if (
    battleState.teamHp <= 0
  ) {

    battleState.teamHp = 0;

    defeatBattle();

    return;
  }

  renderBattle();
}

/* =========================
   VICTORY
========================= */

function winBattle() {

  battleState.finished = true;

  const world =
    worlds[state.currentWorld];

  const boss =
    state.currentStage === 10;

  const coins =
    boss
      ? 2500 + state.currentWorld * 800
      : 500 +
        state.currentStage * 120;

  const gems =
    boss
      ? 8
      : state.currentStage % 3 === 0
        ? 2
        : 0;

  const xp =
    boss
      ? 250
      : 80 +
        state.currentStage * 20;

  state.coins += coins;
  state.gems += gems;

  state.wins++;
  state.battles++;

  state.completedStages[
    stageKey(
      state.currentWorld,
      state.currentStage
    )
  ] = true;

  if (
    state.currentWorld <
    worlds.length - 1 &&
    state.currentStage === 10
  ) {

    state.unlockedWorld =
      Math.max(
        state.unlockedWorld,
        state.currentWorld + 1
      );
  }

  addXP(xp);

  saveState();

  app.innerHTML = `

    <div class="result-screen">

      <div class="result-glow">
        ${boss ? "👑" : "🏆"}
      </div>

      <div class="result-label">
        ${boss ? "BOSS DEFEATED" : "VICTORY"}
      </div>

      <h1>
        ПОБЕДА!
      </h1>

      <p>
        ${
          boss
            ? `Босс ${world.boss} повержен!`
            : "Враг уничтожен."
        }
      </p>

      <div class="reward-box">

        <div>

          <span>🪙</span>

          <strong>
            +${money(coins)}
          </strong>

          <small>
            Монеты
          </small>

        </div>

        <div>

          <span>⭐</span>

          <strong>
            +${xp}
          </strong>

          <small>
            Опыт
          </small>

        </div>

        ${
          gems > 0
            ? `
              <div>

                <span>💎</span>

                <strong>
                  +${gems}
                </strong>

                <small>
                  Gems
                </small>

              </div>
            `
            : ""
        }

      </div>

      <button
        class="primary-btn"
        onclick="nextStage()"
      >
        ${
          state.currentStage === 10
            ? "ВЕРНУТЬСЯ К КАРТЕ →"
            : "СЛЕДУЮЩИЙ ЭТАП →"
        }
      </button>

      <button
        class="secondary-btn"
        onclick="home()"
      >
        На главную
      </button>

    </div>
  `;
}

/* =========================
   NEXT STAGE
========================= */

function nextStage() {

  if (
    state.currentStage >= 10
  ) {

    if (
      state.currentWorld <
      worlds.length - 1
    ) {

      state.currentWorld++;
      state.currentStage = 1;

    } else {

      state.currentStage = 1;
    }

  } else {

    state.currentStage++;
  }

  saveState();

  mapPage();

  setTimeout(() => {

    if (
      state.currentWorld <
      worlds.length
    ) {

      renderStages();
    }

  }, 50);
}

/* =========================
   DEFEAT
========================= */

function defeatBattle() {

  battleState.finished = true;

  state.battles++;

  saveState();

  app.innerHTML = `

    <div class="result-screen">

      <div class="result-glow">
        💀
      </div>

      <div class="result-label">
        DEFEAT
      </div>

      <h1>
        ПОРАЖЕНИЕ
      </h1>

      <p>
        Команда потерпела поражение.
      </p>

      <div class="reward-box">

        <div>

          <span>⚔️</span>

          <strong>
            ${state.currentStage}
          </strong>

          <small>
            Этап
          </small>

        </div>

        <div>

          <span>💪</span>

          <strong>
            ${totalPower()}
          </strong>

          <small>
            Сила команды
          </small>

        </div>

      </div>

      <button
        class="primary-btn"
        onclick="retryStage()"
      >
        🔄 ПОПРОБОВАТЬ СНОВА
      </button>

      <button
        class="secondary-btn"
        onclick="renderStages()"
      >
        Вернуться к карте
      </button>

    </div>
  `;
}

function retryStage() {

  startStage(
    state.currentStage
  );
}

/* =========================
   HEROES
========================= */

function heroesPage() {

  app.innerHTML = `

    ${header("Герои")}

    <main class="page">

      <div class="page-heading">

        <div class="eyebrow">
          COLLECTION
        </div>

        <h1>
          Твои герои
        </h1>

        <p>
          Улучшай героев
          и увеличивай силу команды.
        </p>

      </div>

      <div class="power-banner">

        <div>

          <small>
            ОБЩАЯ СИЛА
          </small>

          <strong>
            ⚡ ${totalPower()}
          </strong>

        </div>

        <div>
          LVL ${state.level}
        </div>

      </div>

      <div class="heroes-grid">

        ${Object.entries(heroes)
          .map(([id, hero]) => {

            const lvl =
              heroLevel(id);

            const power =
              heroPower(id);

            const cost =
              Math.floor(
                1000 *
                Math.pow(
                  1.35,
                  lvl - 1
                )
              );

            return `

              <div class="hero-card">

                <div
                  class="hero-avatar"
                  style="
                    --hero-color:${hero.color}
                  "
                >
                  ${hero.emoji}
                </div>

                <div class="hero-rarity">
                  ${hero.rarity}
                </div>

                <h3>
                  ${hero.name}
                </h3>

                <div class="hero-level">
                  LEVEL ${lvl}
                </div>

                <div class="hero-power">
                  ⚡ ${power}
                </div>

                <button
                  class="upgrade-btn"
                  onclick="
                    upgradeHero('${id}')
                  "
                >
                  ⬆️ ${money(cost)} 🪙
                </button>

              </div>

            `;
          })
          .join("")}

      </div>

    </main>

    ${bottomNav("heroes")}
  `;

  window.scrollTo(0,0);
}

function upgradeHero(id) {

  const lvl =
    heroLevel(id);

  const cost =
    Math.floor(
      1000 *
      Math.pow(
        1.35,
        lvl - 1
      )
    );

  if (state.coins < cost) {

    showToast(
      "🪙 Недостаточно монет"
    );

    return;
  }

  state.coins -= cost;

  state.heroLevels[id] =
    lvl + 1;

  saveState();

  showToast(
    `⬆️ ${heroes[id].name} LVL ${lvl + 1}`
  );

  heroesPage();
}

/* =========================
   REWARDS
========================= */

function rewards() {

  const today =
    new Date()
      .toISOString()
      .slice(0,10);

  const canClaim =
    state.lastDaily !== today;

  app.innerHTML = `

    ${header("Награды")}

    <main class="page">

      <div class="page-heading">

        <div class="eyebrow">
          REWARDS
        </div>

        <h1>
          Награды
        </h1>

        <p>
          Забирай ежедневные
          бонусы и выполняй задания.
        </p>

      </div>

      <section class="daily-card">

        <div class="daily-icon">
          🎁
        </div>

        <div class="daily-info">

          <span>
            DAILY REWARD
          </span>

          <h2>
            Ежедневный бонус
          </h2>

          <p>
            500 🪙 + 2 💎
          </p>

        </div>

        <button
          class="claim-btn"
          onclick="claimDaily()"
          ${canClaim ? "" : "disabled"}
        >
          ${
            canClaim
              ? "ЗАБРАТЬ"
              : "ЗАБРАНО"
          }
        </button>

      </section>

      <div class="section-title">
        <h2>
          Задания
        </h2>
      </div>

      <div class="missions">

        <div class="mission">

          <div class="mission-icon">
            ⚔️
          </div>

          <div class="mission-info">

            <strong>
              Боец
            </strong>

            <span>
              Проведи 3 битвы
            </span>

          </div>

          <div class="mission-reward">
            +1000 🪙
          </div>

        </div>

        <div class="mission">

          <div class="mission-icon">
            🏆
          </div>

          <div class="mission-info">

            <strong>
              Победитель
            </strong>

            <span>
              Одержи 5 побед
            </span>

          </div>

          <div class="mission-reward">
            +5 💎
          </div>

        </div>

        <div class="mission">

          <div class="mission-icon">
            🧬
          </div>

          <div class="mission-info">

            <strong>
              Развитие
            </strong>

            <span>
              Улучши героя
            </span>

          </div>

          <div class="mission-reward">
            +1500 🪙
          </div>

        </div>

      </div>

    </main>

    ${bottomNav("rewards")}
  `;

  window.scrollTo(0,0);
}

function claimDaily() {

  const today =
    new Date()
      .toISOString()
      .slice(0,10);

  if (
    state.lastDaily === today
  ) {

    showToast(
      "🎁 Уже забрано"
    );

    return;
  }

  state.coins += 500;
  state.gems += 2;

  state.lastDaily = today;

  saveState();

  showToast(
    "🎁 +500 🪙 +2 💎"
  );

  rewards();
}

/* =========================
   SHOP
========================= */

function shop() {

  app.innerHTML = `

    ${header("Магазин")}

    <main class="page">

      <div class="page-heading">

        <div class="eyebrow">
          MARKET
        </div>

        <h1>
          Магазин
        </h1>

        <p>
          Ресурсы и усиления
          для твоей команды.
        </p>

      </div>

      <div class="shop-grid">

        <div class="shop-card featured">

          <div class="shop-art">
            🎁
          </div>

          <span class="shop-tag">
            BEST VALUE
          </span>

          <h3>
            Hero Chest
          </h3>

          <p>
            Случайная награда.
          </p>

          <div class="shop-price">
            1000 🪙
          </div>

          <button
            onclick="buyChest()"
          >
            КУПИТЬ
          </button>

        </div>

        <div class="shop-card">

          <div class="shop-art">
            ⚡
          </div>

          <h3>
            Energy Pack
          </h3>

          <p>
            +10 энергии.
          </p>

          <div class="shop-price">
            500 🪙
          </div>

          <button
            onclick="buyEnergy()"
          >
            КУПИТЬ
          </button>

        </div>

        <div class="shop-card">

          <div class="shop-art">
            💎
          </div>

          <h3>
            Gem Pack
          </h3>

          <p>
            +10 Gems.
          </p>

          <div class="shop-price">
            1000 🪙
          </div>

          <button
            onclick="buyGems()"
          >
            КУПИТЬ
          </button>

        </div>

        <div class="shop-card">

          <div class="shop-art">
            ❤️
          </div>

          <h3>
            Full Energy
          </h3>

          <p>
            Полностью восстановит энергию.
          </p>

          <div class="shop-price">
            750 🪙
          </div>

          <button
            onclick="fullEnergy()"
          >
            КУПИТЬ
          </button>

        </div>

      </div>

    </main>

    ${bottomNav("shop")}
  `;

  window.scrollTo(0,0);
}

function buyChest() {

  if (state.coins < 1000) {

    showToast(
      "🪙 Недостаточно монет"
    );

    return;
  }

  state.coins -= 1000;

  const roll =
    Math.random();

  if (roll < .45) {

    state.coins += 2500;

    showToast(
      "🎁 +2500 🪙"
    );

  } else if (roll < .75) {

    state.gems += 8;

    showToast(
      "🎁 +8 💎"
    );

  } else {

    state.energy =
      Math.min(
        state.maxEnergy,
        state.energy + 10
      );

    showToast(
      "🎁 +10 ⚡"
    );
  }

  saveState();

  shop();
}

function buyEnergy() {

  if (state.coins < 500) {

    showToast(
      "🪙 Недостаточно монет"
    );

    return;
  }

  state.coins -= 500;

  state.energy =
    Math.min(
      state.maxEnergy,
      state.energy + 10
    );

  saveState();

  showToast(
    "⚡ +10 энергии"
  );

  shop();
}

function buyGems() {

  if (state.coins < 1000) {

    showToast(
      "🪙 Недостаточно монет"
    );

    return;
  }

  state.coins -= 1000;
  state.gems += 10;

  saveState();

  showToast(
    "💎 +10 Gems"
  );

  shop();
}

function fullEnergy() {

  if (state.coins < 750) {

    showToast(
      "🪙 Недостаточно монет"
    );

    return;
  }

  state.coins -= 750;
  state.energy =
    state.maxEnergy;

  saveState();

  showToast(
    "⚡ Энергия полностью восстановлена"
  );

  shop();
}

/* =========================
   TOAST
========================= */

function showToast(message) {

  const old =
    document.querySelector(
      ".game-toast"
    );

  if (old) {
    old.remove();
  }

  const toast =
    document.createElement("div");

  toast.className =
    "game-toast";

  toast.textContent =
    message;

  document.body.appendChild(
    toast
  );

  setTimeout(() => {
    toast.classList.add("show");
  }, 10);

  setTimeout(() => {

    toast.classList.remove(
      "show"
    );

    setTimeout(() => {
      toast.remove();
    }, 250);

  }, 1800);
}

/* =========================
   GLOBAL FUNCTIONS
========================= */

window.home = home;
window.mapPage = mapPage;

window.openWorld = openWorld;
window.lockedWorld = lockedWorld;

window.renderStages = renderStages;
window.startStage = startStage;
window.lockedStage = lockedStage;

window.attack = attack;
window.useSkill = useSkill;
window.retryStage = retryStage;
window.nextStage = nextStage;

window.heroesPage = heroesPage;
window.upgradeHero = upgradeHero;

window.rewards = rewards;
window.claimDaily = claimDaily;

window.shop = shop;
window.buyChest = buyChest;
window.buyEnergy = buyEnergy;
window.buyGems = buyGems;
window.fullEnergy = fullEnergy;

/* =========================
   START
========================= */

initTelegram();
home();
