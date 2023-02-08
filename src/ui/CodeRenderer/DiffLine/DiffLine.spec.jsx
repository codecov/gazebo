import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

import DiffLine from './DiffLine'

import { useScrollToLine } from '../hooks/useScrollToLine'

jest.mock('../hooks/useScrollToLine')

const content = [
  { types: ['plain'], content: '      ' },
  { types: ['punctuation'], content: '...' },
  { types: ['plain'], content: 'treePaths' },
  { types: ['punctuation'], content: ',' },
  { types: ['plain'], content: '' },
]

const createIdString = ({ path, number }) => `#${path}-L${number}`

const wrapper = ({ children }) => (
  <MemoryRouter
    initialEntries={[
      `/gh/codecov/cool-repo/src/file.js${createIdString({
        path: 'src/file.js',
        number: 2,
      })}`,
    ]}
  >
    <Route path="/:provider/:owner/:repo/:path+">
      <table>
        <tbody>{children}</tbody>
      </table>
    </Route>
  </MemoryRouter>
)

describe('DiffLine', () => {
  const mockHandleClick = jest.fn()

  function setup(targeted = false) {
    useScrollToLine.mockImplementation(() => ({
      lineRef: () => {},
      handleClick: mockHandleClick,
      targeted,
    }))
  }

  describe('renders base lines', () => {
    beforeEach(() => {
      setup()
    })

    it('when coverage is null', () => {
      const props = {
        edgeOfFile: false,
        headNumber: '1',
        baseNumber: '1',
        headCoverage: null,
        baseCoverage: null,
      }

      render(
        <DiffLine
          {...props}
          lineContent={content}
          getTokenProps={() => {}}
          getLineProps={() => {}}
        />,
        { wrapper }
      )

      const linesOfCode = screen.getAllByLabelText('line of code')
      expect(linesOfCode.length).toBe(2)
    })
  })

  describe('renders highlighted covered lines', () => {
    beforeEach(() => {
      setup()
    })

    it('render covered lines if there is coverage and showCoverage is true', () => {
      const props = {
        edgeOfFile: false,
        headNumber: '1',
        baseNumber: '1',
        headCoverage: 'H',
        baseCoverage: 'H',
      }

      render(
        <DiffLine
          {...props}
          lineContent={content}
          getTokenProps={() => {}}
          getLineProps={() => {}}
        />,
        { wrapper }
      )

      const coveredLinesOfCode = screen.getAllByLabelText(
        'covered line of code'
      )
      expect(coveredLinesOfCode.length).toBe(2)
    })
  })

  describe('renders highlighted covered line for head', () => {
    beforeEach(() => {
      setup()
    })

    it('render covered lines if there is coverage and showCoverage is true', () => {
      const props = {
        edgeOfFile: false,
        headNumber: '1',
        baseNumber: '1',
        headCoverage: 'H',
        baseCoverage: null,
      }

      render(
        <DiffLine
          {...props}
          lineContent={content}
          getTokenProps={() => {}}
          getLineProps={() => {}}
        />,
        { wrapper }
      )

      const coveredLinesOfCode = screen.getAllByLabelText(
        'covered line of code'
      )
      expect(coveredLinesOfCode.length).toBe(1)
    })
  })

  describe('renders highlighted uncovered lines', () => {
    beforeEach(() => {
      setup()
    })

    it('render uncovered line', () => {
      const props = {
        edgeOfFile: false,
        headNumber: '1',
        baseNumber: '1',
        headCoverage: 'M',
        baseCoverage: 'M',
      }

      render(
        <DiffLine
          {...props}
          lineContent={content}
          getTokenProps={() => {}}
          getLineProps={() => {}}
        />,
        { wrapper }
      )

      const uncoveredLines = screen.getAllByLabelText('uncovered line of code')
      expect(uncoveredLines.length).toBe(2)
    })

    it('render uncovered select icon', () => {
      const props = {
        edgeOfFile: false,
        headNumber: '1',
        baseNumber: '1',
        headCoverage: 'M',
        baseCoverage: 'M',
      }

      render(
        <DiffLine
          {...props}
          lineContent={content}
          getTokenProps={() => {}}
          getLineProps={() => {}}
        />,
        { wrapper }
      )

      const triangles = screen.getAllByText('exclamation-triangle.svg')
      expect(triangles.length).toBe(1)
    })
  })

  describe('renders highlighted uncovered base', () => {
    beforeEach(() => {
      setup()
    })

    it('render uncovered line', () => {
      const props = {
        edgeOfFile: false,
        headNumber: '1',
        baseNumber: '1',
        headCoverage: null,
        baseCoverage: 'M',
      }

      render(
        <DiffLine
          {...props}
          lineContent={content}
          getTokenProps={() => {}}
          getLineProps={() => {}}
        />,
        { wrapper }
      )

      expect(screen.getAllByLabelText('uncovered line of code').length).toBe(1)
    })
  })

  describe('renders highlighted partial lines', () => {
    beforeEach(() => {
      setup()
    })

    it('render partial lines', () => {
      const props = {
        edgeOfFile: false,
        headNumber: '1',
        baseNumber: '1',
        headCoverage: 'P',
        baseCoverage: 'P',
      }

      render(
        <DiffLine
          {...props}
          lineContent={content}
          getTokenProps={() => {}}
          getLineProps={() => {}}
        />,
        { wrapper }
      )

      expect(screen.getAllByLabelText('partial line of code').length).toBe(2)
    })

    it('render partial select icon', () => {
      const props = {
        edgeOfFile: false,
        headNumber: '1',
        baseNumber: '1',
        headCoverage: 'P',
        baseCoverage: 'P',
      }

      render(
        <DiffLine
          {...props}
          lineContent={content}
          getTokenProps={() => {}}
          getLineProps={() => {}}
        />,
        { wrapper }
      )

      expect(screen.getAllByTestId('partial-icon').length).toBe(1)
    })
  })

  describe('detects edge of file', () => {
    beforeEach(() => {
      setup()
    })

    it('render partial line', () => {
      const props = {
        headNumber: '1',
        baseNumber: '1',
        headCoverage: 'P',
        baseCoverage: null,
      }

      const content = [
        { types: ['plain'], content: '' },
        { types: ['punctuation'], content: '+' },
        { types: ['plain'], content: 'treePaths' },
        { types: ['punctuation'], content: ',' },
        { types: ['plain'], content: '' },
      ]

      render(
        <DiffLine
          {...props}
          lineContent={content}
          getTokenProps={() => {}}
          getLineProps={() => {}}
        />,
        { wrapper }
      )

      expect(screen.getByTestId('affected-lines')).toHaveClass(
        'bg-ds-coverage-partial'
      )
    })
  })

  describe('user clicks on a number', () => {
    beforeEach(() => {
      setup(true)
    })

    it('calls handle click function', () => {
      const props = {
        edgeOfFile: false,
        headNumber: '1',
        baseNumber: '2',
        headCoverage: null,
        baseCoverage: null,
      }

      render(
        <DiffLine
          {...props}
          lineContent={content}
          getTokenProps={() => {}}
          getLineProps={() => {}}
        />,
        { wrapper }
      )

      const button = screen.getByRole('button', { name: /# 1/ })
      userEvent.click(button)

      expect(mockHandleClick).toBeCalled()
    })
  })

  describe('line is targeted', () => {
    beforeEach(() => {
      setup(true)
    })

    it('changes the font to bold', () => {
      const props = {
        edgeOfFile: false,
        headNumber: '1',
        baseNumber: '2',
        headCoverage: null,
        baseCoverage: null,
      }

      render(
        <DiffLine
          {...props}
          lineContent={content}
          getTokenProps={() => {}}
          getLineProps={() => {}}
        />,
        { wrapper }
      )

      const button = screen.getByRole('button', { name: /# 1/ })
      expect(button).toHaveClass('font-bold')
    })
  })
})
