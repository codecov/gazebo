import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { MemoryRouter, Route } from 'react-router-dom'

import { useRepo } from 'services/repo'

import GeneralTab from './GeneralTab'

jest.mock('services/repo')
const queryClient = new QueryClient()

describe('GeneralTab', () => {
  function setup({ uploadToken, defaultBranch, profilingToken, graphToken }) {
    useRepo.mockReturnValue({
      data: {
        repository: { uploadToken, defaultBranch, profilingToken, graphToken },
      },
    })

    render(
      <MemoryRouter initialEntries={['/gh/codecov/codecov-client/settings']}>
        <QueryClientProvider client={queryClient}>
          <Route path="/:provider/:owner/:repo/settings">
            <GeneralTab />
          </Route>
        </QueryClientProvider>
      </MemoryRouter>
    )
  }

  describe('when rendered with uploadToken', () => {
    beforeEach(() => {
      setup({ uploadToken: 'random' })
    })

    it('renders Repository upload token compoenent', () => {
      const title = screen.getByText(/Repository upload token/)
      expect(title).toBeInTheDocument()
    })

    it('renders the expected token', () => {
      const token = screen.getByText(/CODECOV_TOKEN=random/)
      expect(token).toBeInTheDocument()
    })
  })

  describe('when rendered with no uploadToken', () => {
    beforeEach(() => {
      setup({ uploadToken: null })
    })

    it('does not render Repository upload token compoenent', () => {
      const title = screen.queryByText(/Repository upload token/)
      expect(title).not.toBeInTheDocument()
    })
  })

  describe('when rendered with defaultBranch', () => {
    beforeEach(() => {
      setup({ defaultBranch: 'master' })
    })

    it('renders Default Branch compoenent', () => {
      const title = screen.getByText(/Default Branch/)
      expect(title).toBeInTheDocument()
    })
  })

  describe('when rendered with no defaultBranch', () => {
    beforeEach(() => {
      setup({ defaultBranch: null })
    })

    it('does not render  Default Branch compoenent', () => {
      const title = screen.queryByText(/Default Branch/)
      expect(title).not.toBeInTheDocument()
    })
  })

  describe('when rendered with profilingToken', () => {
    beforeEach(() => {
      setup({ profilingToken: 'profiling' })
    })

    it('renders imapact anaylsis compoenent', () => {
      const title = screen.getByText(/Impact analysis token/)
      expect(title).toBeInTheDocument()
    })

    it('renders the expected token', () => {
      const token = screen.getByText(/profiling/)
      expect(token).toBeInTheDocument()
    })
  })

  describe('when rendered with no profilingToken', () => {
    beforeEach(() => {
      setup({ profilingToken: null })
    })

    it('does not render  Default Branch compoenent', () => {
      const title = screen.queryByText(/Impact analysis token/)
      expect(title).not.toBeInTheDocument()
    })
  })

  describe('when rendered with graphToken', () => {
    beforeEach(() => {
      setup({ graphToken: 'random graph token' })
    })

    it('renders graphing token compoenent', () => {
      const title = screen.getByText(/Repository graphing token/)
      expect(title).toBeInTheDocument()
    })

    it('renders the expected token', () => {
      const token = screen.getByText(/random graph token/)
      expect(token).toBeInTheDocument()
    })
  })

  describe('when rendered with no graphToken', () => {
    beforeEach(() => {
      setup({ graphToken: null })
    })

    it('does not render graphing token compoenent', () => {
      const title = screen.queryByText(/Repository graphing token/)
      expect(title).not.toBeInTheDocument()
    })
  })
})
