import { render, screen } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

import { useRegenerateProfilingToken } from 'services/profilingToken'
import { useAddNotification } from 'services/toastNotification'
import { trackSegmentEvent } from 'services/tracking/segment'
import { useUser } from 'services/user'

import ImpactAnalysisToken from './ImpactAnalysisToken'

jest.mock('services/user')
jest.mock('copy-to-clipboard', () => () => true)
jest.mock('services/profilingToken')
jest.mock('services/toastNotification')
jest.mock('services/tracking/segment')

const queryClient = new QueryClient()

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/codecov-client/settings']}>
    <QueryClientProvider client={queryClient}>
      <Route path="/:provider/:owner/:repo/settings">){children}</Route>
    </QueryClientProvider>
  </MemoryRouter>
)

describe('ImpactAnalysisToken', () => {
  function setup(
    { profilingToken = undefined, error = null } = {
      profilingToken: undefined,
      error: null,
    }
  ) {
    const user = userEvent.setup()
    const mutate = jest.fn()
    const addNotification = jest.fn()
    const trackSegmentMock = jest.fn()

    trackSegmentEvent.mockImplementation(trackSegmentMock)
    useAddNotification.mockReturnValue(addNotification)
    useUser.mockReturnValue({
      data: {
        trackingMetadata: {
          ownerid: 1,
        },
      },
    })
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
    return { mutate, addNotification, user, trackSegmentMock }
  }

  describe('renders ImpactAnalysisToken component', () => {
    beforeEach(() => setup())
    it('renders title', () => {
      render(<ImpactAnalysisToken profilingToken="old token" />, { wrapper })

      const title = screen.getByText(/Impact analysis token/)
      expect(title).toBeInTheDocument()
    })
    it('renders body', () => {
      render(<ImpactAnalysisToken profilingToken="old token" />, { wrapper })

      const p = screen.getByText(
        'Token is used for impact analysis feature only'
      )
      expect(p).toBeInTheDocument()
      const badge = screen.getByText('BETA')
      expect(badge).toBeInTheDocument()
    })
    it('renders profiling token', () => {
      render(<ImpactAnalysisToken profilingToken="old token" />, { wrapper })

      const token = screen.getByText(/old token/)
      expect(token).toBeInTheDocument()
    })
    it('renders regenerate button', () => {
      render(<ImpactAnalysisToken profilingToken="old token" />, { wrapper })

      expect(
        screen.getByRole('button', { name: 'Regenerate' })
      ).toBeInTheDocument()
    })
  })

  describe('when the user clicks on regenerate button', () => {
    it('displays the regenerate profiling token modal', async () => {
      const { user } = setup()
      render(<ImpactAnalysisToken profilingToken="old token" />, { wrapper })
      await user.click(screen.getByRole('button', { name: 'Regenerate' }))

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
      it('does not call the mutation', async () => {
        const { user, mutate } = setup()
        render(<ImpactAnalysisToken profilingToken="old token" />, { wrapper })

        await user.click(screen.getByRole('button', { name: 'Regenerate' }))

        expect(mutate).not.toHaveBeenCalled()
      })

      it('renders the old token', () => {
        setup()
        render(<ImpactAnalysisToken profilingToken="old token" />, { wrapper })

        expect(screen.getByText('old token')).toBeInTheDocument()
      })
    })
  })

  describe('when the user clicks on the copy button', () => {
    it('calls the trackSegmentEvent', async () => {
      const { user, trackSegmentMock } = setup()
      render(<ImpactAnalysisToken profilingToken="old token" />, { wrapper })

      await user.click(
        screen.getByRole('button', {
          name: /copy/i,
        })
      )

      expect(trackSegmentMock).toHaveBeenCalledTimes(1)
      expect(trackSegmentMock).toHaveBeenCalledWith({
        event: 'Impact Analysis Profiling Token Copied',
        data: {
          owner_slug: 'codecov',
          repo_slug: 'codecov-client',
          user_ownerid: 1,
          id: 1,
        },
      })
    })
  })

  describe('when user clicks on Generate New Token button', () => {
    it('calls the mutation', async () => {
      const { user, mutate } = setup({ profilingToken: 'new token' })
      render(<ImpactAnalysisToken profilingToken="old token" />, { wrapper })

      const regenerate = screen.getByRole('button', { name: 'Regenerate' })
      await user.click(regenerate)
      const generate = screen.getByRole('button', {
        name: 'Generate New Token',
      })
      await user.click(generate)

      expect(mutate).toHaveBeenCalled()
    })

    it('renders the new token', async () => {
      const { user } = setup({ profilingToken: 'new token' })
      render(<ImpactAnalysisToken profilingToken="old token" />, { wrapper })

      const regenerate = screen.getByRole('button', { name: 'Regenerate' })
      await user.click(regenerate)
      const generate = screen.getByRole('button', {
        name: 'Generate New Token',
      })
      await user.click(generate)

      expect(screen.getByText('new token')).toBeInTheDocument()
    })
  })

  describe('when mutation is not successful', () => {
    it('calls the mutation', async () => {
      const { user, mutate } = setup({
        profilingToken: 'new token',
        error: 'Authentication Error',
      })
      render(<ImpactAnalysisToken profilingToken="old token" />, { wrapper })

      const regenerate = screen.getByRole('button', { name: 'Regenerate' })
      await user.click(regenerate)
      const generate = screen.getByRole('button', {
        name: 'Generate New Token',
      })
      await user.click(generate)

      expect(mutate).toHaveBeenCalled()
    })

    it('adds an error notification', async () => {
      const { user, addNotification } = setup({
        profilingToken: 'new token',
        error: 'Authentication Error',
      })
      render(<ImpactAnalysisToken profilingToken="old token" />, { wrapper })

      const regenerate = screen.getByRole('button', { name: 'Regenerate' })
      await user.click(regenerate)
      const generate = screen.getByRole('button', {
        name: 'Generate New Token',
      })
      await user.click(generate)

      expect(addNotification).toHaveBeenCalledWith({
        type: 'error',
        text: 'Authentication Error',
      })
    })
  })
})
