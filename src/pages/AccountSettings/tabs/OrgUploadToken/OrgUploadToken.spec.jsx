import { render, screen } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route } from 'react-router-dom'

import { useRegenerateOrgUploadToken } from 'services/orgUploadToken'
import { useAddNotification } from 'services/toastNotification'
import { useIsCurrentUserAnAdmin, useOwner } from 'services/user'

import OrgUploadToken from './OrgUploadToken'

jest.mock('services/user')
jest.mock('services/toastNotification')
jest.mock('services/orgUploadToken')
jest.mock('services/toastNotification')

const queryClient = new QueryClient()

describe('OrgUploadToken', () => {
  const mutate = jest.fn()
  const addNotification = jest.fn()

  function setup({ orgUploadToken = undefined, error = null, isAdmin = true }) {
    useIsCurrentUserAnAdmin.mockReturnValue(isAdmin)
    useOwner.mockReturnValue({ data: { orgUploadToken } })
    useAddNotification.mockReturnValue(addNotification)
    useRegenerateOrgUploadToken.mockReturnValue({
      isLoading: false,
      mutate,
      data: {
        data: {
          regenerateOrgUploadToken: {
            orgUploadToken,
            error,
          },
        },
      },
    })

    render(
      <MemoryRouter initialEntries={['/account/gh/codecov/orgUploadToken']}>
        <QueryClientProvider client={queryClient}>
          <Route path="/account/:provider/:owner/orgUploadToken">
            <OrgUploadToken />
          </Route>
        </QueryClientProvider>
      </MemoryRouter>
    )
  }

  describe('Renders OrgUploadToken componenet', () => {
    beforeEach(() => {
      setup({})
    })
    it('renders title', () => {
      const title = screen.getByText(/Global repository upload token/)
      expect(title).toBeInTheDocument()
    })
    it('renders body', () => {
      const p = screen.getByText(/Sensitive credential/)
      expect(p).toBeInTheDocument()
    })

    it('renders generate token', () => {
      const title = screen.getByText(
        /Generating a global token allows you to apply the same upload token to/
      )
      expect(title).toBeInTheDocument()
    })

    it('renders generate button', () => {
      expect(
        screen.getByRole('button', { name: 'Generate' })
      ).toBeInTheDocument()
    })
  })

  describe('When user clicks on Generate button', () => {
    beforeEach(() => {
      setup({})
      screen.getByRole('button', { name: 'Generate' }).click()
    })
    it('calls the mutation', () => {
      expect(mutate).toHaveBeenCalled()
    })
  })

  describe('When mutation is not successful', () => {
    beforeEach(async () => {
      setup({ orgUploadToken: '', error: 'Authentication Error' })
      screen.getByRole('button', { name: 'Generate' }).click()
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

  describe('When already has an orgUploadToken', () => {
    beforeEach(async () => {
      setup({ orgUploadToken: 'token' })
      await screen.getByRole('button', { name: 'Regenerate' }).click()
      screen.getByRole('button', { name: 'Save New Token' }).click()
    })

    it('calls the mutation', async () => {
      expect(mutate).toHaveBeenCalled()
    })

    it('adds a success notification', () => {
      expect(addNotification).toHaveBeenCalledWith({
        type: 'success',
        text: 'Global repository upload token generated.',
      })
    })

    it('displays the new token -encoded-', () => {
      expect(screen.getByText('CODECOV_TOKEN=xxxxxx')).toBeInTheDocument()
    })
  })

  describe('When click on cancel', () => {
    beforeEach(async () => {
      setup({ orgUploadToken: 'token' })
      await screen.getByRole('button', { name: 'Regenerate' }).click()
      screen.getByRole('button', { name: 'Cancel' }).click()
    })

    it('does not call the mutation', async () => {
      expect(mutate).not.toHaveBeenCalled()
    })
  })

  describe('Toggle token', () => {
    beforeEach(async () => {
      setup({ orgUploadToken: 'token' })
    })

    it('displays the new token -encoded-', () => {
      expect(screen.getByText('CODECOV_TOKEN=xxxxxx')).toBeInTheDocument()
    })

    it('toggle hide/show the token', () => {
      const show = screen.getAllByText('Show')[1]
      expect(show).toBeInTheDocument()

      show.click()
      expect(screen.getByText('CODECOV_TOKEN=token')).toBeInTheDocument()

      const hide = screen.getByText('Hide')
      expect(hide).toBeInTheDocument()

      hide.click()
      expect(screen.getByText('CODECOV_TOKEN=xxxxxx')).toBeInTheDocument()
    })
  })

  describe('When user is not an admin and token is not available', () => {
    beforeEach(() => {
      setup({ isAdmin: false })
    })

    it('Render disabled regenerate button', () => {
      expect(screen.getByText('Generate')).toBeDisabled()
    })

    it('Render information', () => {
      expect(
        screen.getByText('Only organization admins can regenerate this token.')
      ).toBeInTheDocument()
    })
  })

  describe('When user is not an admin and token is available', () => {
    beforeEach(() => {
      setup({ orgUploadToken: 'token', isAdmin: false })
    })

    it('Render disabled regenerate button', () => {
      expect(screen.getByText('Regenerate')).toBeDisabled()
    })

    it('Render information', () => {
      expect(
        screen.getByText('Only organization admins can regenerate this token.')
      ).toBeInTheDocument()
    })
  })
})
