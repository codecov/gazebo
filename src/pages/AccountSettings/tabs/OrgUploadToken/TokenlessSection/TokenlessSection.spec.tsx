import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

import TokenlessSection from './TokenlessSection'

const Wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/account/github/codecov/org-upload-token']}>
    <Route path="/account/:provider/:owner/org-upload-token">{children}</Route>
  </MemoryRouter>
)

describe('TokenlessSection', () => {
  const setup = () => {
    const user = userEvent.setup()

    return { user }
  }

  it('renders the token authentication title', () => {
    render(<TokenlessSection />, { wrapper: Wrapper })
    setup()

    const title = screen.getByText('Token authentication')
    expect(title).toBeInTheDocument()
  })

  it('renders the learn more link', () => {
    render(<TokenlessSection />, { wrapper: Wrapper })
    setup()

    const learnMoreLink = screen.getByText('learn more')
    expect(learnMoreLink).toBeInTheDocument()
  })

  it('renders the authentication option selection text', () => {
    render(<TokenlessSection />, { wrapper: Wrapper })
    setup()

    const optionText = screen.getByText('Select an authentication option')
    expect(optionText).toBeInTheDocument()
  })

  it('renders "Not required" option description', () => {
    render(<TokenlessSection />, { wrapper: Wrapper })
    setup()

    const notRequiredDescription = screen.getByText(
      'When a token is not required, your team can upload coverage reports without one. Existing tokens will still work, and no action is needed for past uploads. Designed for public open-source projects.'
    )
    expect(notRequiredDescription).toBeInTheDocument()
  })

  it('renders "Required" option description', () => {
    render(<TokenlessSection />, { wrapper: Wrapper })
    setup()

    const requiredDescription = screen.getByText(
      'When a token is required, your team must use a global or repo-specific token for uploads. Designed for private repositories and closed-source projects.'
    )
    expect(requiredDescription).toBeInTheDocument()
  })

  describe('when "Required" option is selected', () => {
    it('renders the "Cancel" button', async () => {
      render(<TokenlessSection />, { wrapper: Wrapper })
      const { user } = setup()

      const requiredOption = screen.getByLabelText('Required')
      await user.click(requiredOption)

      const cancelButton = screen.getByRole('button', { name: /Cancel/ })
      expect(cancelButton).toBeInTheDocument()
    })

    it('renders the "Require token for upload" button', async () => {
      render(<TokenlessSection />, { wrapper: Wrapper })
      const { user } = setup()

      const requiredOption = screen.getByLabelText('Required')
      await user.click(requiredOption)

      const requireTokenButton = screen.getByRole('button', {
        name: /Require token for upload/,
      })
      expect(requireTokenButton).toBeInTheDocument()
    })

    it('removes modal and defaults to not required when "Cancel" button is clicked', async () => {
      render(<TokenlessSection />, { wrapper: Wrapper })
      const { user } = setup()

      const requiredOption = screen.getByLabelText('Required')
      await user.click(requiredOption)

      const cancelButton = screen.getByRole('button', { name: /Cancel/ })
      await user.click(cancelButton)

      const notRequiredOption = screen.getByLabelText('Not required')
      expect(notRequiredOption).toBeChecked()
    })

    it('removes modal and switches to required when "Require token for upload" button is clicked', async () => {
      render(<TokenlessSection />, { wrapper: Wrapper })
      const { user } = setup()

      const requiredOption = screen.getByLabelText('Required')
      await user.click(requiredOption)

      const requireTokenButton = screen.getByRole('button', {
        name: /Require token for upload/,
      })
      await user.click(requireTokenButton)

      const requiredOptionAfterClick = screen.getByLabelText('Required')
      expect(requiredOptionAfterClick).toBeChecked()
    })
  })

  it("switches to 'Not required' option when not required is selected", async () => {
    render(<TokenlessSection />, { wrapper: Wrapper })
    const { user } = setup()

    const requiredOption = screen.getByLabelText('Required')
    await user.click(requiredOption)

    const notRequiredOption = screen.getByLabelText('Not required')
    await user.click(notRequiredOption)

    expect(notRequiredOption).toBeChecked()
  })
})
