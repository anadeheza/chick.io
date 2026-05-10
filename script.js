const PET_TYPES = {
  egg: [
    { sprite:'🐣', name:'EGG',    evo:'normal' },
    { sprite:'🐥', name:'CHICK',  evo:'normal' },
    { sprite:'🐦', name:'YOUNG BIRB',   evo:'normal' },
    { sprite:'🦜', name:'BIRD',  evo:'normal' },
    { sprite:'🦅', name:'LEGEND', evo:'normal'   },
    { sprite:'🐔', name:'CLUCKY', evo:'bad'    },
  ],
  cat: [
    { sprite:'🐱', name:'KITTEN', evo:'normal' },
    { sprite:'😺', name:'CAT',    evo:'normal' },
    { sprite:'😸', name:'HAPPY',  evo:'normal' },
    { sprite:'🦁', name:'LION',   evo:'normal'   },
    { sprite:'🙀', name:'FERAL',  evo:'bad'    },
  ],
  dog: [
    { sprite:'🐶', name:'PUPPY',  evo:'normal' },
    { sprite:'🐕', name:'DOG',    evo:'normal' },
    { sprite:'🦮', name:'GUIDE DOG',  evo:'normal' },
    { sprite:'🐺', name:'WOLF',   evo:'normal'   },
    { sprite:'🐩', name:'POODLE', evo:'bad'    },
  ],
};

const SHOP_ITEMS = [
  { id:'pizza',  emoji:'🍕', label:'PIZZA',   cost:5,  effect:()=>{ state.hunger=clamp(state.hunger+40); toast('PIZZA! YUM!'); } },
  { id:'cake',   emoji:'🎂', label:'CAKE',    cost:8,  effect:()=>{ state.hunger=clamp(state.hunger+30); state.happy=clamp(state.happy+20); toast('CAKE! 🎂'); } },
  { id:'ball',   emoji:'⚽', label:'BALL',    cost:6,  effect:()=>{ state.happy=clamp(state.happy+35); toast('SO FUN!'); } },
  { id:'med',    emoji:'🧪', label:'POTION',  cost:10, effect:()=>{ state.health=clamp(state.health+40); toast('SUPER HEAL!'); } },
  { id:'star',   emoji:'⭐', label:'LUCKY',   cost:15, effect:()=>{ state.hunger=clamp(state.hunger+20); state.happy=clamp(state.happy+20); state.health=clamp(state.health+20); toast('LUCKY STAR! ⭐'); } },
];

document.getElementById('start-btn').addEventListener('click', () => {
    document.getElementById('start').style.display = 'none';
    document.getElementById('tama-wrap').style.display = 'flex';
});

let state = {
  hunger: 80, 
  happy: 80, 
  health: 80,
  age: 0, 
  alive: true, 
  sleeping: false,
  poop: false, 
  stage: 0,
  tickCount: 0,
  coins: 0,
  petType: 'egg',
  petName: 'PIXEL',
  goodCare: 0,
  badCare: 0,
};

let stages = PET_TYPES.egg;
let tickInterval = null 
let maxAge = parseInt(localStorage.getItem('maxAge') || '0')


//  START, SETUP, GAME
document.getElementById('start-btn').addEventListener('click', () => {
  document.getElementById('start').style.display = 'none';
  document.getElementById('setup-screen').style.display = 'flex';
});
 
// Pet choice selection
document.getElementById('petChoices').addEventListener('click', e => {
  const choice = e.target.closest('.pet-choice');
  if (!choice) return;
  document.querySelectorAll('.pet-choice').forEach(c => c.classList.remove('selected'));
  choice.classList.add('selected');
  state.petType = choice.dataset.pet;
});
 
document.getElementById('begin-btn').addEventListener('click', () => {
  const nameVal = document.getElementById('nameInput').value.trim().toUpperCase();
  state.petName = nameVal || 'PIXEL';
  state.petType = document.querySelector('.pet-choice.selected').dataset.pet;
  stages = PET_TYPES[state.petType];
  document.getElementById('setup-screen').style.display = 'none';
  document.getElementById('tama-wrap').style.display = 'flex';
  startGame();
});
 
