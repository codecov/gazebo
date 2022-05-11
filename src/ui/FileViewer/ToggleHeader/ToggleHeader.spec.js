import { fireEvent, render, screen } from '@testing-library/react'

import ToggleHeader from './ToggleHeader'

describe('ToggleHeader', () => {
  function setup(props) {
    render(<ToggleHeader title={'sample title'} {...props} />)
  }

  describe('renders Titles with flags and toggles', () => {
    beforeEach(() => {
      setup({
        coverageIsLoading: false,
        lineCoverageStatesAndSetters: {
          covered: true,
          uncovered: true,
          partial: true,
          setCovered: jest.fn(),
          setUncovered: jest.fn(),
          setPartial: jest.fn(),
        },
        flagData: {
          flagNames: [],
          selectedFlags: [],
          setSelectedFlags: jest.fn(),
        },
      })
    })

    it('renders title', () => {
      expect(screen.getByText('sample title')).toBeInTheDocument()
    })
    it('renders flags title', () => {
      expect(screen.queryByText('All flags')).not.toBeInTheDocument()
    })
    it('renders toggles', () => {
      expect(screen.getByText(/View coverage by:/)).toBeInTheDocument()
      expect(screen.getByLabelText('show-covered-lines')).toBeInTheDocument()
      expect(screen.getByLabelText('show-partial-lines')).toBeInTheDocument()
      expect(screen.getByLabelText('show-uncovered-lines')).toBeInTheDocument()
      fireEvent.click(screen.getByLabelText('show-covered-lines'))
      fireEvent.click(screen.getByLabelText('show-partial-lines'))
      fireEvent.click(screen.getByLabelText('show-uncovered-lines'))
    })
  })

  describe('when file has 1 flag', () => {
    beforeEach(() => {
      setup({
        coverageIsLoading: false,
        lineCoverageStatesAndSetters: {
          covered: true,
          uncovered: true,
          partial: true,
          setCovered: jest.fn(),
          setUncovered: jest.fn(),
          setPartial: jest.fn(),
        },
        flagData: {
          flagNames: ['one', 'two'],
          selectedFlags: ['one'],
          setSelectedFlags: jest.fn(),
        },
      })
    })

    it('renders flags title', () => {
      expect(screen.getByText('1 flag selected')).toBeInTheDocument()
    })
  })

  describe('when file has many flags', () => {
    beforeEach(() => {
      setup({
        coverageIsLoading: false,
        lineCoverageStatesAndSetters: {
          covered: true,
          uncovered: true,
          partial: true,
          setCovered: jest.fn(),
          setUncovered: jest.fn(),
          setPartial: jest.fn(),
        },
        flagData: {
          flagNames: ['one', 'two'],
          selectedFlags: ['one', 'two'],
          setSelectedFlags: jest.fn(),
        },
      })
    })

    it('renders flags title', () => {
      expect(screen.getByText('2 flags selected')).toBeInTheDocument()
    })
  })
})
