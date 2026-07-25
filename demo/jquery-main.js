import $ from 'jquery';
import '../src/adapters/jquery.adapter';
import { rounds } from './sample-rounds.js';

const $mount = $('#bracket');
const $state = $('#state');
const $thirdPlace = $('#thirdPlace');
const $roundNav = $('#roundNav');
const $theme = $('#theme');
const $radius = $('#radius');
const $matchWidth = $('#matchWidth');

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
    rounds,
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

$thirdPlace.on('change', mountBracket);
$roundNav.on('change', mountBracket);
$theme.on('change', mountBracket);
$radius.on('input', mountBracket);
$matchWidth.on('input', mountBracket);
mountBracket();
