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
function playNote(noteWithOct) {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  // 노트와 옥타브 분리
  const m = /^([A-G]#?)(\d+)$/.exec(noteWithOct);
  const base = m ? m[1] : noteWithOct;
  const oct = m ? parseInt(m[2], 10) : 4;
  let freq = getFrequency(base);
  freq *= Math.pow(2, oct - 4);
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.2, now);
  gain.gain.linearRampToValueAtTime(0, now + 0.5);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.5);
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

// 키보드 입력 처리
window.addEventListener('keydown', e => {
  if (e.repeat) return;
  const key = e.key.toLowerCase();
  let note = null;
  const white = WHITE_KEYS.find(w => w.key === key);
  const black = BLACK_KEYS.find(b => b.key === key);
  if (white) note = white.note;
  if (black) note = black.note;
  if (note) {
    playNote(note);
    highlightKey(key);
  }
});
window.addEventListener('keyup', e => {
  const key = e.key.toLowerCase();
  unhighlightKey(key);
});

// 최근 3음 시퀀스 버퍼
let chordBuffer = [];
// 키 엘리먼트 활성화: 클래스 추가 및 화음 버퍼 업데이트
function activateKeyEl(el) {
  el.classList.add('active');
  const note = el.dataset.note;
  chordBuffer = chordBuffer.filter(n => n !== note);
  chordBuffer.push(note);
  if (chordBuffer.length > 3) chordBuffer.shift();
  updateChordDisplay();
}
// 키 엘리먼트 비활성화: 클래스 제거
function deactivateKeyEl(el) {
  el.classList.remove('active');
}

function highlightKey(key) {
  const el = document.querySelector(`[data-key="${key}"]`);
  if (el) activateKeyEl(el);
}
function unhighlightKey(key) {
  const el = document.querySelector(`[data-key="${key}"]`);
  if (el) deactivateKeyEl(el);
}

// 최근 3음으로 화음 표시
function updateChordDisplay() {
  const display = document.getElementById('chord-display');
  if (chordBuffer.length === 3) {
    display.textContent = 'Chord: ' + chordBuffer.join(' ');
  } else {
    display.textContent = '';
  }
}

// 마우스 클릭도 지원: 클릭한 엘리먼트 직접 활성/비활성화
piano.addEventListener('mousedown', e => {
  let el = e.target;
  if (el.classList.contains('key-label')) el = el.parentElement;
  if (el.classList.contains('white-key') || el.classList.contains('black-key')) {
    playNote(el.dataset.note);
    activateKeyEl(el);
  }
});
piano.addEventListener('mouseup', e => {
  let el = e.target;
  if (el.classList.contains('key-label')) el = el.parentElement;
  if (el.classList.contains('white-key') || el.classList.contains('black-key')) {
    deactivateKeyEl(el);
  }
});

// 터치 멀티터치 지원
const touchMap = new Map();

piano.addEventListener('touchstart', e => {
  e.preventDefault();
  for (const touch of e.changedTouches) {
    let el = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!el) continue;
    if (el.classList.contains('key-label')) el = el.parentElement;
    if (el.classList.contains('white-key') || el.classList.contains('black-key')) {
      const note = el.dataset.note;
      playNote(note);
      activateKeyEl(el);
      touchMap.set(touch.identifier, el);
    }
  }
});

piano.addEventListener('touchend', e => {
  e.preventDefault();
  for (const touch of e.changedTouches) {
    const el = touchMap.get(touch.identifier);
    if (el) {
      deactivateKeyEl(el);
      touchMap.delete(touch.identifier);
    }
  }
});

piano.addEventListener('touchcancel', e => {
  // 터치 취소도 해제 처리
  for (const touch of e.changedTouches) {
    const el = touchMap.get(touch.identifier);
    if (el) {
      deactivateKeyEl(el);
      touchMap.delete(touch.identifier);
    }
  }
});

createKeys();
