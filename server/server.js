import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { Pool } from "pg";

dotenv.config();
const app=express();
const pool=new Pool({connectionString:process.env.DATABASE_URL,ssl:process.env.DATABASE_URL?.includes("localhost")?false:{rejectUnauthorized:false}});
const PORT=Number(process.env.PORT||3000);
const FRONTEND_ORIGIN=process.env.FRONTEND_ORIGIN;
const BOT_TOKEN=process.env.BOT_TOKEN;
const JWT_SECRET=process.env.JWT_SECRET;
const GRAM_WALLET=process.env.GRAM_WALLET;
const USDT_WALLET=(process.env.USDT_BEP20_WALLET||"").toLowerCase();
const TONAPI_URL=(process.env.TONAPI_URL||"https://tonapi.io").replace(/\/$/,"");
const TONAPI_KEY=process.env.TONAPI_KEY;
const BSC_RPC_URL=process.env.BSC_RPC_URL;
const USDT_CONTRACT=(process.env.USDT_BEP20_CONTRACT||"0x55d398326f99059fF775485246999027B3197955").toLowerCase();
const REFERRAL_PERCENT=Number(process.env.REFERRAL_PERCENT||5);
const ORDER_TTL_MINUTES=Number(process.env.ORDER_TTL_MINUTES||30);
const GRAM_TO_NANO=1000000000n;
const BSC_USDT_DECIMALS=1000000000000000000n;
const TRANSFER_TOPIC="0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
const WORLD_REWARDS=[
 [100,180],[180,300],[300,500],[500,800],[800,1300],[1300,2000],[2000,3200],[3200,5000],[5000,8000],[8000,12000]
];
const HERO_BASE={lumi:{rarity:"Rare",hp:1100,damage:150},roxy:{rarity:"Epic",hp:1250,damage:175},nox:{rarity:"Legendary",hp:1450,damage:205},blitz:{rarity:"Legendary",hp:1500,damage:220}};
const PRODUCTS={
 gems_1:{name:"100 Gems",gram:"1",grant:{gems:100}},gems_5:{name:"550 Gems",gram:"5",grant:{gems:550}},gems_10:{name:"1,200 Gems",gram:"10",grant:{gems:1200}},gems_20:{name:"2,800 Gems",gram:"20",grant:{gems:2800}},gems_50:{name:"7,500 Gems",gram:"50",grant:{gems:7500}},gems_100:{name:"16,000 Gems",gram:"100",grant:{gems:16000}},
 chest_basic:{name:"Basic Chest",gram:"3",grant:{chest:"basic",count:1}},chest_rare:{name:"Rare Chest",gram:"7",grant:{chest:"rare",count:1}},chest_epic:{name:"Epic Chest",gram:"15",grant:{chest:"epic",count:1}},chest_legendary:{name:"Legendary Chest",gram:"30",grant:{chest:"legendary",count:1}},
 energy_10:{name:"Energy +10",gram:"2",grant:{energy:10}},energy_30:{name:"Energy +30",gram:"5",grant:{energy:30}},energy_full:{name:"Full Energy",gram:"3",grant:{fullEnergy:true}},
 starter_pack:{name:"Starter Pack",gram:"5",grant:{gems:500,coins:5000,chest:"rare",count:1,hero:"lumi"}},weekly_pack:{name:"Weekly Pack",gram:"15",grant:{gems:1500,coins:25000,chest:"rare",count:2,energy:30}},premium_pass:{name:"Premium Pass",gram:"25",grant:{passDays:30}},season_pack:{name:"Monthly / Season Pack",gram:"50",grant:{gems:7500,coins:150000,chest:"epic",count:1}},
 hero_lumi:{name:"Lumi — Rare Hero",gram:"15",grant:{hero:"lumi"}},hero_roxy:{name:"Roxy — Epic Hero",gram:"35",grant:{hero:"roxy"}},hero_nox:{name:"Nox — Legendary Hero",gram:"80",grant:{hero:"nox"}},hero_blitz_limited:{name:"Blitz — Limited Legendary",gram:"120",grant:{hero:"blitz"}}
};
function product(id){return PRODUCTS[id]||null;}
function makeId(prefix="HC"){return `${prefix}-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;}
function auth(req,res,next){try{const h=req.headers.authorization||"";if(!h.startsWith("Bearer "))throw 0;req.user=jwt.verify(h.slice(7),JWT_SECRET);next();}catch{res.status(401).json({error:"Unauthorized"});}}
function telegramCheckString(data){
 const params=new URLSearchParams(data);const hash=params.get("hash");params.delete("hash");
 const pairs=[...params.entries()].sort((a,b)=>a[0].localeCompare(b[0])).map(([k,v])=>`${k}=${v}`);
 const secret=crypto.createHmac("sha256","WebAppData").update(BOT_TOKEN).digest();
 const calculated=crypto.createHmac("sha256",secret).update(pairs.join("\n")).digest("hex");
 if(!hash||!crypto.timingSafeEqual(Buffer.from(hash),Buffer.from(calculated)))return null;
 const authDate=Number(params.get("auth_date")||0);if(!authDate||Date.now()/1000-authDate>86400)return null;
 try{return JSON.parse(params.get("user")||"{}");}catch{return null;}
}
function referralLink(id){const bot=(process.env.TELEGRAM_BOT_USERNAME||"").replace(/^@/,"");return bot?`https://t.me/${bot}?startapp=ref_${encodeURIComponent(id)}`:"";}
function parseReferral(s){const m=String(s||"").match(/^ref_(\d+)$/);return m?m[1]:null;}
function nano(v){const [a,b=""]=String(v).split(".");return BigInt(a||0)*GRAM_TO_NANO+BigInt((b+"000000000").slice(0,9));}
function usdt(v){const [a,b=""]=String(v).split(".");return BigInt(a||0)*BSC_USDT_DECIMALS+BigInt((b+"000000000000000000").slice(0,18));}
function randomUsdtQuote(base){const scaled=BigInt(Math.round(Number(base)*10000))+BigInt(Math.floor(Math.random()*90)+10);return `${scaled/10000n}.${String(scaled%10000n).padStart(4,"0")}`;}
function json(v,f){return v&&typeof v==="object"?v:f;}
function dayKey(){return new Date().toISOString().slice(0,10);}
const DAILY_QUESTS={battle3:{target:3,rewardGems:100},wins5:{target:5,rewardGems:200},upgrade1:{target:1,rewardCoins:300},chest1:{target:1,rewardGems:100}};
function dailyState(v){const d=json(v,{}); if(d.day!==dayKey()) return {day:dayKey(),progress:{battle3:0,wins5:0,upgrade1:0,chest1:0},claimed:{}}; return {day:d.day,progress:{battle3:0,wins5:0,upgrade1:0,chest1:0,...json(d.progress,{})},claimed:json(d.claimed,{})};}
async function userStats(id){
 const u=(await pool.query("SELECT * FROM users WHERE telegram_id=$1",[id])).rows[0];if(!u)return null;
 const refs=Number((await pool.query("SELECT COUNT(*)::int c FROM referrals WHERE referrer_id=$1",[id])).rows[0].c);
 const ds=dailyState(u.daily_state);
 return {user:{telegramId:id,username:u.username,firstName:u.first_name,lastName:u.last_name,referralLink:referralLink(id)},referrals:refs,referralEarned:Number(u.referral_earned||0),quests:{progress:ds.progress,claimed:ds.claimed,definitions:DAILY_QUESTS},game:{coins:Number(u.coins),gems:Number(u.gems),energy:Number(u.energy),xp:Number(u.xp),level:Number(u.level),wins:Number(u.wins),battles:Number(u.battles),fragments:Number(u.fragments),tickets:Number(u.tickets),currentWorld:Number(u.current_world),currentStage:Number(u.current_stage),heroLevels:json(u.hero_levels,{}),cleared:json(u.cleared_stages,{}),chests:json(u.chests,{basic:0,rare:0,epic:0,legendary:0}),premiumUntil:u.premium_until}};
}
function gameReward(world,stage){const [min,max]=WORLD_REWARDS[world-1]||WORLD_REWARDS[0];return {coins:min+crypto.randomInt(max-min+1),gems:2+crypto.randomInt(3),xp:20+world*5};}
function heroStats(id,level){const h=HERO_BASE[id]||HERO_BASE.lumi;return {hp:h.hp+level*35,damage:h.damage+level*8};}
function upgradeCost(level){return Math.max(100,Math.floor(100*Math.pow(1.35,level-1)));}
function normalizeProgress(world,stage){if(world<1||world>10||stage<1||stage>20)throw new Error("Invalid stage");}

app.use(cors({origin:FRONTEND_ORIGIN,methods:["GET","POST"],allowedHeaders:["Content-Type","Authorization"]}));app.use(express.json({limit:"1mb"}));

async function verifyTelegramUser(req,res,next){const u=telegramCheckString(req.body?.initData||"");if(!u?.id)return res.status(401).json({error:"Invalid Telegram initData"});req.tg=u;next();}
app.post("/api/auth/login",verifyTelegramUser,async(req,res)=>{
 const id=String(req.tg.id),ref=parseReferral(req.body.startParam);const c=await pool.connect();
 try{await c.query("BEGIN");const existing=(await c.query("SELECT * FROM users WHERE telegram_id=$1 FOR UPDATE",[id])).rows[0];
  if(!existing){let referredBy=null;if(ref&&ref!==id&&(await c.query("SELECT 1 FROM users WHERE telegram_id=$1",[ref])).rowCount)referredBy=ref;await c.query("INSERT INTO users(telegram_id,username,first_name,last_name,referred_by) VALUES($1,$2,$3,$4,$5)",[id,req.tg.username||null,req.tg.first_name||"",req.tg.last_name||"",referredBy]);if(referredBy)await c.query("INSERT INTO referrals(referrer_id,referred_id) VALUES($1,$2) ON CONFLICT DO NOTHING",[referredBy,id]);}
  else await c.query("UPDATE users SET username=$2,first_name=$3,last_name=$4,last_activity=NOW() WHERE telegram_id=$1",[id,req.tg.username||null,req.tg.first_name||"",req.tg.last_name||""]);
  await c.query("COMMIT");const token=jwt.sign({telegramId:id},JWT_SECRET,{expiresIn:"30d"});res.json({token,...await userStats(id)});
 }catch(e){await c.query("ROLLBACK");res.status(500).json({error:e.message});}finally{c.release();}
});
app.get("/api/me",auth,async(req,res)=>res.json(await userStats(String(req.user.telegramId))));

// SERVER-AUTHORITATIVE GAME
app.post("/api/game/battle/start",auth,async(req,res)=>{
 const id=String(req.user.telegramId),world=Number(req.body.world),stage=Number(req.body.stage||1);try{normalizeProgress(world,stage);}catch(e){return res.status(400).json({error:e.message});}
 const c=await pool.connect();try{await c.query("BEGIN");const u=(await c.query("SELECT * FROM users WHERE telegram_id=$1 FOR UPDATE",[id])).rows[0];
  if(!u)return res.status(404).json({error:"User not found"});
  if(world>Number(u.current_world))throw new Error("World locked");
  if(world===Number(u.current_world)&&stage>Number(u.current_stage))throw new Error("Stage locked");
  if(Number(u.energy)<3)throw new Error("Not enough energy");
  const levels=json(u.hero_levels,{}),heroId=["lumi","roxy","nox","blitz"].find(x=>Number(levels[x]||1)>0)||"lumi",hs=heroStats(heroId,Number(levels[heroId]||1));
  const enemyMax=500+world*350+stage*80;const reward=gameReward(world,stage);const first=!json(u.cleared_stages,{} )[`${world}-${stage}`];const battleId=makeId("B");
  const ds=dailyState(u.daily_state); ds.progress.battle3=Math.min(3,Number(ds.progress.battle3||0)+1); await c.query("UPDATE users SET energy=energy-3,battles=battles+1,daily_state=$2,last_activity=NOW() WHERE telegram_id=$1",[id,JSON.stringify(ds)]);
  await c.query("INSERT INTO active_battles(battle_id,telegram_id,world,stage,enemy_hp,enemy_max_hp,hero_hp,hero_max_hp,reward_coins,reward_gems,reward_xp,first_clear) VALUES($1,$2,$3,$4,$5,$5,$6,$6,$7,$8,$9,$10)",[battleId,id,world,stage,enemyMax,hs.hp,reward.coins,reward.gems,reward.xp,first]);
  await c.query("COMMIT");res.json({battleId,world,stage,enemyHp:enemyMax,enemyMaxHp:enemyMax,heroHp:hs.hp,heroMaxHp:hs.hp,heroId,reward,firstClear:first});
 }catch(e){await c.query("ROLLBACK");res.status(400).json({error:e.message});}finally{c.release();}
});
app.post("/api/game/battle/action",auth,async(req,res)=>{
 const id=String(req.user.telegramId),bid=String(req.body.battleId||""),action=String(req.body.action||"attack");const c=await pool.connect();
 try{await c.query("BEGIN");const b=(await c.query("SELECT * FROM active_battles WHERE battle_id=$1 AND telegram_id=$2 FOR UPDATE",[bid,id])).rows[0];if(!b)throw new Error("Battle not found");if(b.status!=="active")throw new Error("Battle finished");
  if(new Date(b.updated_at).getTime()<Date.now()-15*60*1000)throw new Error("Battle expired");
  const u=(await c.query("SELECT * FROM users WHERE telegram_id=$1 FOR UPDATE",[id])).rows[0];const levels=json(u.hero_levels,{});const heroId=["lumi","roxy","nox","blitz"].find(x=>Number(levels[x]||1)>0)||"lumi";const hs=heroStats(heroId,Number(levels[heroId]||1));
  const mult=action==="ultimate"?2.4:action.startsWith("skill")?1.55:1;const damage=Math.floor((hs.damage+crypto.randomInt(45))*mult);let enemy=Math.max(0,Number(b.enemy_hp)-damage);let hero=Number(b.hero_hp);let status="active";let reward=null;
  if(enemy>0){hero=Math.max(0,hero-(70+crypto.randomInt(50)));if(hero<=0)status="lost";}else{status="won";reward={coins:Number(b.reward_coins),gems:Number(b.reward_gems),xp:Number(b.reward_xp),firstClear:b.first_clear};let gems=reward.gems,frags=0;let cleared=json(u.cleared_stages,{});if(b.first_clear){gems+=10;frags=1;cleared[`${b.world}-${b.stage}`]=true;}if(Number(b.stage)%20===0)gems+=25;else if(Number(b.stage)%5===0)gems+=5;let xp=Number(u.xp)+Number(b.reward_xp),level=Number(u.level); const ds=dailyState(u.daily_state); ds.progress.wins5=Math.min(5,Number(ds.progress.wins5||0)+1);while(xp>=100){xp-=100;level++;}
    let cw=Number(u.current_world),cs=Number(u.current_stage);if(b.world===cw&&b.stage===cs){if(cs<20)cs++;else if(cw<10){cw++;cs=1;}}await c.query("UPDATE users SET wins=wins+1,coins=coins+$2,gems=gems+$3,xp=$4,level=$5,fragments=fragments+$6,current_world=$7,current_stage=$8,cleared_stages=$9,daily_state=$10,last_activity=NOW() WHERE telegram_id=$1",[id,reward.coins,gems,xp,level,frags,cw,cs,JSON.stringify(cleared),JSON.stringify(ds)]);await c.query("INSERT INTO ledger(telegram_id,type,coins,gems,fragments) VALUES($1,'battle',$2,$3,$4)",[id,reward.coins,gems,frags]);
  }
  await c.query("UPDATE active_battles SET enemy_hp=$2,hero_hp=$3,status=$4,updated_at=NOW() WHERE battle_id=$1",[bid,enemy,hero,status]);await c.query("COMMIT");res.json({status,enemyHp:enemy,heroHp:hero,damage,reward});
 }catch(e){await c.query("ROLLBACK");res.status(400).json({error:e.message});}finally{c.release();}
});
app.post("/api/game/hero/upgrade",auth,async(req,res)=>{const id=String(req.user.telegramId),hero=String(req.body.hero||""),c=await pool.connect();try{await c.query("BEGIN");if(!HERO_BASE[hero])throw new Error("Unknown hero");const u=(await c.query("SELECT * FROM users WHERE telegram_id=$1 FOR UPDATE",[id])).rows[0];let levels=json(u.hero_levels,{});const lv=Number(levels[hero]||1);if(lv>=50)throw new Error("Hero is max level");const cost=upgradeCost(lv);if(Number(u.coins)<cost)throw new Error("Not enough coins");levels[hero]=lv+1; const ds=dailyState(u.daily_state); ds.progress.upgrade1=Math.min(1,Number(ds.progress.upgrade1||0)+1); await c.query("UPDATE users SET coins=coins-$2,hero_levels=$3,daily_state=$4,last_activity=NOW() WHERE telegram_id=$1",[id,cost,JSON.stringify(levels),JSON.stringify(ds)]);await c.query("INSERT INTO ledger(telegram_id,type,coins) VALUES($1,'hero_upgrade',$2)",[id,-cost]);await c.query("COMMIT");res.json({hero,level:lv+1,cost,game:(await userStats(id)).game});}catch(e){await c.query("ROLLBACK");res.status(400).json({error:e.message});}finally{c.release();}});

// REAL CHEST INVENTORY + OPENING
const CHEST_TABLE={basic:{gems:[200,500],coins:[500,1500],frag:[0,2]},rare:{gems:[500,1000],coins:[1500,5000],frag:[2,5]},epic:{gems:[1000,2500],coins:[5000,15000],frag:[5,15]},legendary:{gems:[2500,5000],coins:[15000,40000],frag:[10,30]}};
function randRange([a,b]){return a+crypto.randomInt(b-a+1);}
app.post("/api/game/chest/open",auth,async(req,res)=>{const id=String(req.user.telegramId),type=String(req.body.type||""),c=await pool.connect();try{await c.query("BEGIN");if(!CHEST_TABLE[type])throw new Error("Unknown chest");const u=(await c.query("SELECT * FROM users WHERE telegram_id=$1 FOR UPDATE",[id])).rows[0];let ch=json(u.chests,{});if(Number(ch[type]||0)<1)throw new Error("No chest available");ch[type]--;let gems=randRange(CHEST_TABLE[type].gems),coins=randRange(CHEST_TABLE[type].coins),fragments=randRange(CHEST_TABLE[type].frag); const ds=dailyState(u.daily_state); ds.progress.chest1=Math.min(1,Number(ds.progress.chest1||0)+1);let hero=null;if(type==="legendary"){hero=crypto.randomInt(100)<8?"nox":"roxy";}else if(type==="epic"&&crypto.randomInt(100)<18)hero="roxy";else if(type==="rare"&&crypto.randomInt(100)<15)hero="lumi";if(hero){const heroes=json(u.heroes,[]);if(!heroes.includes(hero))heroes.push(hero);else fragments += hero==="nox"?30:hero==="roxy"?20:10;await c.query("UPDATE users SET heroes=$2 WHERE telegram_id=$1",[id,JSON.stringify(heroes)]);}await c.query("UPDATE users SET gems=gems+$2,coins=coins+$3,fragments=fragments+$4,chests=$5,daily_state=$6 WHERE telegram_id=$1",[id,gems,coins,fragments,JSON.stringify(ch),JSON.stringify(ds)]);await c.query("INSERT INTO ledger(telegram_id,type,coins,gems,fragments) VALUES($1,'chest',$2,$3,$4)",[id,coins,gems,fragments]);await c.query("COMMIT");res.json({type,gems,coins,fragments,hero,chests:ch});}catch(e){await c.query("ROLLBACK");res.status(400).json({error:e.message});}finally{c.release();}});

// SHOP / PAYMENTS
async function grantOrder(client,order){const p=product(order.product_id);if(!p)throw new Error("Unknown product");const u=(await client.query("SELECT * FROM users WHERE telegram_id=$1 FOR UPDATE",[order.telegram_id])).rows[0];const g=p.grant||{};let coins=Number(g.coins||0),gems=Number(g.gems||0),energy=Number(g.energy||0),heroId=g.hero||null;let ch=json(u.chests,{basic:0,rare:0,epic:0,legendary:0});if(g.chest)ch[g.chest]=Number(ch[g.chest]||0)+Number(g.count||1);let newEnergy=Math.min(30,Number(u.energy)+energy);if(g.fullEnergy)newEnergy=30;let heroes=json(u.heroes,[]);if(heroId&&!heroes.includes(heroId))heroes.push(heroId);await client.query(`UPDATE users SET coins=coins+$2,gems=gems+$3,energy=$4,heroes=$5,chests=$6,premium_until=CASE WHEN $7::int>0 THEN GREATEST(COALESCE(premium_until,NOW()),NOW())+($7||' days')::interval ELSE premium_until END,last_activity=NOW() WHERE telegram_id=$1`,[order.telegram_id,coins,gems,newEnergy,JSON.stringify(heroes),JSON.stringify(ch),Number(g.passDays||0)]);await client.query(`INSERT INTO ledger(telegram_id,order_id,type,coins,gems,energy) VALUES($1,$2,'purchase',$3,$4,$5)`,[order.telegram_id,order.order_id,coins,gems,energy]);if(REFERRAL_PERCENT>0&&gems>0){const ref=(await client.query("SELECT referred_by FROM users WHERE telegram_id=$1",[order.telegram_id])).rows[0]?.referred_by;if(ref){const bonus=Math.floor(gems*REFERRAL_PERCENT/100);if(bonus>0){await client.query("UPDATE users SET gems=gems+$2,referral_earned=referral_earned+$2 WHERE telegram_id=$1",[ref,bonus]);await client.query("INSERT INTO ledger(telegram_id,order_id,type,gems) VALUES($1,$2,'referral',$3)",[ref,order.order_id,bonus]);}}}await client.query("UPDATE orders SET status='paid',paid_at=NOW() WHERE order_id=$1",[order.order_id]);}
app.post("/api/order/create",auth,async(req,res)=>{const p=product(req.body.productId),method=req.body.method;if(!p||!["GRAM","USDT"].includes(method))return res.status(400).json({error:"Invalid product or payment method"});let amount=method==="GRAM"?p.gram:null;if(method==="USDT"){const raw=process.env.GRAM_USDT_RATE||"";const rate=Number(raw);if(!rate)return res.status(503).json({error:"GRAM_USDT_RATE is not configured"});amount=randomUsdtQuote(Number(p.gram)*rate);}const base=method==="GRAM"?nano(amount)+BigInt(crypto.randomInt(1000,100000)):usdt(amount);const orderId=makeId();const expires=new Date(Date.now()+ORDER_TTL_MINUTES*60000);const comment=`HERO_CLASH:${orderId}`;await pool.query(`INSERT INTO orders(order_id,telegram_id,product_id,product_name,method,amount,currency,amount_base_units,address,comment,expires_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,[orderId,String(req.user.telegramId),req.body.productId,p.name,method,amount,method,base.toString(),method==="GRAM"?GRAM_WALLET:USDT_WALLET,comment,expires]);res.json({orderId,productName:p.name,method,amount,currency:method,address:method==="GRAM"?GRAM_WALLET:USDT_WALLET,amountNano:method==="GRAM"?base.toString():undefined,comment,commentPayload:undefined,expiresAt:expires.toISOString()});});
app.get("/api/order/:id",auth,async(req,res)=>{const o=(await pool.query("SELECT * FROM orders WHERE order_id=$1 AND telegram_id=$2",[req.params.id,String(req.user.telegramId)])).rows[0];if(!o)return res.status(404).json({error:"Order not found"});if(o.status==="pending"&&new Date(o.expires_at)<new Date()){await pool.query("UPDATE orders SET status='expired' WHERE order_id=$1 AND status='pending'",[o.order_id]);o.status="expired";}res.json({orderId:o.order_id,status:o.status,productName:o.product_name,method:o.method,amount:o.amount,currency:o.currency});});

async function tonHeaders(){return TONAPI_KEY?{Authorization:`Bearer ${TONAPI_KEY}`}:{}};
async function scanGram(){if(!TONAPI_URL||!GRAM_WALLET)return;try{const r=await fetch(`${TONAPI_URL}/v2/blockchain/accounts/${encodeURIComponent(GRAM_WALLET)}/transactions?limit=100`,{headers:await tonHeaders()});if(!r.ok)return;const d=await r.json();for(const t of d.transactions||[]){const msg=t.in_msg||{};const hash=t.hash||t.tx_hash,value=msg.value;if(!hash||!value)continue;const o=(await pool.query("SELECT * FROM orders WHERE method='GRAM' AND status='pending' AND amount_base_units=$1 AND expires_at>NOW()",[String(value)])).rows[0];if(o)await creditVerified(o,hash,Number(value)/1e9);}}catch(e){console.error("GRAM scanner",e.message)}}
async function bscRpc(method,params){const r=await fetch(BSC_RPC_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:1,method,params})});const j=await r.json();if(j.error)throw new Error(j.error.message);return j.result;}
function topicAddress(a){return "0x"+"0".repeat(24)+a.replace(/^0x/,"").toLowerCase();}
async function scanUsdt(){if(!BSC_RPC_URL||!USDT_WALLET)return;try{const latest=BigInt(await bscRpc("eth_blockNumber",[])),confirm=BigInt(process.env.BSC_CONFIRMATIONS||12);const safe=latest>confirm?latest-confirm:0n;const from=safe>1000n?safe-1000n:0n;const logs=await bscRpc("eth_getLogs",[{fromBlock:"0x"+from.toString(16),toBlock:"0x"+safe.toString(16),address:USDT_CONTRACT,topics:[TRANSFER_TOPIC,null,topicAddress(USDT_WALLET)]}]);for(const l of logs||[]){const txHash=l.transactionHash;if(!txHash||(await pool.query("SELECT 1 FROM payments WHERE tx_hash=$1",[txHash])).rowCount)continue;const raw=BigInt(l.data),o=(await pool.query("SELECT * FROM orders WHERE method='USDT' AND status='pending' AND amount_base_units=$1 AND expires_at>NOW()",[raw.toString()])).rows[0];if(o)await creditVerified(o,txHash,Number(raw)/1e18);}}catch(e){console.error("USDT scanner",e.message)}}
async function creditVerified(order,hash,amount){const c=await pool.connect();try{await c.query("BEGIN");const locked=(await c.query("SELECT * FROM orders WHERE order_id=$1 FOR UPDATE",[order.order_id])).rows[0];if(!locked||locked.status!=="pending"){await c.query("ROLLBACK");return;}if((await c.query("SELECT 1 FROM payments WHERE tx_hash=$1",[hash])).rowCount){await c.query("ROLLBACK");return;}await c.query("INSERT INTO payments(tx_hash,order_id,method,amount) VALUES($1,$2,$3,$4)",[hash,order.order_id,order.method,amount]);await grantOrder(c,locked);await c.query("UPDATE orders SET tx_hash=$2 WHERE order_id=$1",[order.order_id,hash]);await c.query("COMMIT");}catch(e){await c.query("ROLLBACK");console.error("credit",e.message)}finally{c.release();}}
setInterval(()=>{scanGram();scanUsdt();},7000);

app.get("/api/quests",auth,async(req,res)=>{const u=(await pool.query("SELECT daily_state FROM users WHERE telegram_id=$1",[String(req.user.telegramId)])).rows[0];if(!u)return res.status(404).json({error:"User not found"});const d=dailyState(u.daily_state);await pool.query("UPDATE users SET daily_state=$2 WHERE telegram_id=$1",[String(req.user.telegramId),JSON.stringify(d)]);res.json({progress:d.progress,claimed:d.claimed,definitions:DAILY_QUESTS});});
app.post("/api/quests/claim",auth,async(req,res)=>{const id=String(req.user.telegramId),qid=String(req.body.id||"");if(!DAILY_QUESTS[qid])return res.status(400).json({error:"Unknown quest"});const c=await pool.connect();try{await c.query("BEGIN");const u=(await c.query("SELECT * FROM users WHERE telegram_id=$1 FOR UPDATE",[id])).rows[0];const d=dailyState(u.daily_state);if(d.claimed[qid])throw new Error("Quest already claimed");if(Number(d.progress[qid]||0)<DAILY_QUESTS[qid].target)throw new Error("Quest not complete");const q=DAILY_QUESTS[qid];await c.query("UPDATE users SET gems=gems+$2,coins=coins+$3,daily_state=$4 WHERE telegram_id=$1",[id,q.rewardGems||0,q.rewardCoins||0,JSON.stringify({...d,claimed:{...d.claimed,[qid]:true}})]);await c.query("INSERT INTO ledger(telegram_id,type,coins,gems) VALUES($1,'daily_quest',$2,$3)",[id,q.rewardCoins||0,q.rewardGems||0]);await c.query("COMMIT");res.json(await userStats(id));}catch(e){await c.query("ROLLBACK");res.status(400).json({error:e.message});}finally{c.release();}});
app.get("/api/leaderboard",auth,async(req,res)=>{const rows=(await pool.query("SELECT telegram_id,username,first_name,level,wins FROM users ORDER BY wins DESC,level DESC LIMIT 50")).rows;res.json({items:rows.map((x,i)=>({rank:i+1,telegramId:x.telegram_id,username:x.username,firstName:x.first_name,level:Number(x.level),wins:Number(x.wins)}))});});
app.get("/health",(_,res)=>res.json({ok:true,service:"hero-clash-backend",version:"2.0"}));
app.listen(PORT,()=>console.log(`Hero Clash backend listening on ${PORT}`));
