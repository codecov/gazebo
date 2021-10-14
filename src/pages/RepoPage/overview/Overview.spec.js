import { render, screen } from '@testing-library/react'
import { Route, MemoryRouter } from 'react-router-dom'
import Overview from '.'

jest.mock('services/repo/hooks')

describe('Overview Page', () => {
  function setup(token) {
    render(
      <MemoryRouter initialEntries={['/gh/codecov/Test']}>
        <Route path="/:provider/:owner/:repo">
          <Overview token={token} />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when rendered with token', () => {
    beforeEach(() => {
      setup('randomToken')
    })

    it('renders Step1', () => {
      const step = screen.getByText(/Step 1/)
      expect(step).toBeInTheDocument()
    })

    it('renders Step2', () => {
      const step = screen.getByText(/Step 2/)
      expect(step).toBeInTheDocument()
    })

    it('renders Step3', () => {
      const step = screen.getByText(/Step 3/)
      expect(step).toBeInTheDocument()
    })

    it('renders the passed token', () => {
      const token = screen.getByText(/randomToken/)
      expect(token).toBeInTheDocument()
    })
  })

  describe('when rendered with no token', () => {
    beforeEach(() => {
      setup(undefined)
    })

    it('renders Step1', () => {
      const step = screen.queryByText(/Step 1/)
      expect(step).not.toBeInTheDocument()
    })

    it('renders spinner', () => {
      expect(screen.getByTestId('spinner')).toBeInTheDocument()
    })
  })
})
