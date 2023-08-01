import { render, screen } from '@testing-library/react'

import GlobalTopBanners from './GlobalTopBanners'

jest.mock('./SentryTrialBanner', () => () => 'SentryTrialBanner')
jest.mock('./RequestInstallBanner', () => () => 'RequestInstallBanner')

describe('GlobalTopBanners', () => {
  it('renders sentry trial banner', async () => {
    render(<GlobalTopBanners />)

    const banner = await screen.findByText(/SentryTrialBanner/)
    expect(banner).toBeInTheDocument()
  })

  it('renders request install help banner', async () => {
    render(<GlobalTopBanners />)

    const banner = await screen.findByText(/RequestInstallBanner/)
    expect(banner).toBeInTheDocument()
  })
})
