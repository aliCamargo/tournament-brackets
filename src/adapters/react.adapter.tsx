import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type CSSProperties,
} from 'react';
import { Brackets as CoreBrackets } from '../facade/create.facade';
import type {
  BracketsApi,
  BracketsOptions,
  BracketsState,
} from '../types';

export type BracketsProps = BracketsOptions & {
  className?: string;
  style?: CSSProperties;
};

const EMPTY_STATE: BracketsState = {
  titles: false,
  rounds: [],
  thirdPlace: null,
};

function remountKey(props: BracketsProps): string {
  return JSON.stringify({
    titles: props.titles ?? false,
    thirdPlace: props.thirdPlace ?? false,
    theme: props.theme ?? 'default',
    radius: props.radius ?? 8,
    matchWidth: props.matchWidth ?? null,
    showScores: props.showScores ?? 'auto',
    roundNav: props.roundNav ?? false,
    labels: props.labels ?? null,
  });
}

export const Brackets = forwardRef<BracketsApi, BracketsProps>(
  function Brackets(props, ref) {
    const {
      className,
      style,
      rounds,
      viewFromRound,
      onChange,
      onRoundChange,
      ...options
    } = props;

    const hostRef = useRef<HTMLDivElement | null>(null);
    const apiRef = useRef<BracketsApi | null>(null);
    const onChangeRef = useRef(onChange);
    const onRoundChangeRef = useRef(onRoundChange);
    const didMountRoundsRef = useRef(false);
    onChangeRef.current = onChange;
    onRoundChangeRef.current = onRoundChange;

    const key = remountKey(props);

    useImperativeHandle(
      ref,
      (): BracketsApi => ({
        getState: () => apiRef.current?.getState() ?? EMPTY_STATE,
        setRounds: (rawRounds, thirdPlaceOverride) => {
          apiRef.current?.setRounds(rawRounds, thirdPlaceOverride);
        },
        setViewFromRound: (index) => {
          apiRef.current?.setViewFromRound(index);
        },
        destroy: () => {
          apiRef.current?.destroy();
          apiRef.current = null;
        },
      }),
      [],
    );

    useEffect(() => {
      const el = hostRef.current;
      if (!el) return undefined;

      const instance = CoreBrackets.create(el, {
        ...options,
        rounds,
        viewFromRound,
        onChange: (state) => {
          onChangeRef.current?.(state);
        },
        onRoundChange: (index) => {
          onRoundChangeRef.current?.(index);
        },
      });
      apiRef.current = instance;

      return () => {
        instance?.destroy();
        if (apiRef.current === instance) apiRef.current = null;
      };
      // Remount only when remount-key options change (not rounds / callbacks).
      // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
    }, [key]);

    useEffect(() => {
      if (!didMountRoundsRef.current) {
        didMountRoundsRef.current = true;
        return;
      }
      apiRef.current?.setRounds(rounds ?? null);
    }, [rounds]);

    useEffect(() => {
      if (viewFromRound == null) return;
      apiRef.current?.setViewFromRound(viewFromRound);
    }, [viewFromRound]);

    return <div ref={hostRef} className={className} style={style} />;
  },
);

Brackets.displayName = 'Brackets';

export default Brackets;
