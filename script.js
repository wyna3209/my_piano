// 피아노 건반 정보
const WHITE_KEYS = [
  { note: 'C', key: 'z' },
  { note: 'D', key: 'x' },
  { note: 'E', key: 'c' },
  { note: 'F', key: 'v' },
  { note: 'G', key: 'b' },
  { note: 'A', key: 'n' },
  { note: 'B', key: 'm' }
];
const BLACK_KEYS = [
  { note: 'C#', key: 's', pos: 0 },
  { note: 'D#', key: 'd', pos: 1 },
  // E#(F) 없음
  { note: 'F#', key: 'g', pos: 3 },
  { note: 'G#', key: 'h', pos: 4 },
  { note: 'A#', key: 'j', pos: 5 }
];

const piano = document.getElementById('piano');

// 건반 생성 대체: 세 옥타브 표시
function createKeys() {
  piano.innerHTML = '';
  const octaves = [3, 4, 5];
  const whiteNotes = ['C','D','E','F','G','A','B'];
  const blackNotes = [{note:'C#',pos:0},{note:'D#',pos:1},{note:'F#',pos:3},{note:'G#',pos:4},{note:'A#',pos:5}];
  const whiteElements = [];
  // 흰 건반
  octaves.forEach(oct => {
    whiteNotes.forEach((note, idx) => {
      const w = document.createElement('div');
      w.className = 'white-key';
      w.dataset.note = note + oct;
      // 중간 옥타브만 키보드 매핑
      if (oct === 4) {
        const keyObj = WHITE_KEYS.find(wk => wk.note === note);
        w.dataset.key = keyObj.key;
      }
      w.innerHTML = `<span class="key-label">${note}${oct}${w.dataset.key?`<br>(${w.dataset.key})`:''}</span>`;
      piano.appendChild(w);
      whiteElements.push(w);
    });
  });
  // 검은 건반
  octaves.forEach(oct => {
    blackNotes.forEach(b => {
      const idx = octaves.indexOf(oct)*7 + b.pos;
      const parent = whiteElements[idx];
      const blk = document.createElement('div');
      blk.className = 'black-key';
      blk.dataset.note = b.note + oct;
      if (oct === 4) {
        const keyObj = BLACK_KEYS.find(bk => bk.note === b.note);
        blk.dataset.key = keyObj.key;
      }
      blk.innerHTML = `<span class="key-label">${b.note}${oct}${blk.dataset.key?`<br>(${blk.dataset.key})`:''}</span>`;
      piano.appendChild(blk);
      // 위치 설정
      setTimeout(() => {
        // 흰 건반 넓이의 75% 위치에 검은 건반 중앙 배치
        const left = parent.offsetLeft + parent.offsetWidth * 0.95 - blk.offsetWidth / 2;
        blk.style.left = `${left}px`;
      }, 0);
    });
  });
}

// 사운드 생성 (Web Audio API) 및 옥타브 지원
const ctx = new (window.AudioContext || window.webkitAudioContext)();
// iOS용: 첫 상호작용에서 오디오 컨텍스트 resume
function resumeAudio() { if (ctx.state !== 'running') ctx.resume(); }
// 폴리포니를 위한 active voice 맵
const activeVoices = new Map(); // id -> {osc, gain}
// 노트+옥타브 문자열을 주파수로 변환
function noteToHz(noteWithOct) {
  const m = /^([A-G]#?)(\d+)$/.exec(noteWithOct);
  const base = m ? m[1] : noteWithOct;
  const oct  = m ? parseInt(m[2],10) : 4;
  let f = getFrequency(base);
  return f * Math.pow(2, oct - 4);
}
// 노트 재생 시작
function startNote(id, noteWithOct) {
  resumeAudio();
  if (activeVoices.has(id)) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = noteToHz(noteWithOct);
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.01);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  activeVoices.set(id, {osc, gain});
}
// 노트 멈춤
function stopNote(id) {
  const v = activeVoices.get(id); if (!v) return;
  const now = ctx.currentTime;
  v.gain.gain.cancelScheduledValues(now);
  v.gain.gain.setTargetAtTime(0, now, 0.03);
  v.osc.stop(now + 0.1);
  activeVoices.delete(id);
}

