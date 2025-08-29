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

// 조성별 주요 3화음 정의 (1도, 4도, 5도)
const KEY_CHORDS = {
  'C': { I: ['C4', 'E4', 'G4'], IV: ['F4', 'A4', 'C5'], V: ['G4', 'B4', 'D5'] },
  'G': { I: ['G4', 'B4', 'D5'], IV: ['C5', 'E5', 'G5'], V: ['D5', 'F#5', 'A5'] },
  'D': { I: ['D4', 'F#4', 'A4'], IV: ['G4', 'B4', 'D5'], V: ['A4', 'C#5', 'E5'] },
  'A': { I: ['A4', 'C#5', 'E5'], IV: ['D5', 'F#5', 'A5'], V: ['E5', 'G#5', 'B5'] },
  'E': { I: ['E4', 'G#4', 'B4'], IV: ['A4', 'C#5', 'E5'], V: ['B4', 'D#5', 'F#5'] },
  'B': { I: ['B3', 'D#4', 'F#4'], IV: ['E4', 'G#4', 'B4'], V: ['F#4', 'A#4', 'C#5'] },
  'F#': { I: ['F#3', 'A#3', 'C#4'], IV: ['B3', 'D#4', 'F#4'], V: ['C#4', 'F4', 'G#4'] },
  'C#': { I: ['C#4', 'F4', 'G#4'], IV: ['F#4', 'A#4', 'C#5'], V: ['G#4', 'C5', 'D#5'] },
  'F': { I: ['F4', 'A4', 'C5'], IV: ['Bb4', 'D5', 'F5'], V: ['C5', 'E5', 'G5'] },
  'Bb': { I: ['Bb3', 'D4', 'F4'], IV: ['Eb4', 'G4', 'Bb4'], V: ['F4', 'A4', 'C5'] },
  'Eb': { I: ['Eb4', 'G4', 'Bb4'], IV: ['Ab4', 'C5', 'Eb5'], V: ['Bb4', 'D5', 'F5'] },
  'Ab': { I: ['Ab3', 'C4', 'Eb4'], IV: ['Db4', 'F4', 'Ab4'], V: ['Eb4', 'G4', 'Bb4'] },
  'Db': { I: ['Db4', 'F4', 'Ab4'], IV: ['Gb4', 'Bb4', 'Db5'], V: ['Ab4', 'C5', 'Eb5'] },
  'Gb': { I: ['Gb3', 'Bb3', 'Db4'], IV: ['Cb4', 'Eb4', 'Gb4'], V: ['Db4', 'F4', 'Ab4'] },
  'Cb': { I: ['Cb4', 'Eb4', 'Gb4'], IV: ['Fb4', 'Ab4', 'Cb5'], V: ['Gb4', 'Bb4', 'Db5'] }
};

// 현재 선택된 조성
let currentKey = 'C';

// 각 화음의 현재 전위 상태
let chordInversions = {
  I: 0,   // 1도 화음
  IV: 0,  // 4도 화음  
  V: 0    // 5도 화음
};

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
      // 위치 설정을 함수로 분리
      positionBlackKey(blk, parent);
    });
  });
}

// 검은건반 위치 설정 함수
function positionBlackKey(blackKey, parentWhiteKey) {
  // DOM이 완전히 렌더링된 후 위치 계산
  const updatePosition = () => {
    if (parentWhiteKey.offsetWidth > 0) {
      const left = parentWhiteKey.offsetLeft + parentWhiteKey.offsetWidth * 0.95 - blackKey.offsetWidth / 2;
      blackKey.style.left = `${left}px`;
      blackKey.style.top = '0px'; // 명시적으로 top 위치 설정
    }
  };
  
  // 즉시 실행
  requestAnimationFrame(updatePosition);
  
  // 약간의 지연 후에도 실행 (레이아웃 변경 대비)
  setTimeout(updatePosition, 10);
}

