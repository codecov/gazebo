import { render, screen } from '@testing-library/react'

import GlobalTopBanners from './GlobalTopBanners'

vi.mock('./TrialBanner', () => ({
  default: () => 'TrialBanner',
}))
vi.mock('./TeamPlanFeedbackBanner', () => ({
  default: () => 'TeamPlanFeedbackBanner',
}))
vi.mock('./ProPlanFeedbackBanner', () => ({
  default: () => 'ProPlanFeedbackBanner',
}))
vi.mock('./BundleFeedbackBanner', () => ({
  default: () => 'BundleFeedbackBanner',
}))
vi.mock('./OktaBanners', () => ({
  default: () => 'OktaBanners',
}))
vi.mock('./TokenlessBanner', () => ({
  default: () => 'TokenlessBanner',
}))
vi.mock('./AnnouncementBanner', () => ({
  default: () => 'AnnouncementBanner',
}))
vi.mock('./SentryLoginDeprecationBanner', () => ({
  default: () => 'SentryLoginDeprecationBanner',
}))

describe('GlobalTopBanners', () => {
  it('renders sentry trial banner', async () => {
    render(<GlobalTopBanners />)

    const banner = await screen.findByText(/TrialBanner/)
    expect(banner).toBeInTheDocument()
  })

  it('renders team plan feedback banner', async () => {
    render(<GlobalTopBanners />)

    const banner = await screen.findByText(/TeamPlanFeedbackBanner/)
    expect(banner).toBeInTheDocument()
  })

  it('renders pro plan feedback banner', async () => {
    render(<GlobalTopBanners />)

    const banner = await screen.findByText(/ProPlanFeedbackBanner/)
    expect(banner).toBeInTheDocument()
  })

  it('renders bundle feedback banner', async () => {
    render(<GlobalTopBanners />)

    const banner = await screen.findByText(/ProPlanFeedbackBanner/)
    expect(banner).toBeInTheDocument()
  })

  it('renders okta banners', async () => {
    render(<GlobalTopBanners />)

    const banner = await screen.findByText(/OktaBanners/)
    expect(banner).toBeInTheDocument()
  })

  it('renders tokenless banner', async () => {
    render(<GlobalTopBanners />)

    const banner = await screen.findByText(/TokenlessBanner/)
    expect(banner).toBeInTheDocument()
  })

  it('renders announcement banner', async () => {
    render(<GlobalTopBanners />)

    const banner = await screen.findByText(/AnnouncementBanner/)
    expect(banner).toBeInTheDocument()
  })

  it('renders sentry login deprecation banner', async () => {
    render(<GlobalTopBanners />)

    const banner = await screen.findByText(/SentryLoginDeprecationBanner/)
    expect(banner).toBeInTheDocument()
  })
})
