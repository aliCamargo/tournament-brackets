import { Component, ViewChild, type AfterViewInit } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { BracketsComponent } from '../src/adapters/angular.adapter';
import type { RoundsInput } from '../src/types';
import { BracketsTheme } from '../src/types';
import { rounds as sampleRounds } from './sample-rounds.js';
import { formatRounds, parseRoundsJson } from './rounds-editor.js';
import '../src/ui/theme.css';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BracketsComponent],
  template: `
    <div>
      <div class="demo-controls">
        <label>
          <input
            type="checkbox"
            [checked]="thirdPlace"
            (change)="thirdPlace = $any($event.target).checked"
          />
          3rd place
        </label>
        <label>
          <input
            type="checkbox"
            [checked]="roundNav"
            (change)="roundNav = $any($event.target).checked"
          />
          Round nav
        </label>
        <label>
          Theme
          <select [value]="theme" (change)="theme = $any($event.target).value">
            <option value="default">Default</option>
            <option value="dark">Dark</option>
          </select>
        </label>
        <label>
          Radius
          <input
            type="number"
            min="0"
            max="24"
            [value]="radius"
            (input)="radius = +$any($event.target).value"
          />
        </label>
        <label>
          Match width
          <input
            type="number"
            min="120"
            max="360"
            step="8"
            [value]="matchWidth"
            (input)="matchWidth = +$any($event.target).value"
          />
        </label>
      </div>
      <tb-brackets
        [rounds]="rounds"
        [titles]="true"
        [theme]="theme"
        [thirdPlace]="thirdPlace"
        [roundNav]="roundNav"
        [radius]="radius"
        [matchWidth]="matchWidth"
        (change)="syncState()"
        (roundChange)="syncState()"
      />
      <section class="demo-rounds-editor">
        <h2>Rounds JSON</h2>
        <textarea
          spellcheck="false"
          aria-label="Rounds JSON"
          [value]="draftJson"
          (input)="draftJson = $any($event.target).value"
        ></textarea>
        <div class="demo-rounds-actions">
          <button type="button" class="demo-btn" (click)="applyRoundsFromEditor()">
            Apply
          </button>
          <button
            type="button"
            class="demo-btn demo-btn--secondary"
            (click)="resetRounds()"
          >
            Reset
          </button>
        </div>
        <p class="demo-rounds-error" role="alert">{{ roundsError }}</p>
      </section>
      <section class="demo-state">
        <h2>State</h2>
        <pre>{{ stateJson }}</pre>
      </section>
    </div>
  `,
})
class AppComponent implements AfterViewInit {
  @ViewChild(BracketsComponent) brackets!: BracketsComponent;

  theme: BracketsTheme = BracketsTheme.Default;
  thirdPlace = true;
  roundNav = true;
  radius = 8;
  matchWidth = 200;
  rounds = sampleRounds as RoundsInput;
  draftJson = formatRounds(sampleRounds);
  roundsError = '';
  stateJson = '';

  ngAfterViewInit(): void {
    queueMicrotask(() => this.syncState());
  }

  syncState(): void {
    const api = this.brackets;
    if (!api) return;
    this.stateJson = JSON.stringify(api.getState(), null, 2);
  }

  applyRoundsFromEditor(): void {
    const result = parseRoundsJson(this.draftJson);
    if (!result.ok) {
      this.roundsError = result.error ?? 'Invalid JSON';
      return;
    }
    this.roundsError = '';
    this.rounds = (result.rounds ?? sampleRounds) as RoundsInput;
    this.syncState();
  }

  resetRounds(): void {
    this.draftJson = formatRounds(sampleRounds);
    this.roundsError = '';
    this.rounds = sampleRounds as RoundsInput;
    this.syncState();
  }
}

bootstrapApplication(AppComponent);