// 모든 검은건반 위치 재조정 함수
function repositionBlackKeys() {
  const blackKeys = document.querySelectorAll('.black-key');
  const whiteKeys = document.querySelectorAll('.white-key');
  
  blackKeys.forEach(blackKey => {
    // 검은건반이 속한 옥타브와 위치 찾기
    const note = blackKey.dataset.note;
    const noteBase = note.replace(/\d+/, '');
    const octave = parseInt(note.match(/\d+/)[0]);
    
    // 해당하는 흰건반 찾기
    const blackNotePositions = {
      'C#': 0, 'D#': 1, 'F#': 3, 'G#': 4, 'A#': 5
    };
    
    const whiteKeyIndex = (octave - 3) * 7 + blackNotePositions[noteBase];
    const parentWhiteKey = whiteKeys[whiteKeyIndex];
    
    if (parentWhiteKey) {
      positionBlackKey(blackKey, parentWhiteKey);
    }
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

// 화음 전위 계산 함수 (다단계 양방향)
function getChordInversion(baseChord, inversion) {
  if (inversion === 0) return baseChord; // 기본형
  
  const result = [...baseChord];
  
  if (inversion > 0) {
    // 높은 음쪽 전위: 맨 아래 음을 한 옥타브 위로
    for (let i = 0; i < inversion; i++) {
      const bottomNote = result.shift();
      const noteMatch = bottomNote.match(/^([A-G][b#]?)(\d+)$/);
      if (noteMatch) {
        const noteName = noteMatch[1];
        const octave = parseInt(noteMatch[2]) + 1;
        result.push(noteName + octave);
      }
    }
  } else {
    // 낮은 음쪽 전위: 맨 위 음을 한 옥타브 아래로
    for (let i = 0; i < Math.abs(inversion); i++) {
      const topNote = result.pop();
      const noteMatch = topNote.match(/^([A-G][b#]?)(\d+)$/);
      if (noteMatch) {
        const noteName = noteMatch[1];
        const octave = parseInt(noteMatch[2]) - 1;
        result.unshift(noteName + octave);
      }
    }
  }
  
  return result;
}

// 화음 버튼을 현재 조성에 맞게 업데이트
function updateChordButtons() {
  const chords = KEY_CHORDS[currentKey];
  const chordButtons = document.querySelectorAll('.chord-btn');
  
  if (chordButtons.length >= 3) {
    // 1도 화음 (토닉)
    const iChordInverted = getChordInversion(chords.I, chordInversions.I);
    chordButtons[0].dataset.notes = iChordInverted.join(',');
    chordButtons[0].dataset.chord = currentKey;
    chordButtons[0].querySelector('.chord-name').textContent = currentKey;
    
    // 4도 화음 (서브도미넌트)
    const ivChord = getChordName(currentKey, 'IV');
    const ivChordInverted = getChordInversion(chords.IV, chordInversions.IV);
    chordButtons[1].dataset.notes = ivChordInverted.join(',');
    chordButtons[1].dataset.chord = ivChord;
    chordButtons[1].querySelector('.chord-name').textContent = ivChord;
    
    // 5도 화음 (도미넌트)
    const vChord = getChordName(currentKey, 'V');
    const vChordInverted = getChordInversion(chords.V, chordInversions.V);
    chordButtons[2].dataset.notes = vChordInverted.join(',');
    chordButtons[2].dataset.chord = vChord;
    chordButtons[2].querySelector('.chord-name').textContent = vChord;
  }
}

// 조성과 도수에 따른 화음 이름 반환
function getChordName(key, degree) {
  const intervals = {
    'IV': 5, // 완전 4도 (반음 5개)
    'V': 7   // 완전 5도 (반음 7개)
  };
  
  if (degree === 'IV') {
    return getTransposedNote(key, intervals['IV']);
  } else if (degree === 'V') {
    return getTransposedNote(key, intervals['V']);
  }
  return key;
}

// 반음 개수만큼 음정 이동
function getTransposedNote(note, semitones) {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const flats = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  
  // 플랫 기호가 포함된 조성 처리
  let noteIndex;
  if (note.includes('b')) {
    noteIndex = flats.indexOf(note);
  } else {
    noteIndex = notes.indexOf(note);
  }
  
  if (noteIndex === -1) return note;
  
  const newIndex = (noteIndex + semitones) % 12;
  
  // 원래 조성이 플랫을 사용하면 결과도 플랫으로
  if (note.includes('b') || ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'].includes(note)) {
    return flats[newIndex];
  } else {
    return notes[newIndex];
  }
}

// 플랫/샤프 음표를 정규화하여 건반을 찾기 위한 함수
function normalizeNote(noteWithOctave) {
  const match = noteWithOctave.match(/^([A-G][b#]?)(\d+)$/);
  if (!match) return noteWithOctave;
  
  const note = match[1];
  const octave = match[2];
  
  // 플랫을 샤프로 변환 (건반은 모두 샤프 표기로 되어 있음)
  const flatToSharp = {
    'Db': 'C#',
    'Eb': 'D#',
    'Gb': 'F#',
    'Ab': 'G#',
    'Bb': 'A#',
    'Cb': 'B',
    'Fb': 'E'
  };
  
  const normalizedNote = flatToSharp[note] || note;
  return normalizedNote + octave;
}
let currentChord = null; // 현재 재생 중인 화음 정보

function playChord(notesString) {
  // 이전 화음이 재생 중이면 정지
  if (currentChord) {
    stopChord();
  }
  
  const notes = notesString.split(',');
  const chordId = 'chord-' + Date.now();
  const activeElements = [];
  
  // 모든 노트를 동시에 재생
  notes.forEach((note, index) => {
    const noteId = chordId + '-' + index;
    const trimmedNote = note.trim();
    startNote(noteId, trimmedNote);
    
    // 해당하는 건반 시각적 활성화 (정규화된 음표로 찾기)
    const normalizedNote = normalizeNote(trimmedNote);
    const keyElement = document.querySelector(`[data-note="${normalizedNote}"]`);
    
    if (keyElement) {
      activateKeyEl(keyElement);
      activeElements.push(keyElement);
    } else {
      // 디버깅용: 건반을 찾지 못한 경우 로그 출력
      console.log(`Key not found for note: ${trimmedNote} (normalized: ${normalizedNote})`);
    }
  });
  
  // 현재 화음 정보 저장
  currentChord = {
    id: chordId,
    notes: notes,
    elements: activeElements
  };
  
  // 화음 표시 업데이트
  const chordDisplay = document.getElementById('chord-display');
  if (chordDisplay) {
    const chordName = notes.map(n => n.replace(/\d+/, '')).join(' - ');
    chordDisplay.textContent = `현재 화음: ${chordName}`;
  }
}

function stopChord() {
  if (!currentChord) return;
  
  // 모든 노트 정지
  currentChord.notes.forEach((note, index) => {
    const noteId = currentChord.id + '-' + index;
    stopNote(noteId);
  });
  
  // 건반 시각적 비활성화
  currentChord.elements.forEach(element => {
    deactivateKeyEl(element);
  });
  
  // 화음 표시 제거
  const chordDisplay = document.getElementById('chord-display');
  if (chordDisplay) {
    chordDisplay.textContent = '';
  }
  
  currentChord = null;
}

// 화음 버튼 이벤트 리스너 추가
document.addEventListener('DOMContentLoaded', () => {
  // 조성 선택기 이벤트
  const keySelect = document.getElementById('key-select');
  if (keySelect) {
    keySelect.addEventListener('change', (e) => {
      currentKey = e.target.value;
      updateChordButtons();
      
      // 현재 재생 중인 화음이 있으면 정지
      if (currentChord) {
        stopChord();
      }
    });
  }
  
  // 전위 선택기 이벤트
  const inversionSelects = document.querySelectorAll('.inversion-select');
  inversionSelects.forEach(select => {
    select.addEventListener('change', (e) => {
      const degree = e.target.dataset.target;
      const inversion = parseInt(e.target.value);
      chordInversions[degree] = inversion;
      updateChordButtons();
      
      // 현재 재생 중인 화음이 있으면 정지
      if (currentChord) {
        stopChord();
      }
    });
  });
  
  const chordButtons = document.querySelectorAll('.chord-btn');
  chordButtons.forEach(button => {
    // 마우스 이벤트
    button.addEventListener('mousedown', (e) => {
      e.preventDefault();
      const notes = button.dataset.notes;
      playChord(notes);
      
      // 버튼 클릭 피드백
      button.style.transform = 'scale(0.95)';
    });
    
    button.addEventListener('mouseup', () => {
      stopChord();
      button.style.transform = '';
    });
    
    button.addEventListener('mouseleave', () => {
      stopChord();
      button.style.transform = '';
    });
    
    // 터치 이벤트
    button.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const notes = button.dataset.notes;
      playChord(notes);
      
      // 버튼 클릭 피드백
      button.style.transform = 'scale(0.95)';
    });
    
    button.addEventListener('touchend', (e) => {
      e.preventDefault();
      stopChord();
      button.style.transform = '';
    });
    
    button.addEventListener('touchcancel', (e) => {
      e.preventDefault();
      stopChord();
      button.style.transform = '';
    });
  });
  
  // 초기 화음 버튼 설정
  updateChordButtons();
});

// 화면 회전 및 크기 변경 감지
window.addEventListener('resize', () => {
  // 디바운싱을 통해 성능 최적화
  clearTimeout(window.resizeTimeout);
  window.resizeTimeout = setTimeout(() => {
    repositionBlackKeys();
  }, 100);
});

// 화면 방향 변경 감지 (모바일)
window.addEventListener('orientationchange', () => {
  // 방향 변경 후 약간의 지연을 둔 후 재배치
  setTimeout(() => {
    repositionBlackKeys();
  }, 200);
});

// 페이지 로드 완료 후 한 번 더 재배치
window.addEventListener('load', () => {
  setTimeout(repositionBlackKeys, 100);
});

createKeys();
