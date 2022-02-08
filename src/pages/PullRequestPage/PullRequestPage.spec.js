import { render, screen, waitFor } from 'custom-testing-library'
import { MemoryRouter, Route } from 'react-router-dom'

import { usePull } from 'services/pull'

import PullRequestPage from './PullRequestPage'

jest.mock('services/pull/hooks')

const pull = {
  pullId: 5,
  title: 'fix stuff',
  state: 'OPEN',
  updatestamp: '2021-03-03T17:54:07.727453',
  author: {
    username: 'landonorris',
  },
}
describe('PullRequestPage', () => {
  function setup({ initialEntries = ['/gh/test-org/test-repo/pull/12'] }) {
    usePull.mockReturnValue({ data: pull })

    render(
      <MemoryRouter initialEntries={initialEntries}>
        <Route path="/:provider/:owner/:repo/pull/:pullid" exact={true}>
          <PullRequestPage />
        </Route>
        <Route path="/:provider/:owner/:repo/pull/:pullid/tree/:path">
          <PullRequestPage />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup({})
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

    it('renders the pr overview', () => {
      expect(
        screen.getByRole('heading', {
          name: /fix stuff/i,
        })
      ).toBeInTheDocument()
      expect(screen.getByText(/open/i)).toBeInTheDocument()
      const userLink = screen.getByRole('link', {
        name: /landonorris/i,
      })
      expect(userLink).toHaveAttribute('href', '/gh/landonorris')
      const prNumber = screen.getByText(/#5/i)
      expect(prNumber).toBeInTheDocument()
    })
  })

  describe('root', () => {
    beforeEach(async () => {
      setup({})
      await waitFor(() =>
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
      )
    })

    it('rendered', () => {
      expect(screen.getByText(/Root/i)).toBeInTheDocument()
    })
  })

  describe('file view', () => {
    beforeEach(async () => {
      setup({
        initialEntries: ['/gh/test-org/test-repo/pull/12/tree/App/index.js'],
      })
      await waitFor(() =>
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
      )
    })

    it('rendered', () => {
      expect(screen.getByText(/App\/index.js/i)).toBeInTheDocument()
    })
  })
})
