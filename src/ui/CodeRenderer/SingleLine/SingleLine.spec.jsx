import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { LINE_TYPE } from 'shared/utils/fileviewer'

import SingleLine from './SingleLine'

jest.mock('react', () => {
  return {
    ...jest.requireActual('react'),
    useRef: jest.fn(),
  }
})

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

describe('SingleLine', () => {
  const line = [
    { types: ['plain'], content: '      ' },
    { types: ['punctuation'], content: '...' },
    { types: ['plain'], content: 'treePaths' },
    { types: ['punctuation'], content: ',' },
    { types: ['plain'], content: '' },
  ]

  describe('renders highlighted covered line', () => {
    it('render covered line', () => {
      render(
        <SingleLine
          line={line}
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
    it('render uncovered line', () => {
      render(
        <SingleLine
          line={line}
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
          line={line}
          number={1}
          coverage={LINE_TYPE.MISS}
          getTokenProps={() => {}}
          getLineProps={() => {}}
        />,
        { wrapper }
      )

      const missedIcons = screen.getAllByText('exclamation-triangle.svg')
      expect(missedIcons.length).toBe(1)
    })
  })

  describe('renders highlighted partial line', () => {
    it('render partial line', () => {
      render(
        <SingleLine
          line={line}
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
          line={line}
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
    it('changes the background color', () => {
      render(
        <SingleLine
          line={line}
          number={1}
          coverage={LINE_TYPE.HIT}
          getTokenProps={() => {}}
          getLineProps={() => {}}
        />,
        { wrapper }
      )

      const button = screen.getByRole('button')
      userEvent.click(button)

      const linesCovered = screen.getByRole('button', { name: /# 1/ })
      expect(linesCovered).toHaveClass('font-bold')
    })
  })
})
