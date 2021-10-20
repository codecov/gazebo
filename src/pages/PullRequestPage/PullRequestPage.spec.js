import { render, screen } from 'custom-testing-library'
import { MemoryRouter, Route } from 'react-router-dom'

import PullRequestPage from './PullRequestPage'

jest.mock('./PullDetail', () => () => 'PullDetail')

describe('PullRequestPage', () => {
  function setup() {
    render(
      <MemoryRouter initialEntries={['/gh/test-org/test-repo/pull/12']}>
        <Route path="/:provider/:owner/:repo/pull/:pullid/">
          <PullRequestPage />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the Breadcrumb', () => {
      expect(
        screen.getByRole('link', {
          name: /test-org/i,
        })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('link', {
          name: /test-repo/i,
        })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('link', {
          name: /pulls/i,
        })
      ).toBeInTheDocument()
    })

    it('renders the PullDetail', () => {
      expect(screen.getByText(/PullDetail/i)).toBeInTheDocument()
    })
  })
})
