import {
  classNamePerLineContent,
  classNamePerLineState,
  LINE_STATE,
} from './fileviewer'

describe('fileviewer', () => {
  describe('classNamePerLineState', () => {
    describe('when targeted is false', () => {
      it('should return the correct class names for each line state', () => {
        expect(classNamePerLineState()).toEqual({
          [LINE_STATE.COVERED]:
            'relative border-ds-gray-tertiary border-r bg-ds-coverage-covered font-normal',
          [LINE_STATE.UNCOVERED]:
            'relative border-ds-gray-tertiary border-r font-bold after:border-ds-primary-red after:border-r-2 after:absolute after:inset-y-0 after:right-0 bg-ds-coverage-uncovered',
          [LINE_STATE.BLANK]:
            'relative border-ds-gray-tertiary border-r font-normal',
          [LINE_STATE.PARTIAL]:
            'relative border-ds-gray-tertiary border-r after:border-ds-primary-yellow after:border-dotted after:border-r-2 font-bold after:absolute after:inset-y-0 after:right-0 bg-ds-coverage-partial',
        })
      })
    })

    describe('when targeted is true', () => {
      it('should return the correct class names for each line state', () => {
        expect(classNamePerLineState(true)).toEqual({
          [LINE_STATE.COVERED]:
            'relative border-ds-gray-tertiary border-r bg-ds-blue-medium bg-opacity-25',
          [LINE_STATE.UNCOVERED]:
            'relative border-ds-gray-tertiary border-r font-bold after:border-ds-primary-red after:border-r-2 after:absolute after:inset-y-0 after:right-0 bg-ds-blue-medium bg-opacity-25',
          [LINE_STATE.BLANK]:
            'relative border-ds-gray-tertiary border-r font-normal bg-ds-blue-medium bg-opacity-25',
          [LINE_STATE.PARTIAL]:
            'relative border-ds-gray-tertiary border-r after:border-ds-primary-yellow after:border-dotted after:border-r-2 font-bold after:absolute after:inset-y-0 after:right-0 bg-ds-blue-medium bg-opacity-25',
        })
      })
    })
  })

  describe('classNamePerLineContent', () => {
    describe('when targeted is false', () => {
      it('should return the correct class names for each line state', () => {
        expect(classNamePerLineContent()).toEqual({
          [LINE_STATE.COVERED]: 'bg-opacity-25 bg-ds-coverage-covered',
          [LINE_STATE.UNCOVERED]:
            'relative after:border-ds-primary-red after:border-r-2  after:absolute after:inset-y-0 after:right-0 bg-ds-coverage-uncovered bg-opacity-25',
          [LINE_STATE.BLANK]: '',
          [LINE_STATE.PARTIAL]:
            'relative after:border-ds-primary-yellow after:border-r-2 after:border-dotted after:absolute after:inset-y-0 after:right-0 bg-ds-coverage-partial bg-opacity-25',
        })
      })
    })

    describe('when targeted is true', () => {
      it('should return the correct class names for each line state', () => {
        expect(classNamePerLineContent(true)).toEqual({
          [LINE_STATE.COVERED]: 'bg-opacity-25 bg-ds-blue-medium bg-opacity-25',
          [LINE_STATE.UNCOVERED]:
            'relative after:border-ds-primary-red after:border-r-2  after:absolute after:inset-y-0 after:right-0 bg-ds-blue-medium bg-opacity-25',
          [LINE_STATE.BLANK]: 'bg-ds-blue-medium bg-opacity-25',
          [LINE_STATE.PARTIAL]:
            'relative after:border-ds-primary-yellow after:border-r-2 after:border-dotted after:absolute after:inset-y-0 after:right-0 bg-ds-blue-medium bg-opacity-25',
        })
      })
    })
  })
})
