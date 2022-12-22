import { render, screen } from 'custom-testing-library'

import GlobalBanners from './GlobalBanners'

jest.mock('./MissingDesignatedAdmins', () => () => 'MissingDesignatedAdmins')

describe('GlobalBanners', () => {
  function setup() {
    render(<GlobalBanners />)
  }

  describe('Successful render', () => {
    beforeEach(() => {
      setup()
    })

    it('MissingDesignatedAdmins is loaded', () => {
      const MissingDesignatedAdminsBanner = screen.getByText(
        'MissingDesignatedAdmins'
      )
      expect(MissingDesignatedAdminsBanner).toBeInTheDocument()
    })
  })
})