function startGame() {
  state.hunger=80; 
  state.happy=80; 
  state.health=80;
  state.age=0; 
  state.alive=true; 
  state.sleeping=false;
  state.poop=false; 
  state.stage=0; 
  state.tickCount=0;
  state.coins=0; 
  state.goodCare=0; 
  state.badCare=0;
 
  updateRecord();
  applyTimeOfDay();
  setInterval(applyTimeOfDay, 60000); // check minutes
 
  if (tickInterval) clearInterval(tickInterval);
  tickInterval = setInterval(tick, 3000);
  render();
}
 
const WEATHER = ['☀️','🌤️','⛅','🌧️','⛈️','🌈','❄️'];
let currentWeather = '☀️';
let weatherMoodMod = 0;
 
function applyTimeOfDay() {
  const h = new Date().getHours();
  let timeLabel, bgClass;
  if      (h >= 6  && h < 12) { timeLabel='MORNING'; bgClass='bg-morning'; }
  else if (h >= 12 && h < 18) { timeLabel='DAY';     bgClass='bg-day';     }
  else if (h >= 18 && h < 21) { timeLabel='SUNSET';  bgClass='bg-sunset';  }
  else                        { timeLabel='NIGHT';   bgClass='bg-night';   }
 
  document.getElementById('timeLabel').textContent = timeLabel;
  const wrap = document.getElementById('tama-wrap');
  wrap.className = 'tama-wrap ' + bgClass;
 
  // random weather change
  if (Math.random() < 0.2) {
    currentWeather = WEATHER[Math.floor(Math.random()*WEATHER.length)];
    weatherMoodMod = currentWeather === '🌈' ? 10 : currentWeather === '⛈️' ? -8 : currentWeather === '❄️' ? -5 : 0;
    document.getElementById('weatherIcon').textContent = currentWeather;
    if (weatherMoodMod !== 0) toast(currentWeather + (weatherMoodMod > 0 ? ' HAPPY!' : ' SAD...'));
  }
}
 
function tick() {
  if (!state.alive || state.sleeping) return;
  state.tickCount++;
 
  state.hunger = clamp(state.hunger - (Math.random()*4+2));
  state.happy  = clamp(state.happy  - (Math.random()*3+1) + weatherMoodMod*0.1);
  if (state.poop)        state.health = clamp(state.health - 2);
  if (state.hunger < 20) state.health = clamp(state.health - 2);
  if (state.hunger <= 0 || state.health <= 0) {
    die(); return;
  }
 
  // care quality
  if (state.hunger > 60 && state.happy > 60 && state.health > 60) state.goodCare++;
  else if (state.hunger < 30 || state.happy < 30 || state.health < 30) state.badCare++;
 
  // earn coins when happy
  if (state.happy > 70 && state.tickCount % 3 === 0) {
    state.coins++;
    document.getElementById('coinCount').textContent = state.coins;
  }
 
  // age up every 8 ticks
  if (state.tickCount % 8 === 0) {
    state.age++;
    evolveCheck();
  }
 
  // random sleep
  if (!state.sleeping && Math.random() < 0.04) {
    state.sleeping = true; toast('ZZZ...');
    setTimeout(()=>{ state.sleeping=false; render(); }, 6000);
  }
 
  // random poop
  if (!state.poop && Math.random() < 0.05) state.poop = true;
 
  render();
}
 
function evolveCheck() {
  const s = stages;
  if (state.stage >= s.length - 1) return;
 
  // normal stages at age 3, 6, 9
  if (state.age % 3 !== 0) return;
 
  // at last normal stage, pick bad/normal evo
  const nextNormal = s.findIndex((st, i) => i > state.stage && st.evo === 'normal');
  const goodEvo    = s.findIndex((st, i) => i > state.stage && st.evo === 'good');
  const badEvo     = s.findIndex((st, i) => i > state.stage && st.evo === 'bad');
 
  let nextStage;
  if (badEvo !== -1) {
    nextStage = state.goodCare > state.badCare * 2 ? nextNormal : badEvo;
  } else if (nextNormal !== -1) {
    nextStage = nextNormal;
  } else {
    return;
  }
 
  state.stage = nextStage;
  toast('EVOLVED! → ' + stages[state.stage].name);
  render();
}
 

const moodMap = (h, hp, hl) => {
  if (!state.alive) return '💀';
  if (state.sleeping) return '😴';
  if (hl < 20) return '🤒';
  if (h < 20) return '😫';
  if (hp < 20) return '😢';
  return;
};

