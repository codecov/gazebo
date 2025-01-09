import { render, screen } from '@testing-library/react'

import { CachedBundleContentBanner } from './CachedBundleContentBanner'

describe('CachedBundleContentBanner', () => {
  it('should render the banner', () => {
    render(<CachedBundleContentBanner />)

    const banner = screen.getByText(
      'The reported bundle size includes cached data from previous commits'
    )
    expect(banner).toBeInTheDocument()
  })
})
