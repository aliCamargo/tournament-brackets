import React, { useRef, useState } from 'react';
import { render } from 'react-dom';
import { Brackets } from '../src/adapters/react.adapter';
import { rounds } from './sample-rounds.js';
import '../src/ui/theme.css';

function App() {
  const apiRef = useRef(null);
  const [theme, setTheme] = useState('default');
  const [thirdPlace, setThirdPlace] = useState(true);
  const [roundNav, setRoundNav] = useState(true);
  const [radius, setRadius] = useState(8);
  const [matchWidth, setMatchWidth] = useState(200);
  const [stateJson, setStateJson] = useState('');

  const syncState = () => {
    const api = apiRef.current;
    if (!api) return;
    setStateJson(JSON.stringify(api.getState(), null, 2));
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
      <section className="demo-state">
        <h2>State</h2>
        <pre id="state">{stateJson}</pre>
      </section>
    </div>
  );
}

render(<App />, document.getElementById('root'));
