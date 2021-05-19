import { render, screen } from '@testing-library/react'
import HomePage from './HomePage'
import { useRepos } from 'services/repos/hooks'

jest.mock('layouts/MyContextSwitcher', () => () => 'MyContextSwitcher')
jest.mock('react-router-dom', () => ({
  useParams: () => ({
    provider: 'gh',
  }),
}))
jest.mock('services/repos/hooks')
jest.mock('./OrgControlTable/ResyncButton', () => () => 'ResyncButton')

describe('HomePage', () => {
  function setup() {
    useRepos.mockReturnValue({
      data: {
        repos: [],
      },
    })

    render(<HomePage />)
  }

  describe('renders', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the children', () => {
      expect(screen.getByText(/Enabled/)).toBeInTheDocument()
    })
  })
})
