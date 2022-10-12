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
    pullData = {},
    initialEntries = ['/gh/test-org/test-repo/pull/12'],
  }) {
    usePull.mockReturnValue({
      data: { hasAccess, pull: pullData },
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

  describe('show 404 if repo is private and user not part of the org', () => {
    describe('the main breadcrumb', () => {
      beforeEach(() => {
        setup({
          hasAccess: false,
          initialEntries: ['/gh/test-org/test-repo/pull/12'],
        })
      })

      it('does not render the breadcrumbs', () => {
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
          hasAccess: false,
          initialEntries: ['/gh/test-org/test-repo/pull/12'],
        })
        await waitFor(() =>
          expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
        )
      })

      it('renders a 404', () => {
        expect(screen.getByText(/Error 404/i)).toBeInTheDocument()
      })
    })
  })

  describe('show 404 if no pull request data', () => {
    describe('the main breadcrumb', () => {
      beforeEach(() => {
        setup({
          hasAccess: true,
          pullData: null,
          initialEntries: ['/gh/test-org/test-repo/pull/12'],
        })
      })

      it('does not render the breadcrumbs', () => {
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
          pullData: null,
          initialEntries: ['/gh/test-org/test-repo/pull/12'],
        })
        await waitFor(() =>
          expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
        )
      })

      it('renders a 404', () => {
        expect(screen.getByText(/Error 404/i)).toBeInTheDocument()
      })
    })
  })

  describe('the main breadcrumb', () => {
    beforeEach(() => {
      setup({
        hasAccess: true,
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
        hasAccess: true,
        initialEntries: ['/gh/test-org/test-repo/pull/12'],
      })
      await waitFor(() =>
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
      )
    })

    it('rendered', () => {
      expect(screen.getByText(/Root/i)).toBeInTheDocument()
    })

    it(`Isn't 404ing`, () => {
      expect(screen.queryByText(/Error 404/i)).not.toBeInTheDocument()
    })
  })

  describe('compare summary', () => {
    beforeEach(async () => {
      setup({
        hasAccess: true,
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
        hasAccess: true,
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
        hasAccess: true,
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
        hasAccess: true,
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
