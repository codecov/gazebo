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
      const tab = screen.getByText(/YAML/)
      expect(tab).toBeInTheDocument()
    })
  })
})
