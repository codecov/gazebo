import { render, screen } from 'custom-testing-library'

import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

import { useRegenerateUploadToken } from 'services/uploadToken'

import RepoUploadToken from './RepoUploadToken'

jest.mock('services/uploadToken')

describe('RepoUploadToken', () => {
  const mutate = jest.fn()

  function setup(uploadToken = undefined) {
    useRegenerateUploadToken.mockReturnValue({
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
      userEvent.click(screen.getByRole('button', { name: 'Regenerate' }))
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
        userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
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
    beforeEach(() => {
      setup('new token')
      userEvent.click(screen.getByRole('button', { name: 'Regenerate' }))
    })
    it('calls the mutation', () => {
      userEvent.click(
        screen.getByRole('button', { name: 'Generate New Token' })
      )
      expect(mutate).toHaveBeenCalled()
    })

    it('renders the new token', () => {
      expect(screen.getByText('CODECOV_TOKEN=new token')).toBeInTheDocument()
    })
  })
})
