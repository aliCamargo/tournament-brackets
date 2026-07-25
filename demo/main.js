import { Brackets } from '../src/index';
import { rounds } from './sample-rounds.js';

const mount = document.getElementById('bracket');
const stateEl = document.getElementById('state');
const thirdPlaceEl = document.getElementById('thirdPlace');
const roundNavEl = document.getElementById('roundNav');
const themeEl = document.getElementById('theme');
const radiusEl = document.getElementById('radius');
const matchWidthEl = document.getElementById('matchWidth');

let api;

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
    rounds,
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

thirdPlaceEl.addEventListener('change', mountBracket);
roundNavEl.addEventListener('change', mountBracket);
themeEl.addEventListener('change', mountBracket);
radiusEl.addEventListener('input', mountBracket);
matchWidthEl.addEventListener('input', mountBracket);
mountBracket();
