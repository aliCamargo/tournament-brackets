/// <reference types="jquery" />
import $ from 'jquery';
import { BracketsTheme, ShowScoresMode } from '../domain/index';
import { Brackets } from '../facade/create.facade';
import type { BracketsApi, BracketsOptions } from '../types';

declare global {
  interface JQuery {
    brackets(options?: BracketsOptions): JQuery;
  }

  interface JQueryBracketsFn {
    (options?: BracketsOptions): JQuery;
    defaults: BracketsOptions & Record<string, unknown>;
  }
}

const bracketsPlugin: JQueryBracketsFn = function bracketsPlugin(
  this: JQuery,
  options?: BracketsOptions,
) {
  if (!this.length) {
    console.error('Object not found :( ');
    return this;
  }

  return this.each(function eachBracket(this: HTMLElement) {
    const $el = $(this);
    const prev = $el.data('brackets') as BracketsApi | undefined;
    if (prev && typeof prev.destroy === 'function') prev.destroy();
    const instance = Brackets.create(this, options ?? {});
    $el.data('brackets', instance);
  });
};

bracketsPlugin.defaults = {
  rounds: null,
  titles: false,
  thirdPlace: false,
  radius: 8,
  matchWidth: null,
  showScores: ShowScoresMode.Auto,
  roundNav: false,
  theme: BracketsTheme.Default,
};

$.fn.brackets = bracketsPlugin;

export default bracketsPlugin;
