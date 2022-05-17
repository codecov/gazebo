import { render, screen, waitFor } from 'custom-testing-library'

import { MemoryRouter, Route } from 'react-router-dom'

import PullRequestPage from './PullRequestPage'

jest.mock('./Header', () => () => 'Header')
jest.mock('./Summary', () => () => 'CompareSummary')
jest.mock('./Flags', () => () => 'Flags')
jest.mock('./Commits', () => () => 'Commits')

jest.mock('./subroute/Root', () => () => 'Root')
jest.mock('./subroute/FullFile', () => () => 'FullFile')

describe('PullRequestPage', () => {
  function setup({ initialEntries = ['/gh/test-org/test-repo/pull/12'] }) {
    render(
      <MemoryRouter initialEntries={initialEntries}>
        <Route path="/:provider/:owner/:repo/pull/:pullId" exact={true}>
          <PullRequestPage />
        </Route>
        {/* <Route path="/:provider/:owner/:repo/pull/:pullId/tree/:path">
          <PullRequestPage />
        </Route> */}
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

  // describe('file view', () => {
  //   beforeEach(async () => {
  //     setup({
  //       initialEntries: ['/gh/test-org/test-repo/pull/12'],
  //     })
  //     await waitFor(() =>
  //       expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
  //     )
  //   })

  //   it('rendered', () => {
  //     expect(screen.getByText(/FullFile/i)).toBeInTheDocument()
  //   })
  // })

  describe('compare summary', () => {
    beforeEach(async () => {
      setup({
        initialEntries: ['/gh/test-org/test-repo/pull/12'],
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
        initialEntries: ['/gh/test-org/test-repo/pull/12'],
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
        initialEntries: ['/gh/test-org/test-repo/pull/12'],
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
        initialEntries: ['/gh/test-org/test-repo/pull/12'],
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
