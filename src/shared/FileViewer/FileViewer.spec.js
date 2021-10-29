import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'
import { useCoverageWithFlags } from 'services/file/hooks'

import FileViewer from './FileViewer'
import { LINE_TYPE } from './lineStates'

jest.mock('services/file/hooks')
jest.mock('ui/Spinner', () => () => 'Spinner')

describe('FileViewer', () => {
  const defaultProps = {
    treePaths: [],
    coverage: {
      1: LINE_TYPE.MISS,
      2: LINE_TYPE.HIT,
      3: LINE_TYPE.MISS,
      4: LINE_TYPE.MISS,
      5: LINE_TYPE.HIT,
      6: LINE_TYPE.MISS,
      7: LINE_TYPE.HIT,
      8: LINE_TYPE.MISS,
      9: LINE_TYPE.MISS,
      10: LINE_TYPE.MISS,
      11: LINE_TYPE.HIT,
    },
    content: 'testcontent',
    totals: 23,
    title: 'Title',
    change: null,
  }

  function setup(props = {}, dataCoverageWithFlag = {}) {
    const combindedProps = Object.assign({}, defaultProps, props)
    useCoverageWithFlags.mockReturnValue(dataCoverageWithFlag)
    render(
      <MemoryRouter
        initialEntries={['/gh/codecov/repo-test/blob/master/src/index2.py']}
      >
        <Route path="/:provider/:owner/:repo/blob/:ref/*">
          <FileViewer {...combindedProps} />
        </Route>
      </MemoryRouter>
    )
  }

  describe('renders without change', () => {
    beforeEach(() => {
      setup()
    })

    it('renders coverage information of the file', () => {
      expect(screen.getByText(/23\.00%/i)).toBeInTheDocument()
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
    it('renders code', () => {
      expect(screen.getByText('testcontent')).toBeInTheDocument()
    })
    it('renders title', () => {
      expect(screen.getByText('Title')).toBeInTheDocument()
    })
  })

  describe('renders with change', () => {
    beforeEach(() => {
      setup({
        change: 76,
      })
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
    it('renders change', () => {
      expect(screen.getByText(/76/)).toBeInTheDocument()
    })
    it('renders title', () => {
      expect(screen.getByText('Title')).toBeInTheDocument()
    })
    it('renders code', () => {
      expect(screen.getByText('testcontent')).toBeInTheDocument()
    })
  })

  describe('when the file has 1 flag', () => {
    beforeEach(() => {
      setup({
        flagNames: ['a'],
      })
    })

    it('doesnt render the flag selector', () => {
      expect(
        screen.queryByRole('button', {
          name: /filter by flags/i,
        })
      ).not.toBeInTheDocument()
    })
  })

  describe('when the file has more than one flag', () => {
    beforeEach(() => {
      setup({
        flagNames: ['a', 'b'],
      })
    })

    it('renders the flag selector', () => {
      expect(
        screen.getByRole('button', {
          name: /filter by flags/i,
        })
      ).toBeInTheDocument()
    })
  })

  describe('when selecting flag and its loading', () => {
    beforeEach(() => {
      setup(
        {
          flagNames: ['ui', 'integration'],
        },
        {
          data: {},
          isLoading: true,
        }
      )
      fireEvent.click(
        screen.getByRole('button', {
          name: /filter by flags/i,
        })
      )
      fireEvent.click(
        screen.getByRole('option', {
          name: /integration/i,
        })
      )
    })

    it('renders a loading state', () => {
      expect(screen.getByText(/Spinner/i)).toBeInTheDocument()
    })
  })

  describe('when selecting flag and it has data', () => {
    beforeEach(() => {
      setup(
        {
          flagNames: ['ui', 'integration'],
        },
        {
          data: {
            coverage: {},
            totals: 65,
          },
          isLoading: false,
        }
      )
      fireEvent.click(
        screen.getByRole('button', {
          name: /filter by flags/i,
        })
      )
      fireEvent.click(
        screen.getByRole('option', {
          name: /integration/i,
        })
      )
    })

    it('renders coverage information of the flag', () => {
      expect(screen.getByText(/65\.00%/i)).toBeInTheDocument()
    })
  })
  describe('Handles files with no content provided', () => {
    beforeEach(() => {
      setup(
        { content: null },
        {
          data: {},
          isLoading: false,
        }
      )
    })

    it('renders error message', () => {
      expect(
        screen.getByText(
          /There was a problem getting the source code from your provider. Unable to show line by line coverage./i
        )
      ).toBeInTheDocument()
    })
  })
})
