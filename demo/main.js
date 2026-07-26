import { Brackets } from '../src/index';
import { rounds as sampleRounds } from './sample-rounds.js';
import { formatRounds, parseRoundsJson } from './rounds-editor.js';

const mount = document.getElementById('bracket');
const stateEl = document.getElementById('state');
const thirdPlaceEl = document.getElementById('thirdPlace');
const roundNavEl = document.getElementById('roundNav');
const themeEl = document.getElementById('theme');
const radiusEl = document.getElementById('radius');
const matchWidthEl = document.getElementById('matchWidth');
const roundsJsonEl = document.getElementById('roundsJson');
const applyRoundsEl = document.getElementById('applyRounds');
const resetRoundsEl = document.getElementById('resetRounds');
const roundsErrorEl = document.getElementById('roundsError');

let api;
let currentRounds = sampleRounds;

roundsJsonEl.value = formatRounds(sampleRounds);

function setRoundsError(message) {
  roundsErrorEl.textContent = message || '';
}

function applyRoundsFromEditor() {
  const result = parseRoundsJson(roundsJsonEl.value);
  if (!result.ok) {
    setRoundsError(result.error);
    return false;
  }
  setRoundsError('');
  currentRounds = result.rounds;
  if (api) {
    api.setRounds(currentRounds);
    stateEl.textContent = JSON.stringify(api.getState(), null, 2);
  } else {
    mountBracket();
  }
  return true;
}

function mountBracket() {
  if (api) api.destroy();
  const thirdPlace = thirdPlaceEl.checked;
  const roundNav = roundNavEl.checked;
  const radius = Number(radiusEl.value);
  const matchWidth = Number(matchWidthEl.value);
  mount.setAttribute('data-third-place', thirdPlace ? 'true' : 'false');
  mount.setAttribute('data-round-nav', roundNav ? 'true' : 'false');
  mount.setAttribute('data-radius', String(radius));
  mount.setAttribute('data-match-width', String(matchWidth));
  api = Brackets.create(mount, {
    rounds: currentRounds,
    titles: true,
    thirdPlace,
    roundNav,
    theme: themeEl.value,
    radius,
    matchWidth,
    showScores: 'auto',
    onChange(state) {
      stateEl.textContent = JSON.stringify(state, null, 2);
    },
    onRoundChange() {
      stateEl.textContent = JSON.stringify(api.getState(), null, 2);
    },
  });
  stateEl.textContent = JSON.stringify(api.getState(), null, 2);
}

applyRoundsEl.addEventListener('click', () => {
  applyRoundsFromEditor();
});
resetRoundsEl.addEventListener('click', () => {
  roundsJsonEl.value = formatRounds(sampleRounds);
  applyRoundsFromEditor();
});

thirdPlaceEl.addEventListener('change', mountBracket);
roundNavEl.addEventListener('change', mountBracket);
themeEl.addEventListener('change', mountBracket);
radiusEl.addEventListener('input', mountBracket);
matchWidthEl.addEventListener('input', mountBracket);
mountBracket();
