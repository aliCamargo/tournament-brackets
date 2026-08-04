import { describe, it, expect, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import { Brackets } from '../src/adapters/vue.adapter';

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
  document.body.innerHTML = '';
});

describe('Vue Brackets adapter', () => {
  it('mounts bracket DOM from rounds', async () => {
    const wrapper = mount(Brackets, {
      props: { rounds: sampleRounds },
      attachTo: document.body,
    });
    await flushPromises();
    expect(wrapper.find('.jb-root').exists()).toBe(true);
    expect(wrapper.text()).toContain('A');
    expect(wrapper.text()).toContain('B');
    wrapper.unmount();
  });

  it('emits change once when mounting with rounds', async () => {
    const wrapper = mount(Brackets, {
      props: { rounds: sampleRounds },
      attachTo: document.body,
    });
    await flushPromises();
    const changeEvents = wrapper.emitted('change');
    expect(changeEvents).toBeTruthy();
    expect(changeEvents!.length).toBe(1);
    wrapper.unmount();
  });

  it('updates rounds without remounting the root', async () => {
    const wrapper = mount(Brackets, {
      props: { rounds: sampleRounds, theme: 'default' },
      attachTo: document.body,
    });
    await flushPromises();
    const root1 = wrapper.find('.jb-root').element;

    const nextRounds = [
      [
        {
          player1: { name: 'X', id: 'x', winner: true },
          player2: { name: 'Y', id: 'y' },
        },
      ],
      [{ player1: { name: 'X', id: 'x' } }],
    ];
    await wrapper.setProps({ rounds: nextRounds });
    await flushPromises();
    const root2 = wrapper.find('.jb-root').element;
    expect(root2).toBe(root1);
    expect(wrapper.text()).toContain('X');
    wrapper.unmount();
  });

  it('remounts when theme changes', async () => {
    const wrapper = mount(Brackets, {
      props: { rounds: sampleRounds, theme: 'default' },
      attachTo: document.body,
    });
    await flushPromises();
    const root1 = wrapper.find('.jb-root').element;
    expect(root1.className).toContain('jb-theme-default');

    await wrapper.setProps({ theme: 'dark' });
    await flushPromises();
    const root2 = wrapper.find('.jb-root').element;
    expect(root2).not.toBe(root1);
    expect(root2.className).toContain('jb-theme-dark');
    wrapper.unmount();
  });

  it('exposes BracketsApi on component ref', async () => {
    const wrapper = mount(Brackets, {
      props: { rounds: sampleRounds, roundNav: true },
      attachTo: document.body,
    });
    await flushPromises();
    const api = wrapper.vm as unknown as {
      getState: () => { rounds: unknown[]; viewFromRound?: number };
      setRounds: (r: unknown) => void;
      setViewFromRound: (i: number) => void;
      destroy: () => void;
    };
    expect(typeof api.getState).toBe('function');
    expect(typeof api.setRounds).toBe('function');
    expect(typeof api.setViewFromRound).toBe('function');
    expect(typeof api.destroy).toBe('function');

    const state = api.getState();
    expect(state.rounds.length).toBeGreaterThan(0);

    api.setViewFromRound(1);
    await nextTick();
    expect(api.getState().viewFromRound).toBe(1);
    wrapper.unmount();
  });

  it('destroys on unmount', async () => {
    const wrapper = mount(Brackets, {
      props: { rounds: sampleRounds },
      attachTo: document.body,
    });
    await flushPromises();
    expect(document.querySelector('.jb-root')).toBeTruthy();
    wrapper.unmount();
    expect(document.querySelector('.jb-root')).toBeNull();
  });

  it('does not remount when remount key is unchanged', async () => {
    const wrapper = mount(Brackets, {
      props: { rounds: sampleRounds, theme: 'default' },
      attachTo: document.body,
    });
    await flushPromises();
    const root1 = wrapper.find('.jb-root').element;
    await wrapper.setProps({ rounds: sampleRounds, theme: 'default' });
    await flushPromises();
    expect(wrapper.find('.jb-root').element).toBe(root1);
    wrapper.unmount();
  });

  it('emits change once when rounds and remount key change together', async () => {
    const wrapper = mount(Brackets, {
      props: { rounds: sampleRounds, theme: 'default' },
      attachTo: document.body,
    });
    await flushPromises();
    const changeCountBefore = wrapper.emitted('change')!.length;

    const nextRounds = [
      [
        {
          player1: { name: 'X', id: 'x', winner: true },
          player2: { name: 'Y', id: 'y' },
        },
      ],
      [{ player1: { name: 'X', id: 'x' } }],
    ];
    await wrapper.setProps({ rounds: nextRounds, theme: 'dark' });
    await flushPromises();

    const changeDelta = wrapper.emitted('change')!.length - changeCountBefore;
    expect(changeDelta).toBe(1);
    expect(wrapper.find('.jb-root').element.className).toContain('jb-theme-dark');
    expect(wrapper.text()).toContain('X');
    wrapper.unmount();
  });

  it('applies class / className and style to the host element', async () => {
    const wrapper = mount(Brackets, {
      props: {
        rounds: sampleRounds,
        class: 'via-class',
        className: 'via-class-name',
        style: { width: '100%' },
      },
      attachTo: document.body,
    });
    await flushPromises();
    const host = wrapper.element as HTMLElement;
    expect(host.className).toContain('via-class');
    expect(host.className).toContain('via-class-name');
    expect(host.style.width).toBe('100%');
    wrapper.unmount();
  });
});
