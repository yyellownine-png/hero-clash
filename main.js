const heroes=[
{name:"Люми",rarity:"MYTHIC",power:8420,emoji:"🧚",hp:100,type:"Свет"},
{name:"Рокси",rarity:"LEGENDARY",power:7210,emoji:"🐯",hp:100,type:"Огонь"},
{name:"Нокс",rarity:"EPIC",power:6140,emoji:"🦊",hp:100,type:"Тень"},
{name:"Блиц",rarity:"RARE",power:4810,emoji:"🐰",hp:100,type:"Молния"}
];
const zones=[
{name:"Неоновый лес",emoji:"🌳",levels:5,color:"pink",boss:"🌺 Лесная королева"},
{name:"Золотая пустыня",emoji:"🏜️",levels:5,color:"gold",boss:"🦂 Песчаный титан"},
{name:"Ледяное королевство",emoji:"❄️",levels:5,color:"ice",boss:"🐲 Ледяной дракон"},
{name:"Лавовый мир",emoji:"🌋",levels:5,color:"red",boss:"🔥 Огненный лорд"},
{name:"Космический город",emoji:"🌌",levels:5,color:"violet",boss:"👾 Косморазрушитель"}
];
let state={coins:12480,energy:8,xp:240,level:12,zone:0,stage:3};

const app=document.querySelector("#app");
const top=()=>`<header><button class="icon" onclick="home()">H</button><div class="logo">HERO <span>CLASH</span></div><div class="resources">💰 ${state.coins.toLocaleString()} &nbsp; ⚡ ${state.energy}</div></header>`;

function home(){app.innerHTML=`<div class="game">${top()}<section class="hero"><div class="heroGlow">🧚</div><span class="rarity">MYTHIC</span><h1>ЛЮМИ</h1><p>Хранительница звёзд</p><div class="power">⚡ 8 420 СИЛЫ</div><button class="mainBtn" onclick="mapPage()">🗺️ ПРИКЛЮЧЕНИЕ</button></section><div class="quick"><div>🏆<b>1 284</b><small>Рейтинг</small></div><div>⭐<b>${state.level}</b><small>Уровень</small></div><div>💎<b>24</b><small>Героя</small></div></div><section class="event"><div><small>СЕЙЧАС</small><h2>🔥 БИТВА С БОССОМ</h2><p>До конца события: 18:42:07</p></div><button onclick="battle(0,true)">⚔️</button></section><nav><button class="active" onclick="home()">🏠<span>Главная</span></button><button onclick="heroesPage()">🧬<span>Герои</span></button><button onclick="mapPage()">⚔️<span>Бой</span></button><button onclick="rewards()">🎁<span>Награды</span></button><button onclick="shop()">🛍️<span>Магазин</span></button></nav></div>`}

function mapPage(){app.innerHTML=`<div class="game">${top()}<div class="titleRow"><div><small>МИРЫ</small><h1>🗺️ ПРИКЛЮЧЕНИЕ</h1></div><span>${state.zone+1}/5</span></div><div class="map">${zones.map((z,i)=>`<div class="zone ${i>state.zone?'locked':''} ${z.color}"><div class="zoneArt">${z.emoji}</div><div class="zoneInfo"><small>МИР ${i+1}</small><h2>${z.name}</h2><p>${i<=state.zone?`Уровень ${Math.min(state.stage,5)}/5`:"🔒 Заблокировано"}</p></div><button ${i>state.zone?'disabled':''} onclick="battle(${i},${state.stage===5})">${i>state.zone?'🔒':'▶'}</button></div>`).join("")}</div><nav><button onclick="home()">🏠<span>Главная</span></button><button onclick="heroesPage()">🧬<span>Герои</span></button><button class="active" onclick="mapPage()">⚔️<span>Бой</span></button><button onclick="rewards()">🎁<span>Награды</span></button><button onclick="shop()">🛍️<span>Магазин</span></button></nav></div>`}

