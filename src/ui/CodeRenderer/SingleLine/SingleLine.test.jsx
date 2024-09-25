import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

import { LINE_TYPE } from 'shared/utils/fileviewer'

import SingleLine from './SingleLine'

const createIdString = ({ path, number }) => `#${path}-L${number}`

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

describe('SingleLine', () => {
  function setup(targeted = false) {
    const user = userEvent.setup()
    const mockHandleClick = vi.fn()

    mocks.useScrollToLine.mockImplementation(() => ({
      lineRef: () => {},
      handleClick: mockHandleClick,
      targeted,
    }))

    return { mockHandleClick, user }
  }

  describe('renders highlighted covered line', () => {
    beforeEach(() => {
      setup()
    })

    it('render covered line', () => {
      render(
        <SingleLine
          line={[
            { types: ['plain'], content: '      ' },
            { types: ['punctuation'], content: '...' },
            { types: ['plain'], content: 'treePaths' },
            { types: ['punctuation'], content: ',' },
            { types: ['plain'], content: '' },
          ]}
          number={1}
          coverage={LINE_TYPE.HIT}
          getTokenProps={() => {}}
          getLineProps={() => {}}
        />,
        { wrapper }
      )

      const linesCovered = screen.getAllByLabelText('covered line of code')
      expect(linesCovered.length).toBe(1)
    })
  })

  describe('renders highlighted uncovered line', () => {
    beforeEach(() => {
      setup()
    })

    it('render uncovered line', () => {
      render(
        <SingleLine
          line={[
            { types: ['plain'], content: '      ' },
            { types: ['punctuation'], content: '...' },
            { types: ['plain'], content: 'treePaths' },
            { types: ['punctuation'], content: ',' },
            { types: ['plain'], content: '' },
          ]}
          number={1}
          coverage={LINE_TYPE.MISS}
          getTokenProps={() => {}}
          getLineProps={() => {}}
        />,
        { wrapper }
      )

      const linesMissed = screen.getAllByLabelText('uncovered line of code')
      expect(linesMissed.length).toBe(1)
    })

    it('render uncovered icon', () => {
      render(
        <SingleLine
          line={[
            { types: ['plain'], content: '      ' },
            { types: ['punctuation'], content: '...' },
            { types: ['plain'], content: 'treePaths' },
            { types: ['punctuation'], content: ',' },
            { types: ['plain'], content: '' },
          ]}
          number={1}
          coverage={LINE_TYPE.MISS}
          getTokenProps={() => {}}
          getLineProps={() => {}}
        />,
        { wrapper }
      )

      const missedIcons = screen.getAllByTestId('exclamationTriangle')
      expect(missedIcons).toHaveLength(1)
    })
  })

  describe('renders highlighted partial line', () => {
    beforeEach(() => {
      setup()
    })

    it('render partial line', () => {
      render(
        <SingleLine
          line={[
            { types: ['plain'], content: '      ' },
            { types: ['punctuation'], content: '...' },
            { types: ['plain'], content: 'treePaths' },
            { types: ['punctuation'], content: ',' },
            { types: ['plain'], content: '' },
          ]}
          number={1}
          coverage={LINE_TYPE.PARTIAL}
          getTokenProps={() => {}}
          getLineProps={() => {}}
        />,
        { wrapper }
      )

      const partialLines = screen.getAllByLabelText('partial line of code')
      expect(partialLines.length).toBe(1)
    })

    it('render partial icon', () => {
      render(
        <SingleLine
          line={[
            { types: ['plain'], content: '      ' },
            { types: ['punctuation'], content: '...' },
            { types: ['plain'], content: 'treePaths' },
            { types: ['punctuation'], content: ',' },
            { types: ['plain'], content: '' },
          ]}
          number={1}
          coverage={LINE_TYPE.PARTIAL}
          getTokenProps={() => {}}
          getLineProps={() => {}}
        />,
        { wrapper }
      )

      const partialIcons = screen.getAllByTestId('partial-icon')
      expect(partialIcons.length).toBe(1)
    })
  })

  describe('user clicks on a number', () => {
    it('calls handle click function', async () => {
      const { mockHandleClick, user } = setup()
      render(
        <SingleLine
          line={[
            { types: ['plain'], content: '      ' },
            { types: ['punctuation'], content: '...' },
            { types: ['plain'], content: 'treePaths' },
            { types: ['punctuation'], content: ',' },
            { types: ['plain'], content: '' },
          ]}
          number={1}
          coverage={LINE_TYPE.HIT}
          getTokenProps={() => {}}
          getLineProps={() => {}}
        />,
        { wrapper }
      )

      const button = screen.getByRole('button')
      await user.click(button)

      expect(mockHandleClick).toHaveBeenCalled()
    })
  })

  describe('line is currently targeted', () => {
    beforeEach(() => {
      setup(true)
    })

    it('sets font to bold', () => {
      render(
        <SingleLine
          line={[
            { types: ['plain'], content: '      ' },
            { types: ['punctuation'], content: '...' },
            { types: ['plain'], content: 'treePaths' },
            { types: ['punctuation'], content: ',' },
            { types: ['plain'], content: '' },
          ]}
          number={1}
          coverage={LINE_TYPE.HIT}
          getTokenProps={() => {}}
          getLineProps={() => {}}
        />,
        { wrapper }
      )

      const linesCovered = screen.getByRole('button', { name: /# 1/ })
      expect(linesCovered).toHaveClass('font-bold')
    })
  })
})
