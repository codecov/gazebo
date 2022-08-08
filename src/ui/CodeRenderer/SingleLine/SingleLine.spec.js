import { render, screen } from '@testing-library/react'

import { LINE_TYPE } from 'shared/utils/fileviewer'

import SingleLine from './SingleLine'

describe('SingleLine', () => {
  const line = [
    { types: ['plain'], content: '      ' },
    { types: ['punctuation'], content: '...' },
    { types: ['plain'], content: 'treePaths' },
    { types: ['punctuation'], content: ',' },
    { types: ['plain'], content: '' },
  ]

  function setup(number, coverage) {
    render(
      <table>
        <tbody>
          <SingleLine
            line={line}
            number={number}
            coverage={coverage}
            getTokenProps={() => {}}
            getLineProps={() => {}}
          />
        </tbody>
      </table>
    )
  }

  describe('renders highlighted covered line', () => {
    beforeEach(() => {
      setup(1, LINE_TYPE.HIT)
    })

    it('render covered line', () => {
      expect(screen.getAllByLabelText('covered line of code').length).toBe(1)
    })
  })
})
