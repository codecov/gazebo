import { render, screen } from 'custom-testing-library'

import GlobalBanners from './GlobalBanners'

vi.mock('./MissingDesignatedAdmins', () => ({
  default: () => 'MissingDesignatedAdmins',
}))
vi.mock('./SelfHostedLicenseExpiration', () => ({
  default: () => 'SelfHostedLicenseExpiration',
}))

describe('GlobalBanners', () => {
  describe('Successful render', () => {
    it('MissingDesignatedAdmins is loaded', () => {
      render(<GlobalBanners />)

      const MissingDesignatedAdminsBanner = screen.getByText(
        /MissingDesignatedAdmins/
      )
      expect(MissingDesignatedAdminsBanner).toBeInTheDocument()
    })

    it('SelfHostedLicenseExpiration is loaded', () => {
      render(<GlobalBanners />)

      const SelfHostedLicenseExpirationBanner = screen.getByText(
        /SelfHostedLicenseExpiration/
      )
      expect(SelfHostedLicenseExpirationBanner).toBeInTheDocument()
    })
  })
})
