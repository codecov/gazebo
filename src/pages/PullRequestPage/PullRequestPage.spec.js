import { render, screen, waitFor } from 'custom-testing-library'

import { MemoryRouter, Route } from 'react-router-dom'

import PullRequestPage from './PullRequestPage'

jest.mock('./Header', () => () => 'Header')

jest.mock('./subroute/Root', () => () => 'Root')
jest.mock('./subroute/FileDiff', () => () => 'FileDiff')

describe('PullRequestPage', () => {
  function setup({ initialEntries = ['/gh/test-org/test-repo/pull/12'] }) {
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

  describe('the main breadcrumb', () => {
    beforeEach(() => {
      setup({})
    })

    it('renders', () => {
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
      expect(screen.getByText(/FileDiff/i)).toBeInTheDocument()
    })
  })
})
