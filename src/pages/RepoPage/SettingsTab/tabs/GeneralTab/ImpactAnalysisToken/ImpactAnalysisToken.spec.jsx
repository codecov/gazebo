

import { act, render, screen } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

import { useRegenerateProfilingToken } from 'services/profilingToken'
import { useAddNotification } from 'services/toastNotification'
import * as Segment from 'services/tracking/segment'
import { useUser } from 'services/user'

import ImpactAnalysisToken from './ImpactAnalysisToken'

const trackSegmentSpy = jest.spyOn(Segment, 'trackSegmentEvent')

jest.mock('services/user')
jest.mock('copy-to-clipboard', () => () => true)
jest.mock('services/profilingToken')
jest.mock('services/toastNotification')

const queryClient = new QueryClient()

describe('ImpactAnalysisToken', () => {
  const mutate = jest.fn()
  const addNotification = jest.fn()

  function setup({ profilingToken = undefined, error = null }) {
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

  describe('when the user clicks on the copy button', () => {
    beforeEach(() => {
      setup({})
      userEvent.click(
        screen.getByRole('button', {
          name: /copy/i,
        })
      )
    })

    it('calls the trackSegmentEvent', () => {
      expect(trackSegmentSpy).toHaveBeenCalledTimes(1)
      expect(trackSegmentSpy).toHaveBeenCalledWith({
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
    beforeEach(async () => {
      setup({ profilingToken: 'new token' })
      await act(async () => {
        await screen.getByRole('button', { name: 'Regenerate' }).click()
        screen.getByRole('button', { name: 'Generate New Token' }).click()
      })
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
      await act(async () => {
        await screen.getByRole('button', { name: 'Regenerate' }).click()
        screen.getByRole('button', { name: 'Generate New Token' }).click()
      })
    })

    it('calls the mutation', async () => {
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
