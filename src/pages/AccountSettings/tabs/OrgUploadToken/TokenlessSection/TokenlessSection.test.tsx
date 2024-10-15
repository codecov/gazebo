import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { MemoryRouter, Route } from 'react-router-dom'

import TokenlessSection from './TokenlessSection'

const mocks = vi.hoisted(() => ({
  useAddNotification: vi.fn(),
  useFlags: vi.fn(),
}))

vi.mock('services/toastNotification', async () => {
  const actual = await vi.importActual('services/toastNotification')
  return {
    ...actual,
    useAddNotification: mocks.useAddNotification,
  }
})

vi.mock('shared/featureFlags', async () => {
  const actual = await vi.importActual('shared/featureFlags')
  return {
    ...actual,
    useFlags: mocks.useFlags,
  }
})

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const server = setupServer()

beforeAll(() => {
  console.error = () => {}
  server.listen()
})

beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})

afterAll(() => server.close())

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/account/gh/codecov/org-upload-token']}>
      <Route path="/account/:provider/:owner/org-upload-token">
        {children}
      </Route>
    </MemoryRouter>
  </QueryClientProvider>
)

describe('TokenlessSection', () => {
  function setup({
    isAdmin = true,
    orgUploadToken = 'test-mock-org-upload-token',
    uploadTokenRequired = false,
  } = {}) {
    mocks.useFlags.mockReturnValue({ tokenlessSection: true })
    mocks.useAddNotification.mockReturnValue(vi.fn())
    const mutate = vi.fn()
    const user = userEvent.setup()

    server.use(
      graphql.query('GetUploadTokenRequired', () => {
        return HttpResponse.json({
          data: {
            owner: {
              orgUploadToken,
              isAdmin,
              uploadTokenRequired,
            },
          },
        })
      }),
      graphql.mutation('SetUploadTokenRequired', (info) => {
        mutate(info.variables.input.uploadTokenRequired)

        return HttpResponse.json({
          data: {
            setUploadTokenRequired: {
              error: null,
            },
          },
        })
      })
    )

    return { user, mutate }
  }

  it('renders the token authentication title', async () => {
    setup()
    render(<TokenlessSection />, { wrapper })

    const title = await screen.findByText('Token authentication')
    expect(title).toBeInTheDocument()
  })

  it('renders the learn more link', async () => {
    setup()
    render(<TokenlessSection />, { wrapper })

    const learnMoreLink = await screen.findByText('learn more')
    expect(learnMoreLink).toBeInTheDocument()
  })

  it('renders the authentication option selection text', async () => {
    setup()
    render(<TokenlessSection />, { wrapper })

    const optionText = await screen.findByText(
      'Select an authentication option'
    )
    expect(optionText).toBeInTheDocument()
  })

  it('renders "Not required" option description', async () => {
    setup()
    render(<TokenlessSection />, { wrapper })

    const notRequiredDescription = await screen.findByText(
      'When a token is not required, your team can upload coverage reports without one. Existing tokens will still work, and no action is needed for past uploads. Designed for public open-source projects.'
    )
    expect(notRequiredDescription).toBeInTheDocument()
  })

  it('renders "Required" option description', async () => {
    setup()
    render(<TokenlessSection />, { wrapper })

    const requiredDescription = await screen.findByText(
      'When a token is required, your team must use a global or repo-specific token for uploads. Designed for private repositories and closed-source projects.'
    )
    expect(requiredDescription).toBeInTheDocument()
  })

  describe('when "Required" option is selected', () => {
    it('renders the "Cancel" button', async () => {
      const { user } = setup()
      render(<TokenlessSection />, { wrapper })

      const requiredOption = await screen.findByLabelText('Required')
      await user.click(requiredOption)

      const cancelButton = await screen.findByRole('button', { name: /Cancel/ })
      expect(cancelButton).toBeInTheDocument()
    })

    it('renders the "Require token for upload" button', async () => {
      const { user } = setup()
      render(<TokenlessSection />, { wrapper })

      const requiredOption = await screen.findByLabelText('Required')
      await user.click(requiredOption)

      const requireTokenButton = await screen.findByRole('button', {
        name: /Require token for upload/,
      })
      expect(requireTokenButton).toBeInTheDocument()
    })

    it('removes modal and defaults to not required when "Cancel" button is clicked', async () => {
      const { user } = setup()
      render(<TokenlessSection />, { wrapper })

      const requiredOption = await screen.findByLabelText('Required')
      await user.click(requiredOption)

      const cancelButton = await screen.findByRole('button', { name: /Cancel/ })
      await user.click(cancelButton)

      const notRequiredOption = await screen.findByLabelText('Not required')
      expect(notRequiredOption).toBeChecked()
    })

    describe('when "Require token for upload" button is clicked', () => {
      it('removes modal and switches to required when "Require token for upload" button is clicked', async () => {
        const { user } = setup()
        render(<TokenlessSection />, { wrapper })

        const requiredOption = await screen.findByLabelText('Required')
        await user.click(requiredOption)

        const requireTokenButton = await screen.findByRole('button', {
          name: /Require token for upload/,
        })
        expect(requireTokenButton).toBeInTheDocument()
      })

      it('switches to required', async () => {
        const { user } = setup()
        render(<TokenlessSection />, { wrapper })

        const requiredOption = await screen.findByLabelText('Required')
        await user.click(requiredOption)

        const requireTokenButton = await screen.findByRole('button', {
          name: /Require token for upload/,
        })
        await user.click(requireTokenButton)

        const requiredOptionAfterClick =
          await screen.findByLabelText('Required')
        expect(requiredOptionAfterClick).toBeChecked()
      })
    })
  })

  describe('when switching to "Not required" option', () => {
    it('switches to "Not required" option', async () => {
      const { user } = setup({ uploadTokenRequired: true })
      render(<TokenlessSection />, { wrapper })

      const requiredOption = await screen.findByLabelText('Required')
      await waitFor(() => {
        expect(requiredOption).toBeChecked()
      })

      const notRequiredOption = await screen.findByLabelText('Not required')
      await user.click(notRequiredOption)

      expect(notRequiredOption).toBeChecked()
    })

    it('calls mutate with false', async () => {
      const { user, mutate } = setup({ uploadTokenRequired: true })
      render(<TokenlessSection />, { wrapper })

      const notRequiredOption = await screen.findByLabelText('Not required')
      await user.click(notRequiredOption)

      expect(mutate).toHaveBeenCalledTimes(1)
      expect(mutate).toHaveBeenCalledWith(false)
    })
  })
})
