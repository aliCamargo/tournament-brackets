import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BracketsComponent } from '../src/adapters/angular.adapter';

const sampleRounds = [
  [
    {
      player1: { name: 'A', id: 'a', winner: true },
      player2: { name: 'B', id: 'b' },
    },
    {
      player1: { name: 'C', id: 'c', winner: true },
      player2: { name: 'D', id: 'd' },
    },
  ],
  [
    {
      player1: { name: 'A', id: 'a' },
      player2: { name: 'C', id: 'c' },
    },
  ],
  [{ player1: { name: 'A', id: 'a' } }],
];

describe('Angular Brackets adapter', () => {
  let fixture: ComponentFixture<BracketsComponent>;
  let component: BracketsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BracketsComponent],
    }).compileComponents();
  });

  afterEach(() => {
    fixture?.destroy();
    TestBed.resetTestingModule();
    document.body.innerHTML = '';
  });

  function mount(rounds = sampleRounds, extra: Record<string, unknown> = {}) {
    fixture = TestBed.createComponent(BracketsComponent);
    component = fixture.componentInstance;
    Object.assign(component, { rounds, ...extra });
    fixture.detectChanges();
  }

  it('mounts bracket DOM from rounds', () => {
    mount();
    const root = fixture.nativeElement.querySelector('.jb-root');
    expect(root).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('A');
    expect(fixture.nativeElement.textContent).toContain('B');
  });

  it('emits change once when mounting with rounds', () => {
    const onChange = vi.fn();
    fixture = TestBed.createComponent(BracketsComponent);
    component = fixture.componentInstance;
    component.rounds = sampleRounds;
    component.change.subscribe(onChange);
    fixture.detectChanges();
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('updates rounds without remounting the root', () => {
    mount(sampleRounds, { theme: 'default' });
    const root1 = fixture.nativeElement.querySelector('.jb-root');
    expect(root1).toBeTruthy();

    const nextRounds = [
      [
        {
          player1: { name: 'X', id: 'x', winner: true },
          player2: { name: 'Y', id: 'y' },
        },
      ],
      [{ player1: { name: 'X', id: 'x' } }],
    ];
    fixture.componentRef.setInput('rounds', nextRounds);
    fixture.detectChanges();

    const root2 = fixture.nativeElement.querySelector('.jb-root');
    expect(root2).toBe(root1);
    expect(fixture.nativeElement.textContent).toContain('X');
  });

  it('remounts when theme changes', () => {
    mount(sampleRounds, { theme: 'default' });
    const root1 = fixture.nativeElement.querySelector('.jb-root');
    expect(root1?.className).toContain('jb-theme-default');

    fixture.componentRef.setInput('theme', 'dark');
    fixture.detectChanges();

    const root2 = fixture.nativeElement.querySelector('.jb-root');
    expect(root2).not.toBe(root1);
    expect(root2?.className).toContain('jb-theme-dark');
  });

  it('exposes BracketsApi on the component instance', () => {
    mount(sampleRounds, { roundNav: true });
    expect(typeof component.getState).toBe('function');
    expect(typeof component.setRounds).toBe('function');
    expect(typeof component.setViewFromRound).toBe('function');
    expect(typeof component.destroy).toBe('function');

    const state = component.getState();
    expect(state.rounds.length).toBeGreaterThan(0);

    component.setViewFromRound(1);
    expect(component.getState().viewFromRound).toBe(1);
  });

  it('exposes BracketsApi via parent ViewChild', async () => {
    TestBed.resetTestingModule();
    @Component({
      standalone: true,
      imports: [BracketsComponent],
      template: `<tb-brackets [rounds]="rounds" [roundNav]="true" />`,
    })
    class HostComponent {
      @ViewChild(BracketsComponent) brackets!: BracketsComponent;
      rounds = sampleRounds;
    }

    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();
    const hostFixture = TestBed.createComponent(HostComponent);
    hostFixture.detectChanges();
    const brackets = hostFixture.componentInstance.brackets;
    expect(brackets).toBeTruthy();
    expect(brackets.getState().rounds.length).toBeGreaterThan(0);
    hostFixture.destroy();
  });

  it('destroys on fixture destroy', () => {
    mount();
    expect(fixture.nativeElement.querySelector('.jb-root')).toBeTruthy();
    fixture.destroy();
    expect(document.querySelector('.jb-root')).toBeNull();
  });

  it('does not remount when only unrelated host state changes', async () => {
    TestBed.resetTestingModule();
    @Component({
      standalone: true,
      imports: [BracketsComponent],
      template: `
        <p>{{ label }}</p>
        <tb-brackets [rounds]="rounds" theme="default" />
      `,
    })
    class HostComponent {
      label = 'a';
      rounds = sampleRounds;
      @ViewChild(BracketsComponent) brackets!: BracketsComponent;
    }

    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();
    const hostFixture = TestBed.createComponent(HostComponent);
    hostFixture.detectChanges();
    const root1 = hostFixture.nativeElement.querySelector('.jb-root');

    hostFixture.componentInstance.label = 'b';
    hostFixture.detectChanges();

    const root2 = hostFixture.nativeElement.querySelector('.jb-root');
    expect(root2).toBe(root1);
    hostFixture.destroy();
  });

  it('applies class and style to the host wrapper', () => {
    mount(sampleRounds, {
      class: 'my-bracket',
      style: { width: '100%' },
    });
    const host = fixture.nativeElement.querySelector('div');
    expect(host?.className).toContain('my-bracket');
    expect((host as HTMLElement).style.width).toBe('100%');
  });
});
