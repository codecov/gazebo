import { render, screen } from 'custom-testing-library'

import GlobalBanners from './GlobalBanners'

jest.mock('./MissingDesignatedAdmins', () => () => 'MissingDesignatedAdmins')
jest.mock('./TrialPeriodEnd', () => () => 'TrialPeriodEnd')

describe('GlobalBanners', () => {
  describe('Successful render', () => {
    it('MissingDesignatedAdmins is loaded', () => {
      render(<GlobalBanners />)

      const MissingDesignatedAdminsBanner = screen.getByText(
        /MissingDesignatedAdmins/
      )
      expect(MissingDesignatedAdminsBanner).toBeInTheDocument()
    })
    it('TrialPeriodEnd is loaded', () => {
      render(<GlobalBanners />)

      const TrialPeriodEndBanner = screen.getByText(/TrialPeriodEnd/)
      expect(TrialPeriodEndBanner).toBeInTheDocument()
    })
  })
})
