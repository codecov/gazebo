import { render, screen } from '@testing-library/react'

import YAML from './YAML'

describe('YAMLTab', () => {
  function setup(url) {
    render(<YAML />)
  }

  describe('when rendering on base url', () => {
    beforeEach(() => {
      setup('/')
    })

    it('renders something', () => {
      const tab = screen.getByText(
        /Changes made to the Global yml will override the default repo settings and is applied to all repositories in the org./
      )
      expect(tab).toBeInTheDocument()
    })
  })
})
