import { describe, it, expect, vi, afterEach } from 'vitest';
import React, { createRef } from 'react';
import { render, cleanup, act } from '@testing-library/react';
import { Brackets } from '../src/adapters/react.adapter';

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

afterEach(() => {
  cleanup();
});

describe('React Brackets adapter', () => {
  it('mounts bracket DOM from rounds', () => {
    const { container } = render(<Brackets rounds={sampleRounds} />);
    expect(container.querySelector('.jb-root')).toBeTruthy();
    expect(container.textContent).toContain('A');
    expect(container.textContent).toContain('B');
  });

  it('calls onChange once when mounting with rounds', () => {
    const onChange = vi.fn();

    render(<Brackets rounds={sampleRounds} onChange={onChange} />);

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('updates rounds without remounting the root', () => {
    const { container, rerender } = render(
      <Brackets rounds={sampleRounds} theme="default" />,
    );
    const root1 = container.querySelector('.jb-root');
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
    rerender(<Brackets rounds={nextRounds} theme="default" />);
    const root2 = container.querySelector('.jb-root');
    expect(root2).toBe(root1);
    expect(container.textContent).toContain('X');
  });

  it('remounts when theme changes', () => {
    const { container, rerender } = render(
      <Brackets rounds={sampleRounds} theme="default" />,
    );
    const root1 = container.querySelector('.jb-root');
    expect(root1?.className).toContain('jb-theme-default');

    rerender(<Brackets rounds={sampleRounds} theme="dark" />);
    const root2 = container.querySelector('.jb-root');
    expect(root2).not.toBe(root1);
    expect(root2?.className).toContain('jb-theme-dark');
  });

  it('exposes BracketsApi on ref', () => {
    const ref = createRef();
    render(<Brackets ref={ref} rounds={sampleRounds} roundNav />);
    expect(ref.current).toBeTruthy();
    expect(typeof ref.current.getState).toBe('function');
    expect(typeof ref.current.setRounds).toBe('function');
    expect(typeof ref.current.setViewFromRound).toBe('function');
    expect(typeof ref.current.destroy).toBe('function');

    const state = ref.current.getState();
    expect(state.rounds.length).toBeGreaterThan(0);

    act(() => {
      ref.current.setViewFromRound(1);
    });
    expect(ref.current.getState().viewFromRound).toBe(1);
  });

  it('destroys on unmount', () => {
    const { container, unmount } = render(<Brackets rounds={sampleRounds} />);
    expect(container.querySelector('.jb-root')).toBeTruthy();
    unmount();
    expect(document.querySelector('.jb-root')).toBeNull();
  });

  it('does not remount when only onChange identity changes', () => {
    const { container, rerender } = render(
      <Brackets rounds={sampleRounds} theme="default" onChange={() => {}} />,
    );
    const root1 = container.querySelector('.jb-root');
    rerender(
      <Brackets rounds={sampleRounds} theme="default" onChange={() => {}} />,
    );
    expect(container.querySelector('.jb-root')).toBe(root1);
  });

  it('applies className and style to the host element', () => {
    const { container } = render(
      <Brackets
        rounds={sampleRounds}
        className="my-bracket"
        style={{ width: '100%' }}
      />,
    );
    const host = container.firstChild;
    expect(host.className).toContain('my-bracket');
    expect(host.style.width).toBe('100%');
  });
});
