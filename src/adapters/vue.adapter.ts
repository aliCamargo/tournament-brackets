import {
  defineComponent,
  h,
  onMounted,
  onBeforeUnmount,
  ref,
  watch,
  type PropType,
  type StyleValue,
} from 'vue';
import { Brackets as CoreBrackets } from '../facade/create.facade';
import type {
  BracketsApi,
  BracketsLabels,
  BracketsState,
  BracketsTheme,
  MatchInput,
  RoundsInput,
  ShowScores,
} from '../types';

const EMPTY_STATE: BracketsState = {
  titles: false,
  rounds: [],
  thirdPlace: null,
};

function remountKey(options: {
  titles?: boolean | string[];
  thirdPlace?: boolean | MatchInput;
  theme?: BracketsTheme;
  radius?: number | string;
  matchWidth?: number | string | null;
  showScores?: ShowScores;
  roundNav?: boolean;
  labels?: BracketsLabels | null;
}): string {
  return JSON.stringify({
    titles: options.titles ?? false,
    thirdPlace: options.thirdPlace ?? false,
    theme: options.theme ?? 'default',
    radius: options.radius ?? 8,
    matchWidth: options.matchWidth ?? null,
    showScores: options.showScores ?? 'auto',
    roundNav: options.roundNav ?? false,
    labels: options.labels ?? null,
  });
}

export const Brackets = defineComponent({
  name: 'Brackets',
  props: {
    rounds: {
      type: [Array, Object] as PropType<RoundsInput | null>,
      default: null,
    },
    titles: {
      type: [Boolean, Array] as PropType<boolean | string[]>,
      default: false,
    },
    thirdPlace: {
      type: [Boolean, Object] as PropType<boolean | MatchInput>,
      default: false,
    },
    theme: {
      type: String as PropType<BracketsTheme>,
      default: 'default',
    },
    radius: {
      type: [Number, String] as PropType<number | string>,
      default: 8,
    },
    matchWidth: {
      type: [Number, String] as PropType<number | string | null>,
      default: null,
    },
    showScores: {
      type: [Boolean, String] as PropType<ShowScores>,
      default: 'auto',
    },
    roundNav: {
      type: Boolean,
      default: false,
    },
    viewFromRound: {
      type: Number as PropType<number | undefined>,
      default: undefined,
    },
    labels: {
      type: Object as PropType<BracketsLabels | null>,
      default: null,
    },
    class: {
      type: String,
      default: '',
    },
    className: {
      type: String,
      default: '',
    },
    style: {
      type: [Object, String, Array] as PropType<StyleValue>,
      default: undefined,
    },
  },
  emits: {
    change: (_state: BracketsState) => true,
    roundChange: (_index: number) => true,
  },
  setup(props, { emit, expose }) {
    const hostRef = ref<HTMLDivElement | null>(null);
    const apiRef = ref<BracketsApi | null>(null);
    const didMountRounds = ref(false);
    const lastKey = ref('');
    let lastAppliedRounds: RoundsInput | null | undefined = undefined;

    const mountInstance = () => {
      const el = hostRef.value;
      if (!el) return;

      apiRef.value?.destroy();
      didMountRounds.value = false;
      const instance = CoreBrackets.create(el, {
        rounds: props.rounds,
        titles: props.titles,
        thirdPlace: props.thirdPlace,
        theme: props.theme,
        radius: props.radius,
        matchWidth: props.matchWidth,
        showScores: props.showScores,
        roundNav: props.roundNav,
        viewFromRound: props.viewFromRound,
        labels: props.labels ?? undefined,
        onChange: (state) => {
          emit('change', state);
        },
        onRoundChange: (index) => {
          emit('roundChange', index);
        },
      });
      apiRef.value = instance;
      lastKey.value = remountKey(props);
      lastAppliedRounds = props.rounds;
      didMountRounds.value = true;
    };

    onMounted(() => {
      mountInstance();
    });

    onBeforeUnmount(() => {
      apiRef.value?.destroy();
      apiRef.value = null;
    });

    watch(
      () => remountKey(props),
      (key) => {
        if (!hostRef.value) return;
        if (key === lastKey.value) return;
        mountInstance();
      },
    );

    watch(
      () => props.rounds,
      (rounds) => {
        if (!didMountRounds.value) return;
        if (remountKey(props) !== lastKey.value) return;
        if (rounds === lastAppliedRounds) return;
        lastAppliedRounds = rounds;
        apiRef.value?.setRounds(rounds ?? null);
      },
    );

    watch(
      () => props.viewFromRound,
      (index) => {
        if (index == null) return;
        if (!didMountRounds.value) return;
        if (remountKey(props) !== lastKey.value) return;
        apiRef.value?.setViewFromRound(index);
      },
    );

    expose({
      getState: (): BracketsState => apiRef.value?.getState() ?? EMPTY_STATE,
      setRounds: (
        rawRounds: RoundsInput | null | undefined,
        thirdPlaceOverride?: boolean | MatchInput,
      ) => {
        apiRef.value?.setRounds(rawRounds, thirdPlaceOverride);
      },
      setViewFromRound: (index: number) => {
        apiRef.value?.setViewFromRound(index);
      },
      destroy: () => {
        apiRef.value?.destroy();
        apiRef.value = null;
      },
    } satisfies BracketsApi);

    return () => {
      const classParts = [props.class, props.className].filter(Boolean);
      return h('div', {
        ref: hostRef,
        class: classParts.length ? classParts.join(' ') : undefined,
        style: props.style,
      });
    };
  },
});

export default Brackets;
