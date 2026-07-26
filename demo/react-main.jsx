import React, { useEffect, useRef, useState } from 'react';
import { render } from 'react-dom';
import { Brackets } from '../src/adapters/react.adapter';
import { rounds as sampleRounds } from './sample-rounds.js';
import { formatRounds, parseRoundsJson } from './rounds-editor.js';
import '../src/ui/theme.css';

function App() {
  const apiRef = useRef(null);
  const [theme, setTheme] = useState('default');
  const [thirdPlace, setThirdPlace] = useState(true);
  const [roundNav, setRoundNav] = useState(true);
  const [radius, setRadius] = useState(8);
  const [matchWidth, setMatchWidth] = useState(200);
  const [rounds, setRounds] = useState(sampleRounds);
  const [draftJson, setDraftJson] = useState(() => formatRounds(sampleRounds));
  const [roundsError, setRoundsError] = useState('');
  const [stateJson, setStateJson] = useState('');

  const syncState = () => {
    const api = apiRef.current;
    if (!api) return;
    setStateJson(JSON.stringify(api.getState(), null, 2));
  };

  useEffect(() => {
    syncState();
  }, [rounds, theme, thirdPlace, roundNav, radius, matchWidth]);

  const applyRoundsFromEditor = () => {
    const result = parseRoundsJson(draftJson);
    if (!result.ok) {
      setRoundsError(result.error);
      return;
    }
    setRoundsError('');
    setRounds(result.rounds);
  };

  const resetRounds = () => {
    const formatted = formatRounds(sampleRounds);
    setDraftJson(formatted);
    setRoundsError('');
    setRounds(sampleRounds);
  };

  return (
    <div>
      <div className="demo-controls">
        <label>
          <input
            type="checkbox"
            checked={thirdPlace}
            onChange={(e) => setThirdPlace(e.target.checked)}
          />
          3rd place
        </label>
        <label>
          <input
            type="checkbox"
            checked={roundNav}
            onChange={(e) => setRoundNav(e.target.checked)}
          />
          Round nav
        </label>
        <label>
          Theme
          <select value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="default">Default</option>
            <option value="dark">Dark</option>
          </select>
        </label>
        <label>
          Radius
          <input
            type="number"
            min={0}
            max={24}
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
          />
        </label>
        <label>
          Match width
          <input
            type="number"
            min={120}
            max={360}
            step={8}
            value={matchWidth}
            onChange={(e) => setMatchWidth(Number(e.target.value))}
          />
        </label>
      </div>
      <Brackets
        ref={apiRef}
        rounds={rounds}
        titles
        theme={theme}
        thirdPlace={thirdPlace}
        roundNav={roundNav}
        radius={radius}
        matchWidth={matchWidth}
        onChange={syncState}
        onRoundChange={syncState}
      />
      <section className="demo-rounds-editor">
        <h2>Rounds JSON</h2>
        <textarea
          spellCheck={false}
          aria-label="Rounds JSON"
          value={draftJson}
          onChange={(e) => setDraftJson(e.target.value)}
        />
        <div className="demo-rounds-actions">
          <button type="button" className="demo-btn" onClick={applyRoundsFromEditor}>
            Apply
          </button>
          <button
            type="button"
            className="demo-btn demo-btn--secondary"
            onClick={resetRounds}
          >
            Reset
          </button>
        </div>
        <p className="demo-rounds-error" role="alert">
          {roundsError}
        </p>
      </section>
      <section className="demo-state">
        <h2>State</h2>
        <pre id="state">{stateJson}</pre>
      </section>
    </div>
  );
}

render(<App />, document.getElementById('root'));
