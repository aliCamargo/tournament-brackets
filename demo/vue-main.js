import { createApp, h, ref, watch } from 'vue';
import { Brackets } from '../src/adapters/vue.adapter.ts';
import { rounds as sampleRounds } from './sample-rounds.js';
import { formatRounds, parseRoundsJson } from './rounds-editor.js';
import '../src/ui/theme.css';

createApp({
  setup() {
    const apiRef = ref(null);
    const theme = ref('default');
    const thirdPlace = ref(true);
    const roundNav = ref(true);
    const radius = ref(8);
    const matchWidth = ref(200);
    const rounds = ref(sampleRounds);
    const draftJson = ref(formatRounds(sampleRounds));
    const roundsError = ref('');
    const stateJson = ref('');

    const syncState = () => {
      const api = apiRef.value;
      if (!api) return;
      stateJson.value = JSON.stringify(api.getState(), null, 2);
    };

    watch(
      [rounds, theme, thirdPlace, roundNav, radius, matchWidth],
      () => {
        syncState();
      },
    );

    const applyRoundsFromEditor = () => {
      const result = parseRoundsJson(draftJson.value);
      if (!result.ok) {
        roundsError.value = result.error;
        return;
      }
      roundsError.value = '';
      rounds.value = result.rounds;
    };

    const resetRounds = () => {
      const formatted = formatRounds(sampleRounds);
      draftJson.value = formatted;
      roundsError.value = '';
      rounds.value = sampleRounds;
    };

    return () =>
      h('div', [
        h('div', { class: 'demo-controls' }, [
          h('label', [
            h('input', {
              type: 'checkbox',
              checked: thirdPlace.value,
              onChange: (e) => {
                thirdPlace.value = e.target.checked;
              },
            }),
            ' 3rd place',
          ]),
          h('label', [
            h('input', {
              type: 'checkbox',
              checked: roundNav.value,
              onChange: (e) => {
                roundNav.value = e.target.checked;
              },
            }),
            ' Round nav',
          ]),
          h('label', [
            ' Theme ',
            h(
              'select',
              {
                value: theme.value,
                onChange: (e) => {
                  theme.value = e.target.value;
                },
              },
              [
                h('option', { value: 'default' }, 'Default'),
                h('option', { value: 'dark' }, 'Dark'),
              ],
            ),
          ]),
          h('label', [
            ' Radius ',
            h('input', {
              type: 'number',
              min: 0,
              max: 24,
              value: radius.value,
              onChange: (e) => {
                radius.value = Number(e.target.value);
              },
            }),
          ]),
          h('label', [
            ' Match width ',
            h('input', {
              type: 'number',
              min: 120,
              max: 360,
              step: 8,
              value: matchWidth.value,
              onChange: (e) => {
                matchWidth.value = Number(e.target.value);
              },
            }),
          ]),
        ]),
        h(Brackets, {
          ref: apiRef,
          rounds: rounds.value,
          titles: true,
          theme: theme.value,
          thirdPlace: thirdPlace.value,
          roundNav: roundNav.value,
          radius: radius.value,
          matchWidth: matchWidth.value,
          onChange: syncState,
          onRoundChange: syncState,
        }),
        h('section', { class: 'demo-rounds-editor' }, [
          h('h2', 'Rounds JSON'),
          h('textarea', {
            spellcheck: false,
            'aria-label': 'Rounds JSON',
            value: draftJson.value,
            onInput: (e) => {
              draftJson.value = e.target.value;
            },
          }),
          h('div', { class: 'demo-rounds-actions' }, [
            h(
              'button',
              {
                type: 'button',
                class: 'demo-btn',
                onClick: applyRoundsFromEditor,
              },
              'Apply',
            ),
            h(
              'button',
              {
                type: 'button',
                class: 'demo-btn demo-btn--secondary',
                onClick: resetRounds,
              },
              'Reset',
            ),
          ]),
          h('p', { class: 'demo-rounds-error', role: 'alert' }, roundsError.value),
        ]),
        h('section', { class: 'demo-state' }, [
          h('h2', 'State'),
          h('pre', stateJson.value),
        ]),
      ]);
  },
}).mount('#root');
