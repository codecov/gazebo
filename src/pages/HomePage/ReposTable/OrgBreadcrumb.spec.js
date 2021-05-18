import { render, screen } from 'custom-testing-library'
import OrgBreadcrumb from './OrgBreadcrumb'

describe('OrgBreadcrumb', () => {
  let props

  function setup(over = {}) {
    props = {
      ...over,
    }
    render(<OrgBreadcrumb {...props} />)
  }

  describe('display private', () => {
    beforeEach(() => {
      setup({
        repo: {
          name: 'repo1',
          author: {
            username: 'owner1',
          },
          private: true,
        },
      })
    })

    it('renders bar', () => {
      expect(screen.getByText(/repo1/)).toBeInTheDocument()
      expect(screen.getByText(/owner1/)).toBeInTheDocument()
    })
  })

  describe('display public', () => {
    beforeEach(() => {
      setup({
        repo: {
          name: 'repo2',
          author: {
            username: 'owner2',
          },
          private: false,
        },
      })
    })

    it('renders bar', () => {
      expect(screen.getByText(/repo2/)).toBeInTheDocument()
      expect(screen.getByText(/owner2/)).toBeInTheDocument()
    })
  })
})
