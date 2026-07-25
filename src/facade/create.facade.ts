import { BracketsController } from '../controller/brackets.controller';
import type { BracketsApi, BracketsOptions } from '../domain/index';
import { CssUtils } from '../utils/css.utils';

export function formatRadius(value: unknown): string | null {
  return CssUtils.formatRadius(value);
}

export function create(
  element: HTMLElement,
  options: BracketsOptions = {},
): BracketsApi | null {
  return BracketsController.mount(element, options);
}

export const Brackets = { create };
