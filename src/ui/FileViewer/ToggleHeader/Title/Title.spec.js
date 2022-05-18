import { render, screen } from '@testing-library/react'

import Title, { TitleFlags } from './Title'

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

describe('Title', () => {
  function setup(props) {
    jest.mock('ui/FileViewer/ToggleHeader/Title', () => ({
      ...jest.requireActual('ui/FileViewer/ToggleHeader/Title'), // import and retain the original functionalities
      TitleFlags: jest.fn(() => () => 'Sample Title Flags'),
    }))
    render(<Title {...props} />)
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup({
        title: 'sample title',
        Flags: () => <div>This is representing the flags</div>,
      })
    })

    it('shows the title', () => {
      expect(screen.getByText('sample title')).toBeInTheDocument()
      expect(screen.getByText('View coverage by:')).toBeInTheDocument()
    })
  })
})
