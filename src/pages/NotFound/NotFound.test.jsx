import { render, screen } from '@testing-library/react'

import config from 'config'

import NotFound from './NotFound'

vi.mock('config')

describe('NotFound', () => {
  function setup(ToRender, isSelfHosted = false) {
    config.IS_SELF_HOSTED = isSelfHosted
    render(<NotFound />)
  }

  describe('when not running in self-hosted mode', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the children', () => {
      expect(screen.getByText(/Codecov’s home page/)).toBeInTheDocument()
    })
  })

  describe('when running in self-hosted mode', () => {
    beforeEach(() => {
      setup(null, true)
    })

    it('renders the children', () => {
      expect(screen.getByText(/the home page/)).toBeInTheDocument()
    })
  })
})
