import { render, screen } from '@testing-library/react'

import config from 'config'

import NotFound from './NotFound'

jest.mock('config')

describe('NotFound', () => {
  function setup(ToRender, isEnterprise = false) {
    config.IS_ENTERPRISE = isEnterprise
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
