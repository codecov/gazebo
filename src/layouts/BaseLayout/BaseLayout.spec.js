import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import BaseLayout from './BaseLayout'

jest.mock('layouts/Header/ServerStatus.js', () => () => 'ServerStatus')
jest.mock('services/user', () => ({
  useUser: () => ({ data: null }),
}))

describe('BaseLayout', () => {
  function setup(props) {
    render(<BaseLayout {...props} />, {
      wrapper: MemoryRouter,
    })
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup({
        children: 'hello',
      })
    })

    it('renders the children', () => {
      expect(screen.getByText(/hello/)).toBeInTheDocument()
    })
  })
})
