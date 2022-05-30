import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { MemoryRouter, Route } from 'react-router-dom'

import { useRepo, useUpdateRepo } from 'services/repo'

import GeneralTab from './GeneralTab'

jest.mock('services/repo')
const queryClient = new QueryClient()

describe('GeneralTab', () => {
  const mutate = jest.fn()

  function setup({ uploadToken, defaultBranch }) {
    useRepo.mockReturnValue({
      data: {
        repository: { uploadToken, defaultBranch },
      },
    })
    useUpdateRepo.mockReturnValue({
      mutate,
      data: { branch: 'random' },
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
})
