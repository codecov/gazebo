import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

import DiffLine from './DiffLine'

const mocks = vi.hoisted(() => ({
  useScrollToLine: vi.fn(),
}))

vi.mock('../hooks/useScrollToLine', async () => {
  const original = await vi.importActual('../hooks/useScrollToLine')

  return {
    ...original,
    useScrollToLine: mocks.useScrollToLine,
  }
})

const content = [
  { types: ['plain'], content: '      ' },
  { types: ['punctuation'], content: '...' },
  { types: ['plain'], content: 'treePaths' },
  { types: ['punctuation'], content: ',' },
  { types: ['plain'], content: '' },
]

const createIdString = ({ path, number }: { path: string; number: number }) =>
  `#${path}-L${number}`

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
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
  function setup(targeted = false) {
    const mockHandleClick = vi.fn()
    mocks.useScrollToLine.mockImplementation(() => ({
      lineRef: () => {},
      handleClick: mockHandleClick,
      targeted,
    }))

    return { mockHandleClick }
  }

  describe('renders base lines', () => {
    beforeEach(() => {
      setup()
    })

    it('when coverage is null', () => {
      render(
        <DiffLine
          headNumber="1"
          baseNumber="1"
          headCoverage={null}
          baseCoverage={null}
          hitCount={null}
          lineContent={content}
          getTokenProps={({ token, key }) => ({})}
        />,
        { wrapper }
      )

      const linesOfCode = screen.getAllByLabelText('line of code')
      expect(linesOfCode.length).toBe(2)
    })
  })

  describe('rendering highlighted covered lines', () => {
    beforeEach(() => {
      setup()
    })

    it('render covered lines if there is coverage and showCoverage is true', () => {
      render(
        <DiffLine
          headNumber="1"
          baseNumber="1"
          headCoverage="H"
          baseCoverage="H"
          hitCount={null}
          lineContent={content}
          getTokenProps={({ token, key }) => ({})}
        />,
        { wrapper }
      )

      const coveredLinesOfCode = screen.getAllByLabelText(
        'covered line of code'
      )
      expect(coveredLinesOfCode.length).toBe(2)
    })

    it('renders hit counter when hit count is passed', () => {
      render(
        <DiffLine
          headNumber="1"
          baseNumber="1"
          headCoverage="H"
          baseCoverage="H"
          hitCount={18}
          lineContent={content}
          getTokenProps={({ token, key }) => ({})}
        />,
        { wrapper }
      )

      const hitCounter = screen.getByText('18')
      expect(hitCounter).toBeInTheDocument()
    })
  })

  describe('rendering highlighted covered line for head', () => {
    beforeEach(() => {
      setup()
    })

    it('renders covered lines if there is coverage and showCoverage is true', () => {
      render(
        <DiffLine
          headNumber="1"
          baseNumber="1"
          headCoverage="H"
          baseCoverage={null}
          hitCount={null}
          lineContent={content}
          getTokenProps={({ token, key }) => ({})}
        />,
        { wrapper }
      )

      const coveredLinesOfCode = screen.getAllByLabelText(
        'covered line of code'
      )
      expect(coveredLinesOfCode.length).toBe(1)
    })

    it('renders hit counter when hit count is passed', () => {
      render(
        <DiffLine
          headNumber="1"
          baseNumber="1"
          headCoverage="H"
          baseCoverage={null}
          hitCount={18}
          lineContent={content}
          getTokenProps={({ token, key }) => ({})}
        />,
        { wrapper }
      )

      const hitCounter = screen.getByText('18')
      expect(hitCounter).toBeInTheDocument()
    })
  })

  describe('rendering highlighted uncovered lines', () => {
    beforeEach(() => {
      setup()
    })

    it('render uncovered line', () => {
      render(
        <DiffLine
          headNumber="1"
          baseNumber="1"
          headCoverage="M"
          baseCoverage="M"
          hitCount={null}
          lineContent={content}
          getTokenProps={({ token, key }) => ({})}
        />,
        { wrapper }
      )

      const uncoveredLines = screen.getAllByLabelText('uncovered line of code')
      expect(uncoveredLines.length).toBe(2)
    })

    it('render uncovered select icon', () => {
      render(
        <DiffLine
          headNumber="1"
          baseNumber="1"
          headCoverage="M"
          baseCoverage="M"
          hitCount={null}
          lineContent={content}
          getTokenProps={({ token, key }) => ({})}
        />,
        { wrapper }
      )

      const triangles = screen.getAllByTestId('exclamationTriangle')
      expect(triangles).toHaveLength(1)
    })

    it('renders hit counter when hit count is passed', () => {
      render(
        <DiffLine
          headNumber="1"
          baseNumber="1"
          headCoverage="M"
          baseCoverage="M"
          hitCount={18}
          lineContent={content}
          getTokenProps={({ token, key }) => ({})}
        />,
        { wrapper }
      )

      const hitCounter = screen.getByText('18')
      expect(hitCounter).toBeInTheDocument()
    })
  })

  describe('rendering highlighted uncovered base', () => {
    beforeEach(() => {
      setup()
    })

    it('renders uncovered line', () => {
      render(
        <DiffLine
          headNumber="1"
          baseNumber="1"
          headCoverage={null}
          baseCoverage="M"
          hitCount={null}
          lineContent={content}
          getTokenProps={({ token, key }) => ({})}
        />,
        { wrapper }
      )

      expect(screen.getAllByLabelText('uncovered line of code').length).toBe(1)
    })

    it('does not render hit counter when hit count is passed', () => {
      render(
        <DiffLine
          headNumber="1"
          baseNumber="1"
          headCoverage={null}
          baseCoverage="M"
          hitCount={18}
          lineContent={content}
          getTokenProps={({ token, key }) => ({})}
        />,
        { wrapper }
      )

      const hitCounter = screen.queryByText('18')
      expect(hitCounter).not.toBeInTheDocument()
    })
  })

  describe('rendering highlighted partial lines', () => {
    beforeEach(() => {
      setup()
    })

    it('render partial lines', () => {
      render(
        <DiffLine
          headNumber="1"
          baseNumber="1"
          headCoverage="P"
          baseCoverage="P"
          hitCount={null}
          lineContent={content}
          getTokenProps={({ token, key }) => ({})}
        />,
        { wrapper }
      )

      expect(screen.getAllByLabelText('partial line of code').length).toBe(2)
    })

    it('render partial select icon', () => {
      render(
        <DiffLine
          headNumber="1"
          baseNumber="1"
          headCoverage="P"
          baseCoverage="P"
          hitCount={null}
          lineContent={content}
          getTokenProps={({ token, key }) => ({})}
        />,
        { wrapper }
      )

      expect(screen.getAllByTestId('partial-icon').length).toBe(1)
    })

    it('renders hit counter when hit count is passed', () => {
      render(
        <DiffLine
          headNumber="1"
          baseNumber="1"
          headCoverage="P"
          baseCoverage="P"
          hitCount={18}
          lineContent={content}
          getTokenProps={({ token, key }) => ({})}
        />,
        { wrapper }
      )

      const hitCounter = screen.getByText('18')
      expect(hitCounter).toBeInTheDocument()
    })
  })

  describe('detects edge of file', () => {
    beforeEach(() => {
      setup()
    })

    it('render partial line', () => {
      const content = [
        { types: ['plain'], content: '' },
        { types: ['punctuation'], content: '+' },
        { types: ['plain'], content: 'treePaths' },
        { types: ['punctuation'], content: ',' },
        { types: ['plain'], content: '' },
      ]

      render(
        <DiffLine
          headNumber="1"
          baseNumber="1"
          headCoverage="P"
          baseCoverage={null}
          hitCount={null}
          lineContent={content}
          getTokenProps={({ token, key }) => ({})}
        />,
        { wrapper }
      )

      expect(screen.getByTestId('affected-lines')).toHaveClass(
        'bg-ds-coverage-partial'
      )
    })
  })

  describe('user clicks on a number', () => {
    it('calls handle click function', async () => {
      const { mockHandleClick } = setup(true)
      const user = userEvent.setup()

      render(
        <DiffLine
          headNumber="1"
          baseNumber="2"
          headCoverage={null}
          baseCoverage={null}
          hitCount={null}
          lineContent={content}
          getTokenProps={({ token, key }) => ({})}
        />,
        { wrapper }
      )

      const button = screen.getByRole('button', { name: /# 1/ })
      await user.click(button)

      expect(mockHandleClick).toHaveBeenCalled()
    })
  })

  describe('line is targeted', () => {
    beforeEach(() => {
      setup(true)
    })

    it('changes the font to bold', () => {
      render(
        <DiffLine
          headNumber="1"
          baseNumber="2"
          headCoverage={null}
          baseCoverage={null}
          hitCount={null}
          lineContent={content}
          getTokenProps={({ token, key }) => ({})}
        />,
        { wrapper }
      )

      const button = screen.getByRole('button', { name: /# 1/ })
      expect(button).toHaveClass('font-bold')
    })
  })
})