function render(){
  const { hunger, happy, health, age, alive, sleeping, poop, stage } = state;
  
  const fills = [
    ['hungerFill', hunger],
    ['happyFill',  happy],
    ['healthFill', health],
  ];

  fills.forEach(([id, val]) => {
    const el = document.getElementById(id);
    el.style.width = val + '%';
    el.style.background = val < 25 ? '#ff4444' : val < 50 ? '#ffaa00' : '#9bbc0f';
  });

  document.getElementById('moodIcon').textContent   = moodMap(hunger, happy, health);
  document.getElementById('ageDisplay').textContent = 'AGE '+age;
  document.getElementById('petName').textContent    = stages[stage].name;

  const sprite   = document.getElementById('petSprite');
  const petStage = document.getElementById('petStage');

  sprite.textContent = alive ? stages[stage].sprite : '💀';
  sprite.classList.toggle('sick', alive && health < 20)

  // poop
  let oldPoop = petStage.querySelector('.poop');
  if (poop && !oldPoop) {
    const p = document.createElement('div');
    p.className='poop'; p.textContent='💩';
    p.style.cursor ='pointer';
    p.title = 'Tap to clean!';

    p.addEventListener('click', () => {
        state.poop = false;
        state.coins += 2;
        document.getElementById('coinCount').textContent = state.coins;
        toast('CLEANED! +2🪙')
        render();
    });
    petStage.appendChild(p);
  } else if (!poop && oldPoop) {
    oldPoop.remove();
  }

  // sleep
  let oldZz = petStage.querySelector('.zz');
  if (sleeping && !oldZz) {
    const z = document.createElement('div');
    z.className='zz'; z.textContent='z z z';
    petStage.appendChild(z);
  } else if (!sleeping && oldZz) {
    oldZz.remove();
  }

  // sick shake
  sprite.classList.toggle('sick', alive && health < 20);
}

//touch
document.getElementById('petSprite').addEventListener('click', () => {
  if (!state.alive || state.sleeping) return;
  state.happy = clamp(state.happy + 5);
  spawnHeart();
  bounceSprite();
  toast('🤍');
  render();
});
 
document.getElementById('btnFeed').addEventListener('click', () => {
  if (!state.alive || state.sleeping) { toast(state.sleeping ? 'ZZZ...' : '...'); return; }
  if (state.hunger >= 100) { toast('NOT HUNGRY!'); return; }
  state.hunger = clamp(state.hunger + 25);
  state.poop   = Math.random() > 0.6 ? true : state.poop;
  bounceSprite(); spawnHeart(); toast('YUM!');
  render();
});
 
document.getElementById('btnPlay').addEventListener('click', () => {
  if (!state.alive || state.sleeping) { toast(state.sleeping ? 'ZZZ...' : '...'); return; }
  if (state.hunger < 20) { toast('TOO HUNGRY!'); return; }
  openMinigame();
});
 
document.getElementById('btnHeal').addEventListener('click', () => {
  if (!state.alive) { restart(); return; }
  if (state.poop) {
    state.poop = false; state.health = clamp(state.health + 10);
    toast('CLEANED!'); render(); return;
  }
  if (state.sleeping) { state.sleeping = false; toast('WAKE UP!'); render(); return; }
  if (state.health >= 100) { toast('HEALTHY!'); return; }
  state.health = clamp(state.health + 20); toast('💊 BETTER!');
  render();
});
 
document.getElementById('btnShop').addEventListener('click', openShop);
 
//game
function openMinigame() {
  document.getElementById('minigame').style.display = 'flex';
  document.getElementById('mgResult').textContent   = '';
  document.getElementById('mgClose').style.display  = 'none';
  document.getElementById('mgChoices').style.display = 'flex';
  document.getElementById('mgSub').textContent = 'CHOOSE!';
}
 
