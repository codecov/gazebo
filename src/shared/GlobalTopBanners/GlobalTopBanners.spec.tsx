import { render, screen } from '@testing-library/react'

import GlobalTopBanners from './GlobalTopBanners'

jest.mock('./RequestInstallBanner', () => () => 'RequestInstallBanner')
jest.mock('./TrialBanner', () => () => 'TrialBanner')
jest.mock('./TeamPlanFeedbackBanner', () => () => 'TeamPlanFeedbackBanner')

describe('GlobalTopBanners', () => {
  it('renders sentry trial banner', async () => {
    render(<GlobalTopBanners />)

    const banner = await screen.findByText(/TrialBanner/)
    expect(banner).toBeInTheDocument()
  })

  it('renders request install help banner', async () => {
    render(<GlobalTopBanners />)

    const banner = await screen.findByText(/RequestInstallBanner/)
    expect(banner).toBeInTheDocument()
  })

  it('renders team plan feedback banner', async () => {
    render(<GlobalTopBanners />)

    const banner = await screen.findByText(/TeamPlanFeedbackBanner/)
    expect(banner).toBeInTheDocument()
  })
})
