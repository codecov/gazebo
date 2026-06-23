import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { type Mock } from 'vitest'

import { useUser } from 'services/user/useUser'

import SentryLoginDeprecationBanner from './SentryLoginDeprecationBanner'

vi.mock('services/user/useUser')

const mockedUseUser = useUser as Mock

describe('SentryLoginDeprecationBanner', () => {
  it('renders the deprecation banner when the user has linked Sentry login', async () => {
    mockedUseUser.mockReturnValue({
      data: {
        hasLinkedSentryLogin: true,
      },
    })

    render(<SentryLoginDeprecationBanner />)

    const bannerText = await screen.findByText(
      /Logging in through Sentry will no longer be supported starting July 8th, 2026/i
    )
    expect(bannerText).toBeInTheDocument()
  })

  it('dismisses the banner when the user clicks Dismiss', async () => {
    mockedUseUser.mockReturnValue({
      data: {
        hasLinkedSentryLogin: true,
      },
    })

    localStorage.clear()

    const user = userEvent.setup()

    const { container } = render(<SentryLoginDeprecationBanner />)

    const dismissBtn = await screen.findByRole('button', { name: /dismiss/i })
    expect(dismissBtn).toBeInTheDocument()

    await user.click(dismissBtn)

    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when the user has not linked Sentry login', () => {
    mockedUseUser.mockReturnValue({
      data: {
        hasLinkedSentryLogin: false,
      },
    })

    const { container } = render(<SentryLoginDeprecationBanner />)
    expect(container).toBeEmptyDOMElement()
  })
})
