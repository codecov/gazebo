import cs from 'classnames'

// enum type from GraphQL
export const LINE_TYPE = {
  HIT: 'H',
  MISS: 'M',
  PARTIAL: 'P',
} as const

export type LineType = (typeof LINE_TYPE)[keyof typeof LINE_TYPE]

export const LINE_STATE = {
  COVERED: 'COVERED',
  UNCOVERED: 'UNCOVERED',
  BLANK: 'BLANK',
  PARTIAL: 'PARTIAL',
} as const

export type LineState = (typeof LINE_STATE)[keyof typeof LINE_STATE]

const baseBorder = 'relative border-ds-gray-tertiary border-r'
const afterBorder = 'after:absolute after:inset-y-0 after:right-0'
const targetedLineClass = 'bg-ds-blue-medium bg-opacity-25'

export const classNamePerLineState = (targeted: Boolean = false) => ({
  [LINE_STATE.COVERED]: cs(baseBorder, {
    'bg-ds-coverage-covered font-normal': !targeted,
    [targetedLineClass]: targeted,
  }),
  [LINE_STATE.UNCOVERED]: cs(
    baseBorder,
    'font-bold after:border-ds-primary-red after:border-r-2',
    afterBorder,
    {
      'bg-ds-coverage-uncovered': !targeted,
      [targetedLineClass]: targeted,
    }
  ),
  [LINE_STATE.BLANK]: cs(baseBorder, 'font-normal', {
    [targetedLineClass]: targeted,
  }),
  [LINE_STATE.PARTIAL]: cs(
    baseBorder,
    'after:border-ds-primary-yellow after:border-dotted after:border-r-2 font-bold',
    afterBorder,
    {
      'bg-ds-coverage-partial': !targeted,
      [targetedLineClass]: targeted,
    }
  ),
})

export const classNamePerLineContent = (targeted: Boolean = false) => ({
  [LINE_STATE.COVERED]: cs('bg-opacity-25', {
    'bg-ds-coverage-covered': !targeted,
    [targetedLineClass]: targeted,
  }),
  [LINE_STATE.UNCOVERED]: cs(
    'relative after:border-ds-primary-red after:border-r-2 ',
    afterBorder,
    {
      'bg-ds-coverage-uncovered bg-opacity-25': !targeted,
      [targetedLineClass]: targeted,
    }
  ),
  [LINE_STATE.BLANK]: cs({ [targetedLineClass]: targeted }),
  [LINE_STATE.PARTIAL]: cs(
    'relative after:border-ds-primary-yellow after:border-r-2 after:border-dotted',
    afterBorder,
    {
      'bg-ds-coverage-partial bg-opacity-25': !targeted,
      [targetedLineClass]: targeted,
    }
  ),
})

export const lineStateToLabel = {
  [LINE_STATE.COVERED]: 'covered line of code',
  [LINE_STATE.UNCOVERED]: 'uncovered line of code',
  [LINE_STATE.BLANK]: 'line of code',
  [LINE_STATE.PARTIAL]: 'partial line of code',
} as const

export const CODE_RENDERER_TYPE = {
  DIFF: 'DIFF',
  SINGLE_LINE: 'SINGLE_LINE',
} as const

export const CODE_RENDERER_INFO = {
  UNEXPECTED_CHANGES: 'UNEXPECTED_CHANGES',
  EMPTY: '',
} as const

// Enum from https://github.com/codecov/shared/blob/master/shared/utils/merge.py#L275-L279
export function getLineState({ coverage }: { coverage: string | null }) {
  if (coverage === 'H' || coverage === 'M' || coverage === 'P') {
    return {
      [LINE_TYPE.HIT]: LINE_STATE.COVERED,
      [LINE_TYPE.MISS]: LINE_STATE.UNCOVERED,
      [LINE_TYPE.PARTIAL]: LINE_STATE.PARTIAL,
    }[coverage]
  }

  return LINE_STATE.BLANK
}

export const STICKY_PADDING_SIZES = {
  DIFF_LINE_DROPDOWN_PADDING: 356,
  REPO_PAGE_FILE_VIEWER: 222,
  PULL_PAGE_FILE_VIEWER: 408,
  COMMIT_PAGE_FILE_VIEWER: 408,
} as const
