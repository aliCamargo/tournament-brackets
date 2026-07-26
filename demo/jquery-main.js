import $ from 'jquery';
import '../src/adapters/jquery.adapter';
import { rounds as sampleRounds } from './sample-rounds.js';
import { formatRounds, parseRoundsJson } from './rounds-editor.js';

const $mount = $('#bracket');
const $state = $('#state');
const $thirdPlace = $('#thirdPlace');
const $roundNav = $('#roundNav');
const $theme = $('#theme');
const $radius = $('#radius');
const $matchWidth = $('#matchWidth');
const $roundsJson = $('#roundsJson');
const $applyRounds = $('#applyRounds');
const $resetRounds = $('#resetRounds');
const $roundsError = $('#roundsError');

let currentRounds = sampleRounds;

$roundsJson.val(formatRounds(sampleRounds));

function setRoundsError(message) {
  $roundsError.text(message || '');
}

function applyRoundsFromEditor() {
  const result = parseRoundsJson($roundsJson.val());
  if (!result.ok) {
    setRoundsError(result.error);
    return false;
  }
  setRoundsError('');
  currentRounds = result.rounds;
  const api = $mount.data('brackets');
  if (api) {
    api.setRounds(currentRounds);
    $state.text(JSON.stringify(api.getState(), null, 2));
  } else {
    mountBracket();
  }
  return true;
}

function mountBracket() {
  const thirdPlace = $thirdPlace.prop('checked');
  const roundNav = $roundNav.prop('checked');
  const radius = Number($radius.val());
  const matchWidth = Number($matchWidth.val());

  $mount
    .attr('data-third-place', thirdPlace ? 'true' : 'false')
    .attr('data-round-nav', roundNav ? 'true' : 'false')
    .attr('data-radius', String(radius))
    .attr('data-match-width', String(matchWidth));

  $mount.brackets({
    rounds: currentRounds,
    titles: true,
    thirdPlace,
    roundNav,
    theme: $theme.val(),
    radius,
    matchWidth,
    showScores: 'auto',
    onChange(state) {
      $state.text(JSON.stringify(state, null, 2));
    },
    onRoundChange() {
      const api = $mount.data('brackets');
      $state.text(JSON.stringify(api.getState(), null, 2));
    },
  });

  const api = $mount.data('brackets');
  $state.text(JSON.stringify(api.getState(), null, 2));
}

$applyRounds.on('click', () => {
  applyRoundsFromEditor();
});
$resetRounds.on('click', () => {
  $roundsJson.val(formatRounds(sampleRounds));
  applyRoundsFromEditor();
});

$thirdPlace.on('change', mountBracket);
$roundNav.on('change', mountBracket);
$theme.on('change', mountBracket);
$radius.on('input', mountBracket);
$matchWidth.on('input', mountBracket);
mountBracket();
