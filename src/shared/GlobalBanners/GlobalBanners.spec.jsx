import { render, screen } from 'custom-testing-library'

import GlobalBanners from './GlobalBanners'

jest.mock('./MissingDesignatedAdmins', () => () => 'MissingDesignatedAdmins')
jest.mock(
  './SelfHostedLicenseExpiration',
  () => () => 'SelfHostedLicenseExpiration'
)

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
