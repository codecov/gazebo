import { render, screen } from 'custom-testing-library'

import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from 'react-query'
import { MemoryRouter, Route } from 'react-router-dom'

import { useRegenerateProfilingToken } from 'services/profilingToken'
import { useAddNotification } from 'services/toastNotification'

import ImpactAnalysisToken from './ImpactAnalysisToken'

jest.mock('services/profilingToken')
jest.mock('services/toastNotification')

const queryClient = new QueryClient()

describe('ImpactAnalysisToken', () => {
  const mutate = jest.fn()
  const addNotification = jest.fn()

  function setup({ profilingToken = undefined, error = null }) {
    useAddNotification.mockReturnValue(addNotification)
    useRegenerateProfilingToken.mockReturnValue({
      isLoading: false,
      mutate,
      data: {
        data: {
          regenerateProfilingToken: {
            profilingToken,
            error,
          },
        },
      },
    })

    render(
      <MemoryRouter initialEntries={['/gh/codecov/codecov-client/settings']}>
        <QueryClientProvider client={queryClient}>
          <Route path="/:provider/:owner/:repo/settings">
            <ImpactAnalysisToken profilingToken="old token" />
          </Route>
        </QueryClientProvider>
      </MemoryRouter>
    )
  }

  describe('renders ImpactAnalysisToken componenet', () => {
    beforeEach(() => {
      setup({})
    })
    it('renders title', () => {
      const title = screen.getByText(/Impact analysis token/)
      expect(title).toBeInTheDocument()
    })
    it('renders body', () => {
      const p = screen.getByText(
        'Token is used for impact analysis feature only'
      )
      expect(p).toBeInTheDocument()
      const badge = screen.getByText('BETA')
      expect(badge).toBeInTheDocument()
    })
    it('renders profiling token', () => {
      const token = screen.getByText(/old token/)
      expect(token).toBeInTheDocument()
    })

    it('renders regenerate button', () => {
      expect(
        screen.getByRole('button', { name: 'Regenerate' })
      ).toBeInTheDocument()
    })
  })

  describe('when the user clicks on regenerate button', () => {
    beforeEach(() => {
      setup({})
      userEvent.click(screen.getByRole('button', { name: 'Regenerate' }))
    })

    it('displays the regenerate profiling token modal', () => {
      expect(screen.getByText('New impact analysis token')).toBeInTheDocument()
      expect(
        screen.getByText(
          'If you save the new token, make sure to update your CI yml'
        )
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Generate New Token' })
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    })

    describe('when user clicks on Cancel button', () => {
      beforeEach(() => {
        userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
      })
      it('does not call the mutation', () => {
        expect(mutate).not.toHaveBeenCalled()
      })

      it('renders the old token', () => {
        expect(screen.getByText('old token')).toBeInTheDocument()
      })
    })
  })

  describe('when user clicks on Generate New Token button', () => {
    beforeEach(async () => {
      setup({ profilingToken: 'new token' })
      userEvent.click(screen.getByRole('button', { name: 'Regenerate' }))
      userEvent.click(
        screen.getByRole('button', { name: 'Generate New Token' })
      )
    })
    it('calls the mutation', () => {
      expect(mutate).toHaveBeenCalled()
    })

    it('renders the new token', () => {
      expect(screen.getByText('new token')).toBeInTheDocument()
    })
  })

  describe('when mutation is not successful', () => {
    beforeEach(async () => {
      setup({ profilingToken: 'new token', error: 'Authentication Error' })
      await userEvent.click(screen.getByRole('button', { name: 'Regenerate' }))
      userEvent.click(
        screen.getByRole('button', { name: 'Generate New Token' })
      )
    })
    it('calls the mutation', () => {
      expect(mutate).toHaveBeenCalled()
    })

    it('adds an error notification', () => {
      expect(addNotification).toHaveBeenCalledWith({
        type: 'error',
        text: 'Authentication Error',
      })
    })
  })
})
