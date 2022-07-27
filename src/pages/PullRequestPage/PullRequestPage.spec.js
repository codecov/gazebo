import { render, screen, waitFor } from 'custom-testing-library'

import { MemoryRouter, Route } from 'react-router-dom'

import { usePull } from 'services/pull'

import PullRequestPage from './PullRequestPage'

jest.mock('./Header', () => () => 'Header')
jest.mock('./Summary', () => () => 'CompareSummary')
jest.mock('./Flags', () => () => 'Flags')
jest.mock('./Commits', () => () => 'Commits')

jest.mock('./subroute/Root', () => () => 'Root')

jest.mock('services/pull')

describe('PullRequestPage', () => {
  function setup({
    hasAccess = false,
    initialEntries = ['/gh/test-org/test-repo/pull/12'],
  }) {
    usePull.mockReturnValue({
      hasAccess,
    })

    render(
      <MemoryRouter initialEntries={initialEntries}>
        <Route path="/:provider/:owner/:repo/pull/:pullId" exact={true}>
          <PullRequestPage />
        </Route>
        <Route path="/:provider/:owner/:repo/pull/:pullId/tree/:path">
          <PullRequestPage />
        </Route>
      </MemoryRouter>
    )
  }

  describe.only('show 404 if repo is private and user not part of the org', () => {
    describe('the main breadcrumb', () => {
      beforeEach(() => {
        setup({
          hasAccess: true,
          initialEntries: ['/gh/test-org/test-repo/pull/12'],
        })
      })

      it('renders', () => {
        expect(
          screen.queryByRole('link', {
            name: /test-org/i,
          })
        ).not.toBeInTheDocument()
        expect(
          screen.queryByRole('link', {
            name: /test-repo/i,
          })
        ).not.toBeInTheDocument()
        expect(
          screen.queryByRole('link', {
            name: /pulls/i,
          })
        ).not.toBeInTheDocument()
      })
    })

    describe('root', () => {
      beforeEach(async () => {
        setup({
          hasAccess: true,
          initialEntries: ['/gh/test-org/test-repo/pull/12'],
        })
        await waitFor(() =>
          expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
        )
      })

      it('rendered', () => {
        expect(screen.getByText(/404/i)).toBeInTheDocument()
      })
    })
  })

  describe('the main breadcrumb', () => {
    beforeEach(() => {
      setup({
        hasAccess: false,
        initialEntries: ['/gh/test-org/test-repo/pull/12'],
      })
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
      setup({
        hasAccess: false,
        initialEntries: ['/gh/test-org/test-repo/pull/12'],
      })
      await waitFor(() =>
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
      )
    })

    it('rendered', () => {
      expect(screen.getByText(/Root/i)).toBeInTheDocument()
    })
  })

  describe('compare summary', () => {
    beforeEach(async () => {
      setup({
        hasAccess: false,
        initialEntries: ['/gh/test-org/test-repo/pull/12/tree/App/index.js'],
      })
      await waitFor(() =>
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
      )
    })

    it('renders', () => {
      expect(screen.getByText(/CompareSummary/i)).toBeInTheDocument()
    })
  })

  describe('header', () => {
    beforeEach(async () => {
      setup({
        hasAccess: false,
        initialEntries: ['/gh/test-org/test-repo/pull/12/tree/App/index.js'],
      })
      await waitFor(() =>
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
      )
    })

    it('renders', () => {
      expect(screen.getByText(/Header/i)).toBeInTheDocument()
    })
  })

  describe('flags', () => {
    beforeEach(async () => {
      setup({
        hasAccess: false,
        initialEntries: ['/gh/test-org/test-repo/pull/12/tree/App/index.js'],
      })
      await waitFor(() =>
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
      )
    })

    it('renders', () => {
      expect(screen.getByText(/Flags/i)).toBeInTheDocument()
    })
  })

  describe('commits', () => {
    beforeEach(async () => {
      setup({
        hasAccess: false,
        initialEntries: ['/gh/test-org/test-repo/pull/12/tree/App/index.js'],
      })
      await waitFor(() =>
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
      )
    })

    it('renders', () => {
      expect(screen.getByText(/Commits/i)).toBeInTheDocument()
    })
  })
})
