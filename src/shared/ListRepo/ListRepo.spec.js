import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ListRepo from './ListRepo'

const mockHistoryPush = jest.fn()

jest.mock('./OrgControlTable/ResyncButton', () => () => 'ResyncButton')
jest.mock('./ReposTable', () => () => 'ReposTable')

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}))

describe('ListRepo', () => {
  function setup(owner = null, active = false, url = '') {
    render(
      <MemoryRouter initialEntries={[url]}>
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

  describe('reads URL parameters', () => {
    it('reads search parameter from URL', () => {
      setup(null, false, '?search=thisisaquery')
      const input = screen.getByRole('textbox')
      expect(input).toHaveValue('thisisaquery')
    })
    it('reads ordering & direction (ASC) parameter from URL', () => {
      setup(null, false, '?ordering=NAME&direction=ASC')
      const select = screen.getByRole('button', {
        name: /Name \[A-Z\]/,
      })
      expect(select).toBeInTheDocument()
    })
    it('reads ordering & direction (DESC) parameter from URL', () => {
      setup(null, false, '?ordering=NAME&direction=DESC')
      const select = screen.getByRole('button', {
        name: /Name \[Z-A\]/,
      })
      expect(select).toBeInTheDocument()
    })
    it('default fallback for ordering & direction parameter from URL', () => {
      setup(null, false, '?ordering=NAMEe&direction=DESC')
      const select = screen.getByRole('button', {
        name: /Most recent commit/,
      })
      expect(select).toBeInTheDocument()
    })
  })

  describe('switches active/inactive repos', () => {
    beforeEach(() => {
      setup()
    })
    it('switches to active repos', () => {
      screen
        .getByRole('button', {
          name: /enabled/i,
        })
        .click()
      expect(mockHistoryPush).toHaveBeenCalledWith('/')
    })
    it('switches to inactive repos', () => {
      screen
        .getByRole('button', {
          name: /Not yet setup/i,
        })
        .click()
      expect(mockHistoryPush).toHaveBeenCalledWith('//+')
    })
  })
})