document.getElementById('mgChoices').addEventListener('click', e => {
  const btn = e.target.closest('.mg-btn');
  if (!btn) return;
  const choices = ['rock','paper','scissors'];
  const emojis  = { rock:'✊', paper:'✋', scissors:'✌️' };
  const player  = btn.dataset.val;
  const cpu     = choices[Math.floor(Math.random() * 3)];
  const wins    = { rock:'scissors', paper:'rock', scissors:'paper' };
 
  let result, happyGain = 0, coins = 0;
  if (player === cpu) {
    result = 'TIE! ' + emojis[player] + ' vs ' + emojis[cpu];
    happyGain = 10; coins = 1;
  } else if (wins[player] === cpu) {
    result = 'WIN! 🎉 ' + emojis[player] + ' beats ' + emojis[cpu];
    happyGain = 20; coins = 3;
  } else {
    result = 'LOSE... ' + emojis[player] + ' vs ' + emojis[cpu];
    happyGain = 5; coins = 0;
  }
 
  state.happy  = clamp(state.happy  + happyGain);
  state.hunger = clamp(state.hunger - 8);
  state.coins += coins;
  document.getElementById('coinCount').textContent = state.coins;
 
  document.getElementById('mgResult').textContent  = result + (coins ? ' +'+coins+'🪙' : '');
  document.getElementById('mgChoices').style.display = 'none';
  document.getElementById('mgClose').style.display   = 'block';
  document.getElementById('mgSub').textContent = player.toUpperCase() + '!';
  render();
});
 
document.getElementById('mgClose').addEventListener('click', () => {
  document.getElementById('minigame').style.display = 'none';
});
 
// shop
function openShop() {
  document.getElementById('shopCoins').textContent = state.coins;
  const container = document.getElementById('shopItems');
  container.innerHTML = '';
  SHOP_ITEMS.forEach(item => {
    const div = document.createElement('div');
    div.className = 'shop-item';
    div.innerHTML = `
      <span class="shop-emoji">${item.emoji}</span>
      <span class="shop-label">${item.label}</span>
      <button class="shop-buy ${state.coins < item.cost ? 'cant-afford' : ''}"
              data-id="${item.id}">
        🪙${item.cost}
      </button>`;
    container.appendChild(div);
  });
  document.getElementById('shop').style.display = 'flex';
}
 
document.getElementById('shopItems').addEventListener('click', e => {
  const btn = e.target.closest('.shop-buy');
  if (!btn || btn.classList.contains('cant-afford')) return;
  const item = SHOP_ITEMS.find(i => i.id === btn.dataset.id);
  if (!item || state.coins < item.cost) return;
  state.coins -= item.cost;
  document.getElementById('coinCount').textContent = state.coins;
  item.effect();
  bounceSprite(); spawnHeart();
  openShop(); 
  render();
});
 
document.getElementById('shopClose').addEventListener('click', () => {
  document.getElementById('shop').style.display = 'none';
});
 
function die() {
  state.alive = false;
  if (state.age > maxAge) {
    maxAge = state.age;
    localStorage.setItem('maxAge', maxAge);
  }
  toast('OH NO...');
  updateRecord();
  render();
}
 
function restart() {
  stages = PET_TYPES[state.petType];
  state.hunger=80; 
  state.happy=80; 
  state.health=80;
  state.age=0; 
  state.alive=true; 
  state.sleeping=false;
  state.poop=false; 
  state.stage=0; 
  state.tickCount=0;
  state.coins=0; 
  state.goodCare=0; 
  state.badCare=0;
  toast('NEW LIFE!');
  render();
}
 
function updateRecord() {
  const el = document.getElementById('recordDisplay');
  if (el) el.textContent = maxAge > 0 ? 'BEST: ' + maxAge : '';
}
 
function clamp(v) { return Math.max(0, Math.min(100, v)); }
 
function toast(msg, dur=1600) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.animation = 'none';
  requestAnimationFrame(() => { t.style.animation = 'fadeIn 0.2s'; });
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => t.textContent = '', dur);
}
 
function spawnHeart() {
  const petStage = document.getElementById('petStage');
  const h = document.createElement('div');
  h.className = 'heart-anim'; h.textContent = '❤️';
  h.style.left = (20 + Math.random() * 60) + '%';
  h.style.top  = '20%';
  petStage.appendChild(h);
  setTimeout(() => h.remove(), 900);
}
 
function bounceSprite() {
  const s = document.getElementById('petSprite');
  s.classList.remove('bounce');
  void s.offsetWidth;
  s.classList.add('bounce');
  setTimeout(() => s.classList.remove('bounce'), 450);
}
 
