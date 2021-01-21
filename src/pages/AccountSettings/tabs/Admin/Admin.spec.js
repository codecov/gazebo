import { render, screen } from '@testing-library/react'

import Admin from './Admin'

jest.mock('./NameEmailCard', () => () => 'NameEmailCard')

describe('AdminTab', () => {
  function setup(props) {
    render(<Admin {...props} />)
  }

  describe('when rendered for user', () => {
    beforeEach(() => {
      setup({
        isPersonalSettings: true,
      })
    })

    it('renders the NameEmailCard', () => {
      const card = screen.getByText(/NameEmailCard/)
      expect(card).toBeInTheDocument()
    })
  })

  describe('when rendered for organization', () => {
    beforeEach(() => {
      setup({
        isPersonalSettings: false,
      })
    })

    it('renders the admin manage section', () => {
      const card = screen.getByText(/add\/remove admin section/)
      expect(card).toBeInTheDocument()
    })
  })
})
