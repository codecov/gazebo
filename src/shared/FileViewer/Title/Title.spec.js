import { render, screen } from '@testing-library/react'
import { TitleFlags } from './Title'

const onChange = jest.fn(() => {})

describe('TitleFlags', () => {
  function setup(props) {
    render(<TitleFlags {...props} />)
  }

  describe('shows the loading spinner', () => {
    beforeEach(() => {
      setup({
        list: ['hi', 'more'],
        current: [],
        onChange,
        flagsIsLoading: true,
      })
    })

    it('covered', () => {
      expect(screen.getByTestId('spinner')).toBeInTheDocument()
    })
  })

  describe('hides the spinner', () => {
    beforeEach(() => {
      setup({
        list: ['hi', 'more'],
        current: [],
        onChange,
        flagsIsLoading: false,
      })
    })

    it('uncovered', () => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
    })
  })

  describe('defaults to no spinner', () => {
    beforeEach(() => {
      setup({
        list: ['hi', 'more'],
        current: [],
        onChange,
      })
    })

    it('uncovered', () => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
    })
  })
})
