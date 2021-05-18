import { render, screen } from '@testing-library/react'
import ReposTable from './ReposTable'
import { useRepos } from 'services/repos/hooks'

jest.mock('react-router-dom', () => ({
  useParams: () => ({
    provider: 'gh',
  }),
}))
jest.mock('services/repos/hooks')
jest.mock('./ActiveReposTable', () => () => 'ActiveReposTable')
jest.mock('./InactiveReposTable', () => () => 'InactiveReposTable')

describe('ReposTable', () => {
  let props
  function setup(over = {}) {
    useRepos.mockReturnValue({
      data: {
        repos: [],
      },
    })
    props = {
      active: true,
      searchValue: '',
      ...over,
    }
    render(<ReposTable {...props} />)
  }

  describe('when rendered with active true', () => {
    beforeEach(() => {
      setup({
        active: true,
      })
    })

    it('calls useRepos with the right data', () => {
      expect(useRepos).toHaveBeenCalledWith({
        provider: 'gh',
        active: true,
        term: '',
      })
    })

    it('renders ActiveReposTable', () => {
      expect(screen.getByText(/ActiveReposTable/)).toBeInTheDocument()
    })
  })

  describe('when rendered with active false', () => {
    beforeEach(() => {
      setup({
        active: false,
      })
    })

    it('calls useRepos with the right data', () => {
      expect(useRepos).toHaveBeenCalledWith({
        provider: 'gh',
        active: false,
        term: '',
      })
    })

    it('renders InactiveReposTable', () => {
      expect(screen.getByText(/InactiveReposTable/)).toBeInTheDocument()
    })
  })
})
