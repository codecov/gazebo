import { render, screen } from '@testing-library/react'

import ListRepo from './ListRepo'

jest.mock('./OrgControlTable/ResyncButton', () => () => 'ResyncButton')
jest.mock('./ReposTable', () => () => 'ReposTable')

describe('ListRepo', () => {
  function setup(owner = null) {
    render(<ListRepo owner={owner} />)
  }

  describe('renders', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the children', () => {
      expect(screen.getByText(/Enabled/)).toBeInTheDocument()
    })

    it('renders the repo table', () => {
      expect(screen.getByText(/ReposTable/)).toBeInTheDocument()
    })
  })
})