// 노트명 -> 주파수 변환 (C4~B4)
function getFrequency(note) {
  const notes = {
    'C': 261.63,
    'C#': 277.18,
    'D': 293.66,
    'D#': 311.13,
    'E': 329.63,
    'F': 349.23,
    'F#': 369.99,
    'G': 392.00,
    'G#': 415.30,
    'A': 440.00,
    'A#': 466.16,
    'B': 493.88
  };
  return notes[note] || 440;
}

// 키보드 입력 처리: start/stop 분리
window.addEventListener('keydown', e => {
  if (e.repeat) return;
  const k = e.key.toLowerCase();
  const white = WHITE_KEYS.find(w => w.key === k);
  const black = BLACK_KEYS.find(b => b.key === k);
  const base  = white?.note || black?.note;
  if (!base) return;
  startNote(base, base + '4');
  highlightKey(k);
});
window.addEventListener('keyup', e => {
  const k = e.key.toLowerCase();
  const base = WHITE_KEYS.find(w => w.key === k)?.note || BLACK_KEYS.find(b => b.key === k)?.note;
  if (base) stopNote(base);
  unhighlightKey(k);
});

// 마우스 클릭/이동으로 sustain 및 gliss 지원
let mouseDown = false;
piano.addEventListener('mousedown', e => {
  mouseDown = true;
  let el = e.target.classList.contains('key-label') ? e.target.parentElement : e.target;
  if (el?.dataset?.note) {
    startNote(el.dataset.note, el.dataset.note);
    activateKeyEl(el);
  }
});
piano.addEventListener('mousemove', e => {
  if (!mouseDown) return;
  const el = document.elementFromPoint(e.clientX, e.clientY);
  if (el?.dataset?.note && !activeVoices.has(el.dataset.note)) {
    startNote(el.dataset.note, el.dataset.note);
    activateKeyEl(el);
  }
});
window.addEventListener('mouseup', () => {
  mouseDown = false;
  // 모든 활성 보이스 정지
  activeVoices.forEach((_, id) => stopNote(id));
  document.querySelectorAll('.white-key.active, .black-key.active').forEach(el => deactivateKeyEl(el));
});

// 터치 멀티터치 및 gliss 지원
const touchMap = new Map();
function keyFromPoint(x,y) {
  let el = document.elementFromPoint(x,y);
  if (!el) return null;
  if (el.classList.contains('key-label')) el = el.parentElement;
  return el?.dataset?.note ? el : null;
}
function onTouchStart(e) {
  e.preventDefault();
  for (const t of e.changedTouches) {
    const el = keyFromPoint(t.clientX, t.clientY);
    if (!el) continue;
    const id = 'touch-' + t.identifier;
    startNote(id, el.dataset.note);
    activateKeyEl(el);
    touchMap.set(t.identifier, el);
  }
}
function onTouchMove(e) {
  e.preventDefault();
  for (const t of e.changedTouches) {
    const prev = touchMap.get(t.identifier);
    const el = keyFromPoint(t.clientX, t.clientY);
    if (el && el !== prev) {
      if (prev) { deactivateKeyEl(prev); stopNote('touch-'+t.identifier); }
      const id = 'touch-' + t.identifier;
      startNote(id, el.dataset.note);
      activateKeyEl(el);
      touchMap.set(t.identifier, el);
    }
  }
}
function onTouchEnd(e) {
  e.preventDefault();
  for (const t of e.changedTouches) {
    const prev = touchMap.get(t.identifier);
    if (prev) deactivateKeyEl(prev);
    stopNote('touch-' + t.identifier);
    touchMap.delete(t.identifier);
  }
}
// passive:false로 등록
piano.addEventListener('touchstart', onTouchStart, {passive:false});
piano.addEventListener('touchmove', onTouchMove,   {passive:false});
piano.addEventListener('touchend',  onTouchEnd,    {passive:false});
piano.addEventListener('touchcancel', onTouchEnd,   {passive:false});

// 키보드용 하이라이트 함수들
function highlightKey(keyChar) {
  const element = document.querySelector(`[data-key="${keyChar}"]`);
  if (element) {
    element.classList.add('active');
  }
}

function unhighlightKey(keyChar) {
  const element = document.querySelector(`[data-key="${keyChar}"]`);
  if (element) {
    element.classList.remove('active');
  }
}

// 마우스/터치용 활성화 함수들
function activateKeyEl(element) {
  if (element) {
    element.classList.add('active');
  }
}

function deactivateKeyEl(element) {
  if (element) {
    element.classList.remove('active');
  }
}

createKeys();
