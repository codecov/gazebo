import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useAddNotification } from 'services/toastNotification'

import OrgUploadToken from './OrgUploadToken'

vi.mock('services/toastNotification')

const mockOwner = {
  owner: {
    me: {},
    isCurrentUserPartOfOrg: true,
  },
}

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, suspense: true },
  },
})

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/account/gh/codecov/orgUploadToken']}>
    <QueryClientProvider client={queryClient}>
      <Route path="/account/:provider/:owner/orgUploadToken">
        <Suspense fallback={null}>{children}</Suspense>
      </Route>
    </QueryClientProvider>
  </MemoryRouter>
)

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' })
})

afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

describe('OrgUploadToken', () => {
  function setup(
    { orgUploadToken = null, error = null, isAdmin = true } = {
      orgUploadToken: null,
      error: null,
      isAdmin: true,
    }
  ) {
    const user = userEvent.setup()
    const mutate = vi.fn()
    const addNotification = vi.fn()

    useAddNotification.mockReturnValue(addNotification)

    server.use(
      graphql.query('DetailOwner', (info) => {
        return HttpResponse.json({
          data: {
            owner: {
              ...mockOwner.owner,
              isAdmin: isAdmin,
            },
          },
        })
      }),
      graphql.query('GetOrgUploadToken', (info) => {
        return HttpResponse.json({
          data: {
            owner: {
              orgUploadToken: orgUploadToken,
            },
          },
        })
      }),
      graphql.mutation('regenerateOrgUploadToken', (info) => {
        mutate('regenerateOrgUploadToken')
        return HttpResponse.json({
          data: {
            regenerateOrgUploadToken: {
              orgUploadToken,
              error: {
                __typename: error,
              },
            },
          },
        })
      })
    )

    return { addNotification, mutate, user }
  }

  describe('renders component', () => {
    it('renders title', async () => {
      setup({})
      render(<OrgUploadToken />, { wrapper })

      const title = await screen.findByText(/Global upload token/)
      expect(title).toBeInTheDocument()
    })

    it('renders body', async () => {
      setup({})
      render(<OrgUploadToken />, { wrapper })

      const p = await screen.findByText(/Sensitive credential/)
      expect(p).toBeInTheDocument()
    })

    it('renders generate token', async () => {
      setup({})
      render(<OrgUploadToken />, { wrapper })

      const title = await screen.findByText(
        /Generating a global token allows you to apply the same upload token to/
      )
      expect(title).toBeInTheDocument()
    })

    it('renders generate button', async () => {
      setup({})
      render(<OrgUploadToken />, { wrapper })

      const genBtn = await screen.findByRole('button', { name: /Generate/ })
      expect(genBtn).toBeInTheDocument()
    })

    it('renders link to codecov uploader', async () => {
      setup({})
      render(<OrgUploadToken />, { wrapper })

      const link = await screen.findByRole('link', { name: /Learn more/ })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute(
        'href',
        'https://docs.codecov.com/docs/codecov-uploader#organization-upload-token'
      )
    })
  })

  describe('when user clicks on Generate button', () => {
    it('calls the mutation', async () => {
      const { mutate, user } = setup()

      render(<OrgUploadToken />, { wrapper })

      const genBtn = await screen.findByRole('button', { name: 'Generate' })
      await user.click(genBtn)

      await waitFor(() => expect(mutate).toHaveBeenCalled())
    })

    describe('when mutation is not successful', () => {
      it('calls the mutation', async () => {
        const { user, mutate } = setup({
          orgUploadToken: '',
          error: 'Authentication Error',
          isAdmin: true,
        })
        render(<OrgUploadToken />, { wrapper })

        const genBtn = await screen.findByRole('button', { name: 'Generate' })
        expect(genBtn).toBeInTheDocument()

        await user.click(genBtn)

        await waitFor(() => expect(mutate).toHaveBeenCalled())
      })

      it('adds an error notification', async () => {
        const { addNotification, user } = setup({
          orgUploadToken: '',
          error: 'Authentication Error',
          isAdmin: true,
        })
        const { rerender } = render(<OrgUploadToken />, { wrapper })

        const genBtn = await screen.findByRole('button', { name: 'Generate' })
        expect(genBtn).toBeInTheDocument()

        await user.click(genBtn)

        rerender()

        await waitFor(() =>
          expect(addNotification).toHaveBeenCalledWith({
            type: 'error',
            text: 'Authentication Error',
          })
        )
      })
    })
  })

  describe('when already has an orgUploadToken', () => {
    it('calls the mutation', async () => {
      const { user, mutate } = setup({ orgUploadToken: 'token' })
      render(<OrgUploadToken />, { wrapper })

      const reGenBtn = await screen.findByRole('button', { name: 'Regenerate' })
      await user.click(reGenBtn)

      const saveBtn = await screen.findByRole('button', {
        name: 'Save New Token',
      })
      await user.click(saveBtn)

      await waitFor(() => expect(mutate).toHaveBeenCalled())
    })

    it('adds a success notification', async () => {
      const { addNotification, user } = setup({ orgUploadToken: 'token' })
      render(<OrgUploadToken />, { wrapper })

      const reGenBtn = await screen.findByRole('button', { name: 'Regenerate' })
      await user.click(reGenBtn)

      const saveBtn = await screen.findByRole('button', {
        name: 'Save New Token',
      })
      await user.click(saveBtn)

      await waitFor(() =>
        expect(addNotification).toHaveBeenCalledWith({
          type: 'success',
          text: 'Global upload token generated.',
        })
      )
    })

    it('displays the new token -encoded-', async () => {
      const { user } = setup({ orgUploadToken: 'token' })
      render(<OrgUploadToken />, { wrapper })

      const reGenBtn = await screen.findByRole('button', { name: 'Regenerate' })
      await user.click(reGenBtn)

      const saveBtn = await screen.findByRole('button', {
        name: 'Save New Token',
      })
      await user.click(saveBtn)

      const token = await screen.findByText('CODECOV_TOKEN=xxxxxx')
      expect(token).toBeInTheDocument()
    })
  })

  describe('when click on cancel', () => {
    it('does not call the mutation', async () => {
      const { user, mutate } = setup({ orgUploadToken: 'token' })
      render(<OrgUploadToken />, { wrapper })

      const reGenBtn = await screen.findByRole('button', { name: 'Regenerate' })
      await user.click(reGenBtn)

      const cancelBtn = await screen.findByRole('button', { name: 'Cancel' })
      await user.click(cancelBtn)

      expect(mutate).not.toHaveBeenCalled()
    })
  })

  describe('toggle token', () => {
    it('displays the new token -encoded-', async () => {
      setup({ orgUploadToken: 'token' })

      render(<OrgUploadToken />, { wrapper })

      const token = await screen.findByText('CODECOV_TOKEN=xxxxxx')
      expect(token).toBeInTheDocument()
    })

    it('toggle hide/show the token', async () => {
      const { user } = setup({ orgUploadToken: 'token' })
      render(<OrgUploadToken />, { wrapper })

      const show = await screen.findAllByText('Show')
      expect(show[1]).toBeInTheDocument()
      await user.click(show[1])

      const token1 = await screen.findByText('CODECOV_TOKEN=token')
      expect(token1).toBeInTheDocument()

      const hide = await screen.findByText('Hide')
      expect(hide).toBeInTheDocument()
      await user.click(hide)

      const token2 = await screen.findByText('CODECOV_TOKEN=xxxxxx')
      expect(token2).toBeInTheDocument()
    })
  })

  describe('when user is not an admin and token is not available', () => {
    it('Render disabled regenerate button', async () => {
      setup({ isAdmin: false })
      render(<OrgUploadToken />, { wrapper })

      const genBtn = await screen.findByText('Generate')
      expect(genBtn).toBeDisabled()
    })

    it('renders information', async () => {
      setup({ isAdmin: false })
      render(<OrgUploadToken />, { wrapper })

      const text = await screen.findByText(
        'Only organization admins can regenerate this token.'
      )
      expect(text).toBeInTheDocument()
    })
  })

  describe('when user is not an admin and token is available', () => {
    it('renders disabled regenerate button', async () => {
      setup({ orgUploadToken: 'token', isAdmin: false })
      render(<OrgUploadToken />, { wrapper })

      const reGen = await screen.findByText('Regenerate')
      expect(reGen).toBeDisabled()
    })

    it('renders information', async () => {
      setup({ orgUploadToken: 'token', isAdmin: false })
      render(<OrgUploadToken />, { wrapper })

      const text = await screen.findByText(
        'Only organization admins can regenerate this token.'
      )
      expect(text).toBeInTheDocument()
    })
  })
})
