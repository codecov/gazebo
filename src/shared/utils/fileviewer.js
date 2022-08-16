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
  [LINE_STATE.COVERED]: 'bg-ds-coverage-covered font-normal',
  [LINE_STATE.UNCOVERED]:
    'bg-ds-coverage-uncovered border-ds-primary-red border-r-2 font-bold',
  [LINE_STATE.BLANK]: 'border-ds-gray-tertiary border-r font-normal',
  [LINE_STATE.PARTIAL]:
    'bg-ds-coverage-partial border-ds-primary-yellow border-dotted border-r-2 font-bold',
}

export const classNamePerLineContent = {
  [LINE_STATE.COVERED]: 'bg-ds-coverage-covered bg-opacity-25',
  [LINE_STATE.UNCOVERED]:
    'bg-ds-coverage-uncovered bg-opacity-25 border-ds-primary-red border-r-2',
  [LINE_STATE.BLANK]: '',
  [LINE_STATE.PARTIAL]:
    'bg-ds-coverage-partial bg-opacity-25 border-ds-primary-yellow border-r-2 border-dotted',
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
export function getLineState({ coverage }) {
  return coverage
    ? {
        [LINE_TYPE.HIT]: LINE_STATE.COVERED,
        [LINE_TYPE.MISS]: LINE_STATE.UNCOVERED,
        [LINE_TYPE.PARTIAL]: LINE_STATE.PARTIAL,
      }[coverage]
    : LINE_STATE.BLANK
}
