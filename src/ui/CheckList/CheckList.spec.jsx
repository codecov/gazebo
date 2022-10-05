import { render, screen } from '@testing-library/react'

import CheckList from '.'

describe('CheckList', () => {
  function setup(props = {}) {
    render(<CheckList {...props} />)
  }

  describe('Renders a list', () => {
    beforeEach(() => {
      setup({
        list: ['a', 'b', 'c'],
      })
    })

    it('renders a list', () => {
      expect(screen.queryAllByRole('listitem')[0]).toHaveTextContent('a')
      expect(screen.queryAllByRole('listitem')[1]).toHaveTextContent('b')
      expect(screen.queryAllByRole('listitem')[2]).toHaveTextContent('c')
    })
  })
})
