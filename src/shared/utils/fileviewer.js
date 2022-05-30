// enum type from GraphQL
export const LINE_TYPE = Object.freeze({
  HIT: 'H',
  MISS: 'M',
  PARTIAL: 'P',
})

export const LINE_STATE = Object.freeze({
  COVERED: 'COVERED',
  UNCOVERED: 'UNCOVERED',
  BLANK: 'BLANK',
  PARTIAL: 'PARTIAL',
})

export const classNamePerLineState = {
  [LINE_STATE.COVERED]:
    'bg-ds-coverage-covered border-ds-primary-green border-r-2',
  [LINE_STATE.UNCOVERED]:
    'bg-ds-coverage-uncovered border-ds-primary-red border-r-2',
  [LINE_STATE.BLANK]: 'border-ds-gray-tertiary border-r',
  [LINE_STATE.PARTIAL]:
    'bg-ds-coverage-partial border-ds-primary-yellow border-r-2',
}

export const lineStateToLabel = {
  [LINE_STATE.COVERED]: 'covered line of code',
  [LINE_STATE.UNCOVERED]: 'uncovered line of code',
  [LINE_STATE.BLANK]: 'line of code',
  [LINE_STATE.PARTIAL]: 'partial line of code',
}

export const CODE_RENDERER_TYPE = Object.freeze({
  DIFF: 'DIFF',
  SINGLE_LINE: 'SINGLE-LINE',
})

export const CODE_RENDERER_INFO = Object.freeze({
  UNEXPECTED_CHANGES: 'UNEXPECTED_CHANGES',
  EMPTY: '',
})

// Enum from https://github.com/codecov/shared/blob/master/shared/utils/merge.py#L275-L279
export function getLineState({ coverage, showLines }) {
  const { showCovered, showUncovered, showPartial } = showLines
  return coverage
    ? {
        [LINE_TYPE.HIT]: showCovered ? LINE_STATE.COVERED : LINE_STATE.BLANK,
        [LINE_TYPE.MISS]: showUncovered
          ? LINE_STATE.UNCOVERED
          : LINE_STATE.BLANK,
        [LINE_TYPE.PARTIAL]: showPartial
          ? LINE_STATE.PARTIAL
          : LINE_STATE.BLANK,
      }[coverage]
    : LINE_STATE.BLANK
}
