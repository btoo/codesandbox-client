/* eslint no-useless-escape: 0 */
/* eslint no-shadow: 0 */
/* eslint no-cond-assign: 0 */

/** @see {@link https://stackoverflow.com/a/27862868/3942699} */
const isWindows = navigator.platform.indexOf('Win') > -1;

const CONTROL_CODES = '\\u0000-\\u0020\\u007f-\\u009f';
const WEB_LINK_REGEX = new RegExp(
  '(?:[a-zA-Z][a-zA-Z0-9+.-]{2,}:\\/\\/|data:|www\\.)[^\\s' +
    CONTROL_CODES +
    '"]{2,}[^\\s' +
    CONTROL_CODES +
    '"\')}\\],:;.!?]',
  'ug'
);

const WIN_ABSOLUTE_PATH = /(?:[a-zA-Z]:(?:(?:\\|\/)[\w\.-]*)+)/;
const WIN_RELATIVE_PATH = /(?:(?:\~|\.)(?:(?:\\|\/)[\w\.-]*)+)/;
const WIN_PATH = new RegExp(
  `(${WIN_ABSOLUTE_PATH.source}|${WIN_RELATIVE_PATH.source})`
);
const POSIX_PATH = /((?:\~|\.)?(?:\/[\w\.-]*)+)/;
const LINE_COLUMN = /(?:\:([\d]+))?(?:\:([\d]+))?/;
const PATH_LINK_REGEX = new RegExp(
  `${isWindows ? WIN_PATH.source : POSIX_PATH.source}${LINE_COLUMN.source}`,
  'g'
);

const MAX_LENGTH = 2000;

type LinkKind = 'web' | 'path' | 'text';
type LinkPart = {
  kind: LinkKind;
  value: string;
  captures: string[];
};

/**
 * @see {@link https://github.com/microsoft/vscode/blob/master/src/vs/workbench/contrib/debug/browser/linkDetector.ts#L165-L204}
 * The following and its dependencies are taken from VS Code's source
 */
export default (text: string): LinkPart[] => {
  if (text.length > MAX_LENGTH) {
    return [{ kind: 'text', value: text, captures: [] }];
  }

  const regexes: RegExp[] = [WEB_LINK_REGEX, PATH_LINK_REGEX];
  const kinds: LinkKind[] = ['web', 'path'];
  const result: LinkPart[] = [];

  const splitOne = (text: string, regexIndex: number) => {
    if (regexIndex >= regexes.length) {
      result.push({ value: text, kind: 'text', captures: [] });
      return;
    }
    const regex = regexes[regexIndex];
    let currentIndex = 0;
    let match;
    regex.lastIndex = 0;
    while ((match = regex.exec(text)) !== null) {
      const stringBeforeMatch = text.substring(currentIndex, match.index);
      if (stringBeforeMatch) {
        splitOne(stringBeforeMatch, regexIndex + 1);
      }
      const value = match[0];
      result.push({
        value,
        kind: kinds[regexIndex],
        captures: match.slice(1),
      });
      currentIndex = match.index + value.length;
    }
    const stringAfterMatches = text.substring(currentIndex);
    if (stringAfterMatches) {
      splitOne(stringAfterMatches, regexIndex + 1);
    }
  };

  splitOne(text, 0);
  return result;
};
