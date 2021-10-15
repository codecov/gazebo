import { render, screen } from '@testing-library/react'
import { Route, MemoryRouter } from 'react-router-dom'
import Overview from '.'

jest.mock('services/repo/hooks')

describe('Overview Page', () => {
  function setup(data) {
    render(
      <MemoryRouter initialEntries={['/gh/codecov/Test/new']}>
        <Route path="/:provider/:owner/:repo/new">
          <Overview {...data} />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when rendered with token and repo is private', () => {
    beforeEach(() => {
      setup({ data: { repo: { uploadToken: 'randomToken', private: true } } })
    })

    it('renders Step1', () => {
      const step = screen.getByText(/Step 1/)
      expect(step).toBeInTheDocument()
    })

    it('renders Step2', () => {
      const step = screen.getByText(/Step 2/)
      expect(step).toBeInTheDocument()
    })

    it('renders the passed token', () => {
      const token = screen.getByText(/randomToken/)
      expect(token).toBeInTheDocument()
    })
  })

  describe('when rendered with token and repo is public and user is part of org', () => {
    beforeEach(() => {
      setup({
        data: {
          repo: { uploadToken: 'randomToken', private: false },
          isPartOfOrg: true,
        },
      })
    })

    it('renders Step1', () => {
      const step = screen.getByText(/Step 1/)
      expect(step).toBeInTheDocument()
    })

    it('renders Step2', () => {
      const step = screen.getByText(/Step 2/)
      expect(step).toBeInTheDocument()
    })

    it('renders the passed token', () => {
      const token = screen.getByText(/randomToken/)
      expect(token).toBeInTheDocument()
    })
  })

  describe('when rendered with public repo and user is not a part of the org', () => {
    beforeEach(() => {
      setup({
        data: {
          repo: { uploadToken: 'randomToken', private: false },
          isPartOfOrg: false,
        },
      })
    })

    it('renders Step1', () => {
      const step = screen.queryByText(/Step 1/)
      expect(step).toBeInTheDocument()
    })

    it('renders Step2', () => {
      const step = screen.getByText(/Step 2/)
      expect(step).toBeInTheDocument()
    })

    it('does not render the token', () => {
      const token = screen.queryByText(/randomToken/)
      expect(token).not.toBeInTheDocument()
    })
  })

  describe('when rendered with no data', () => {
    beforeEach(() => {
      setup()
    })

    it('does not render Steps', () => {
      const step = screen.queryByText(/Step 1/)
      expect(step).not.toBeInTheDocument()
    })
  })
})
