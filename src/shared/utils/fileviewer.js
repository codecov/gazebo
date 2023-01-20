import cs from 'classnames'

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

const baseBorder = 'relative border-ds-gray-tertiary border-r'
const afterBorder = 'after:absolute after:inset-y-0 after:right-0'

export const classNamePerLineState = {
  [LINE_STATE.COVERED]: cs(baseBorder, 'bg-ds-coverage-covered font-normal'),
  [LINE_STATE.UNCOVERED]: cs(
    baseBorder,
    'font-bold bg-ds-coverage-uncovered after:border-ds-primary-red after:border-r-2',
    afterBorder
  ),
  [LINE_STATE.BLANK]: cs(baseBorder, 'font-normal'),
  [LINE_STATE.PARTIAL]: cs(
    baseBorder,
    'bg-ds-coverage-partial after:border-ds-primary-yellow after:border-dotted after:border-r-2 font-bold',
    afterBorder
  ),
}

export const classNamePerLineContent = {
  [LINE_STATE.COVERED]: 'bg-ds-coverage-covered bg-opacity-25',
  [LINE_STATE.UNCOVERED]: cs(
    'relative bg-ds-coverage-uncovered bg-opacity-25 after:border-ds-primary-red after:border-r-2 ',
    afterBorder
  ),
  [LINE_STATE.BLANK]: '',
  [LINE_STATE.PARTIAL]: cs(
    'relative bg-ds-coverage-partial bg-opacity-25 after:border-ds-primary-yellow after:border-r-2 after:border-dotted',
    afterBorder
  ),
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