function battle(zone=0,boss=false){if(state.energy<=0){alert("⚡ Энергия закончилась!");return}state.energy--;let enemy=boss?zones[zone].boss:["👾 Слизень","🤖 Бот-охранник","🦇 Тёмный зверь","🧟 Мутант"][Math.min(state.stage-1,3)];app.innerHTML=`<div class="battleScreen"><div class="battleTop"><button onclick="mapPage()">←</button><b>${boss?'👹 БОСС':'⚔️ БОЙ'}</b><span>⚡ ${state.energy}</span></div><div class="arena"><div class="enemy"><div class="enemyArt">${enemy}</div><div class="bar"><i></i></div><b>${boss?'БОЛЬШОЙ БОСС':'ВРАГ'}</b></div><div class="vs">VS</div><div class="team">${heroes.slice(0,4).map((h,i)=>`<div class="fighter"><div>${h.emoji}</div><small>${h.name}</small><div class="bar"><i style="width:${h.hp}%"></i></div></div>`).join("")}</div></div><div class="skills"><button>✨</button><button>🔥</button><button>⚡</button><button>💥</button></div><button class="attack" onclick="win(${boss})">⚔️ АТАКОВАТЬ</button></div>`}

function win(boss){let reward=boss?1200:320;state.coins+=reward;state.xp+=boss?100:30;if(state.xp>=300){state.level++;state.xp=0}if(!boss){state.stage++;if(state.stage>5){state.stage=1;state.zone=Math.min(4,state.zone+1)}}app.innerHTML=`<div class="win"><div class="winBurst">🏆</div><h1>ПОБЕДА!</h1><p>${boss?'Босс повержен!':'Локация пройдена!'}</p><div class="loot"><div>💰<b>+${reward}</b><small>Монет</small></div><div>✨<b>+${boss?100:30}</b><small>Опыт</small></div><div>💎<b>+${boss?3:1}</b><small>Осколок</small></div></div><button class="mainBtn" onclick="mapPage()">ПРОДОЛЖИТЬ</button></div>`}

function heroesPage(){app.innerHTML=`<div class="game">${top()}<div class="titleRow"><div><small>КОЛЛЕКЦИЯ</small><h1>🧬 ГЕРОИ</h1></div><span>${heroes.length}/50</span></div><div class="heroGrid">${heroes.map(h=>`<article class="heroMini"><div class="miniArt">${h.emoji}</div><b>${h.name}</b><small>${h.rarity}</small><strong>⚡ ${h.power}</strong><button>⬆️ УЛУЧШИТЬ</button></article>`).join("")}</div><nav><button onclick="home()">🏠<span>Главная</span></button><button class="active" onclick="heroesPage()">🧬<span>Герои</span></button><button onclick="mapPage()">⚔️<span>Бой</span></button><button onclick="rewards()">🎁<span>Награды</span></button><button onclick="shop()">🛍️<span>Магазин</span></button></nav></div>`}

function rewards(){app.innerHTML=`<div class="game">${top()}<h1>🎁 НАГРАДЫ</h1><div class="reward"><b>Ежедневный бонус</b><span>День 4 / 7</span><button onclick="claim()">ЗАБРАТЬ +500 💰</button></div><div class="reward"><b>Боевой марафон</b><span>3 / 5 побед</span><button onclick="alert('Ещё 2 победы!')">ПРОГРЕСС</button></div><nav><button onclick="home()">🏠<span>Главная</span></button><button onclick="heroesPage()">🧬<span>Герои</span></button><button onclick="mapPage()">⚔️<span>Бой</span></button><button class="active" onclick="rewards()">🎁<span>Награды</span></button><button onclick="shop()">🛍️<span>Магазин</span></button></nav></div>`}
function claim(){state.coins+=500;alert("🎁 +500 монет!");rewards()}
function shop(){app.innerHTML=`<div class="game">${top()}<h1>🛍️ МАГАЗИН</h1><div class="shopGrid"><div class="product">🎁<b>Большой сундук</b><strong>1 000 💰</strong><button onclick="buy(1000)">КУПИТЬ</button></div><div class="product">⚡<b>20 энергии</b><strong>500 💰</strong><button onclick="buyEnergy()">КУПИТЬ</button></div></div></div>`}
function buy(v){if(state.coins<v)return alert("Не хватает монет");state.coins-=v;alert("🎉 Сундук открыт! +1 герой");home()}
function buyEnergy(){if(state.coins<500)return alert("Не хватает монет");state.coins-=500;state.energy+=20;shop()}
home();