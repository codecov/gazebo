import { render, screen } from '@testing-library/react'
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

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <ThemeContextProvider>
    <MemoryRouter initialEntries={['/gh/codecov/test-repo/bundles/new']}>
      <Route path="/:provider/:owner/:repo/bundles/new">{children}</Route>
    </MemoryRouter>
  </ThemeContextProvider>
)

describe('CodecovAIPage', () => {
  beforeEach(() => {
    mocks.useFlags.mockReturnValue({ codecovAiFeaturesTab: true })
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
    const buttonEl = screen.getByRole('link', { name: /Install Codecov AI/i })
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
})

describe('flag is off', () => {
  it('does not render page', async () => {
    mocks.useFlags.mockReturnValue({ codecovAiFeaturesTab: false })

    render(<CodecovAIPage />, { wrapper })

    const topSection = screen.queryByText(/Codecov AI is a/)
    expect(topSection).not.toBeInTheDocument()
  })
})
