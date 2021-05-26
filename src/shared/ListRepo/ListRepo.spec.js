import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ListRepo from './ListRepo'

jest.mock('./OrgControlTable/ResyncButton', () => () => 'ResyncButton')
jest.mock('./ReposTable', () => () => 'ReposTable')

describe('ListRepo', () => {
  function setup(owner = null, active = false) {
    render(
      <MemoryRouter initialEntries={['']}>
        <ListRepo active={active} owner={owner} />
      </MemoryRouter>
    )
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
