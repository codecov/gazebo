import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useFlags } from 'shared/featureFlags'
import { ThemeContextProvider } from 'shared/ThemeContext'

import CodecovAIPage from './CodecovAIPage'

jest.mock('shared/featureFlags')
const mockedUseFlags = useFlags as jest.Mock

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
    },
  },
})
const server = setupServer()

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <ThemeContextProvider>
      <MemoryRouter initialEntries={['/gh/codecov/test-repo/bundles/new']}>
        <Route path="/:provider/:owner/:repo/bundles/new">{children}</Route>
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

afterAll(() => {
  server.close()
})

describe('CodecovAIPage', () => {
  function setup(aiFeaturesEnabled = false) {
    server.use(
      graphql.query('GetCodecovAIAppInstallInfo', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({
            owner: {
              aiFeaturesEnabled,
            },
          })
        )
      }),
      graphql.query('GetCodecovAIInstalledRepos', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({
            owner: {
              aiEnabledRepos: ['repo-1', 'repo-2'],
            },
          })
        )
      })
    )
  }

  beforeEach(() => {
    setup()
    mockedUseFlags.mockReturnValue({ codecovAiFeaturesTab: true })
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
    const buttonEl = await screen.findByText(/Install Codecov AI/)
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
      /the assistant will generate tests/
    )
    expect(commandOneText).toBeInTheDocument()

    const commandTwoText = await screen.findByText(
      /the assistant will review the PR/
    )
    expect(commandTwoText).toBeInTheDocument()
  })

  it('renders examples', async () => {
    render(<CodecovAIPage />, { wrapper })

    const reviewExample = await screen.findByText(
      /Here is an example of Codecov AI Reviewer in PR comments/
    )
    expect(reviewExample).toBeInTheDocument()

    const testGenerator = await screen.findByText(
      /Here is an example of Codecov AI Test Generator/
    )
    expect(testGenerator).toBeInTheDocument()
  })

  //TODO: Once we have screenshots, test that they are visible

  it('renders a link to the docs', async () => {
    render(<CodecovAIPage />, { wrapper })

    const docLink = await screen.findByText(/Visit our guide/)
    expect(docLink).toBeInTheDocument()
  })

  describe('AI features are enabled and configured', () => {
    beforeEach(() => {
      setup(true)
      mockedUseFlags.mockReturnValue({ codecovAiFeaturesTab: true })
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
      const repo2Link = await screen.findByText(/repo-1/)
      expect(repo2Link).toBeInTheDocument()
    })
  })
})

describe('flag is off', () => {
  it('does not render page', async () => {
    mockedUseFlags.mockReturnValue({ codecovAiFeaturesTab: false })

    render(<CodecovAIPage />, { wrapper })

    const topSection = screen.queryByText(/Codecov AI is a/)
    expect(topSection).not.toBeInTheDocument()
  })
})
