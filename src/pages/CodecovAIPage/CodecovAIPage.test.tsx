import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { ThemeContextProvider } from 'shared/ThemeContext'

import CodecovAIPage from './CodecovAIPage'

const mocks = vi.hoisted(() => ({
  useFlags: vi.fn(),
}))

vi.mock('shared/featureFlags', async () => {
  const actual = await vi.importActual('shared/featureFlags')
  return {
    ...actual,
    useFlags: mocks.useFlags,
  }
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: true,
      suspense: true,
    },
  },
})

const server = setupServer()

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <ThemeContextProvider>
      <MemoryRouter initialEntries={['/gh/codecov/']}>
        <Route path="/:provider/:owner/">
          <Suspense fallback={null}>{children}</Suspense>
        </Route>
      </MemoryRouter>
    </ThemeContextProvider>
  </QueryClientProvider>
)

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  queryClient.clear()
})

afterAll(() => {
  server.close()
})

describe('CodecovAIPage', () => {
  function setup(
    aiFeaturesEnabled = false,
    aiEnabledRepos = ['repo-1', 'repo-2']
  ) {
    server.use(
      graphql.query('GetCodecovAIAppInstallInfo', () => {
        return HttpResponse.json({
          data: {
            owner: {
              aiFeaturesEnabled,
            },
          },
        })
      }),
      graphql.query('GetCodecovAIInstalledRepos', () => {
        return HttpResponse.json({
          data: {
            owner: {
              aiEnabledRepos,
            },
          },
        })
      })
    )
  }
  beforeEach(() => {
    mocks.useFlags.mockReturnValue({ codecovAiFeaturesTab: true })
    setup()
  })

  it('renders top section', async () => {
    render(<CodecovAIPage />, { wrapper })

    const topSection = await screen.findByText(/Codecov AI is a/)
    expect(topSection).toBeInTheDocument()
  })

  it('renders the install card', async () => {
    render(<CodecovAIPage />, { wrapper })

    const installHeader = await screen.findByText(/Install the Codecov AI/)
    expect(installHeader).toBeInTheDocument()
  })

  it('renders install instructions', async () => {
    render(<CodecovAIPage />, { wrapper })

    const installHeader = await screen.findByText(
      /To enable the Codecov AI assistant/
    )
    expect(installHeader).toBeInTheDocument()
  })

  it('renders the install button', async () => {
    render(<CodecovAIPage />, { wrapper })
    const buttonEl = await screen.findByText(/Install Codecov AI/i)
    expect(buttonEl).toBeInTheDocument()
  })

  it('renders approve install text', async () => {
    render(<CodecovAIPage />, { wrapper })

    const linkApproveText = await screen.findByText(
      /Hello, could you help approve/
    )
    expect(linkApproveText).toBeInTheDocument()
  })

  it('renders codecov ai commands', async () => {
    render(<CodecovAIPage />, { wrapper })

    const commandText = await screen.findByText(/Codecov AI Commands/)
    expect(commandText).toBeInTheDocument()

    const commandOneText = await screen.findByText(
      / the assistant will review the PR/
    )
    expect(commandOneText).toBeInTheDocument()
  })

  it('renders examples', async () => {
    render(<CodecovAIPage />, { wrapper })

    const reviewExample = await screen.findByText(
      /Here is an example of Codecov AI Reviewer in PR comments/
    )
    expect(reviewExample).toBeInTheDocument()
  })

  it('renders screenshot', async () => {
    render(<CodecovAIPage />, { wrapper })
    const user = userEvent.setup()
    const trigger = await screen.findByText((content) =>
      content.startsWith('Here is an example')
    )
    expect(trigger).toBeInTheDocument()

    await user.click(trigger)

    const screenshot = await screen.findByRole('img', {
      name: /codecov pr review example/,
    })
    expect(screenshot).toBeInTheDocument()
  })

  it('renders a link to the docs', async () => {
    render(<CodecovAIPage />, { wrapper })

    const docLink = await screen.findByText(/Visit our guide/)
    expect(docLink).toBeInTheDocument()
  })

  describe('AI features are enabled and configured', () => {
    beforeEach(() => {
      setup(true)
      mocks.useFlags.mockReturnValue({ codecovAiFeaturesTab: true })
    })

    it('does not render install link', () => {
      setup(true)
      render(<CodecovAIPage />, { wrapper })
      const topSection = screen.queryByText(/Install Codecov AI/)
      expect(topSection).not.toBeInTheDocument()
    })

    it('renders list of repos', async () => {
      render(<CodecovAIPage />, { wrapper })

      const repo1Link = await screen.findByText(/repo-1/)
      expect(repo1Link).toBeInTheDocument()
      const repo2Link = await screen.findByText(/repo-2/)
      expect(repo2Link).toBeInTheDocument()
    })

    describe('No repos returned', () => {
      it('renders install link', async () => {
        setup(true, [])
        render(<CodecovAIPage />, { wrapper })
        const buttonEl = await screen.findByText(/Install Codecov AI/i)
        expect(buttonEl).toBeInTheDocument()
      })
    })
  })

  describe('flag is off', () => {
    it('does not render page', async () => {
      setup(true)
      mocks.useFlags.mockReturnValue({ codecovAiFeaturesTab: false })

      render(<CodecovAIPage />, { wrapper })

      const topSection = screen.queryByText(/Codecov AI is a/)
      expect(topSection).not.toBeInTheDocument()
    })
  })
})
