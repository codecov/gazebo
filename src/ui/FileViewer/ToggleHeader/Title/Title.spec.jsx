import { render, screen } from '@testing-library/react'

import Title, { TitleFlags, TitleHitCount } from './Title'

const onChange = jest.fn()

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
    })
  })
})

describe('TitleFlags', () => {
  function setup(props) {
    render(<TitleFlags {...props} />)
  }

  describe('shows the loading spinner', () => {
    beforeEach(() => {
      setup({
        flags: ['hi', 'more'],
        onFlagsChange: onChange,
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
        flags: ['hi', 'more'],
        onFlagsChange: onChange,
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
        flags: ['hi', 'more'],
        onFlagsChange: onChange,
      })
    })

    it('uncovered', () => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
    })
  })
})

describe('TitleHitCount', () => {
  describe('showHitCount prop is not passed', () => {
    it('does not display legend', () => {
      const { container } = render(<TitleHitCount />)

      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('showHitCount is set to false', () => {
    it('does not display legend', () => {
      const { container } = render(<TitleHitCount showHitCount={false} />)

      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('showHitCount is set to true', () => {
    it('displays hit count legend', () => {
      render(<TitleHitCount showHitCount={true} />)

      const hitIcon = screen.getByText('n')
      expect(hitIcon).toBeInTheDocument()

      const legend = screen.getByText('upload #')
      expect(legend).toBeInTheDocument()
    })
  })
})
