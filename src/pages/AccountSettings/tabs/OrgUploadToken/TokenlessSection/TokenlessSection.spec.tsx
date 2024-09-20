import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

import TokenlessSection from './TokenlessSection'

jest.mock('./TokenRequiredModal', () => () => 'Mocked TokenRequiredModal')

const Wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/account/github/codecov/org-upload-token']}>
    <Route path="/account/:provider/:owner/org-upload-token">{children}</Route>
  </MemoryRouter>
)

describe('TokenlessSection', () => {
  const setup = () => {
    const user = userEvent.setup()
    render(<TokenlessSection />, { wrapper: Wrapper })
    return { user }
  }

  it('renders the token authentication title', () => {
    setup()
    const title = screen.getByText('Token authentication')
    expect(title).toBeInTheDocument()
  })

  it('renders the learn more link', () => {
    setup()
    const learnMoreLink = screen.getByText('learn more')
    expect(learnMoreLink).toBeInTheDocument()
  })

  it('renders the authentication option selection text', () => {
    setup()
    const optionText = screen.getByText('Select an authentication option')
    expect(optionText).toBeInTheDocument()
  })

  it('renders "Not required" option description', () => {
    setup()
    const notRequiredDescription = screen.getByText(
      'When a token is not required, your team can upload coverage reports without one. Existing tokens will still work, and no action is needed for past uploads. Designed for public open-source projects.'
    )
    expect(notRequiredDescription).toBeInTheDocument()
  })

  it('renders "Required" option description', () => {
    setup()
    const requiredDescription = screen.getByText(
      'When a token is required, your team must use a global or repo-specific token for uploads. Designed for private repositories and closed-source projects.'
    )
    expect(requiredDescription).toBeInTheDocument()
  })

  it('renders and opens the token required modal when "Required" option is selected', async () => {
    const { user } = setup()

    const requiredOption = screen.getByLabelText('Required')
    await user.click(requiredOption)

    const modal = screen.getByText('Mocked TokenRequiredModal')
    expect(modal).toBeInTheDocument()
  })

  it("switches to 'Not required' option when not required is selected", async () => {
    const { user } = setup()

    const requiredOption = screen.getByLabelText('Required')
    await user.click(requiredOption)

    const notRequiredOption = screen.getByLabelText('Not required')
    await user.click(notRequiredOption)

    expect(notRequiredOption).toBeChecked()
  })
})
