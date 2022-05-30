import { act, render, screen } from 'custom-testing-library'

import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

import { useAddNotification } from 'services/toastNotification'
import { useRegenerateUploadToken } from 'services/uploadToken'

import RepoUploadToken from './RepoUploadToken'

jest.mock('services/uploadToken')
jest.mock('services/toastNotification')

describe('RepoUploadToken', () => {
  const mutate = jest.fn()
  const addNotification = jest.fn()

  function setup(uploadToken = undefined) {
    useAddNotification.mockReturnValue(addNotification)
    useRegenerateUploadToken.mockReturnValue({
      isLoading: false,
      mutate,
      data: { uploadToken },
    })

    render(
      <MemoryRouter initialEntries={['/gh/codecov/codecov-client/settings']}>
        <Route path="/:provider/:owner/:repo/settings">
          <RepoUploadToken uploadToken="old token" />
        </Route>
      </MemoryRouter>
    )
  }

  describe('renders RepoUploadToken componenet', () => {
    beforeEach(() => {
      setup()
    })
    it('renders title', () => {
      const title = screen.getByText(/Repository upload token/)
      expect(title).toBeInTheDocument()
    })
    it('renders body', () => {
      const p = screen.getByText('Token is used for uploading coverage reports')
      expect(p).toBeInTheDocument()
      const note = screen.getByText('Note:')
      expect(note).toBeInTheDocument()
      expect(
        screen.getByText(
          'If you’d like to add the token directly to your CI/CD Environment:'
        )
      ).toBeInTheDocument()
    })
    it('renders two formats of token', () => {
      const firstFormat = screen.getByText(/CODECOV_TOKEN=old token/)
      expect(firstFormat).toBeInTheDocument()
      const secondFormat = screen.getByText(/token: old token/)
      expect(secondFormat).toBeInTheDocument()
    })

    it('renders regenerate button', () => {
      expect(
        screen.getByRole('button', { name: 'Regenerate' })
      ).toBeInTheDocument()
    })
  })

  describe('when the user clicks on regenerate button', () => {
    beforeEach(() => {
      setup()
      act(() =>
        userEvent.click(screen.getByRole('button', { name: 'Regenerate' }))
      )
    })

    it('displays the regenerate upload token modal', () => {
      expect(screen.getByText('New upload token')).toBeInTheDocument()
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
        act(() =>
          userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
        )
      })
      it('does not call the mutation', () => {
        expect(mutate).not.toHaveBeenCalled()
      })

      it('renders the old token', () => {
        expect(screen.getByText('CODECOV_TOKEN=old token')).toBeInTheDocument()
      })
    })
  })

  describe('when user clicks on Generate New Token button', () => {
    beforeEach(async () => {
      setup('new token')
      await act(async () => {
        await userEvent.click(
          screen.getByRole('button', { name: 'Regenerate' })
        )
        userEvent.click(
          screen.getByRole('button', { name: 'Generate New Token' })
        )
      })
    })
    it('calls the mutation', () => {
      expect(mutate).toHaveBeenCalled()
    })

    it('renders the new token', () => {
      expect(screen.getByText('CODECOV_TOKEN=new token')).toBeInTheDocument()
    })
  })

  describe('when mutation is not successful', () => {
    beforeEach(async () => {
      setup('new token')
      await act(async () => {
        await userEvent.click(
          screen.getByRole('button', { name: 'Regenerate' })
        )
        userEvent.click(
          screen.getByRole('button', { name: 'Generate New Token' })
        )
        mutate.mock.calls[0][1].onError()
      })
    })
    it('calls the mutation', () => {
      expect(mutate).toHaveBeenCalled()
    })

    it('adds an error notification', () => {
      expect(addNotification).toHaveBeenCalledWith({
        type: 'error',
        text: 'Something went wrong',
      })
    })
  })
})
