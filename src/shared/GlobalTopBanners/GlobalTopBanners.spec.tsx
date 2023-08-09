import { render, screen } from '@testing-library/react'

import GlobalBanners from './GlobalTopBanners'

jest.mock('./SentryTrialBanner', () => () => 'SentryTrialBanner')

describe('GlobalBanners', () => {
  it('renders sentry trial banner', async () => {
    render(<GlobalBanners />)

    const banner = await screen.findByText('SentryTrialBanner')
    expect(banner).toBeInTheDocument()
  })
})
