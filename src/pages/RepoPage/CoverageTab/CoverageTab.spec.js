import { render, screen, waitFor } from 'custom-testing-library'

import { MemoryRouter, Route } from 'react-router-dom'

import CoverageTab from './CoverageTab'

jest.mock('./subroute/Fileviewer', () => () => 'Fileviewer Component')
jest.mock('./Summary', () => () => 'Summary Component')

describe('Coverage Tab', () => {
  function setup({ initialEntries }) {
    render(
      <MemoryRouter initialEntries={initialEntries}>
        <Route path="/:provider/:owner/:repo/branch/:branch/tree/:path+">
          <CoverageTab />
        </Route>
        <Route path="/:provider/:owner/:repo/branch/:branch/blobs/:path+">
          <CoverageTab />
        </Route>
        <Route path="/:provider/:owner/:repo/branch/:branch/" exact={true}>
          <CoverageTab />
        </Route>
        <Route path="/:provider/:owner/:repo/tree/:path+">
          <CoverageTab />
        </Route>
        <Route path="/:provider/:owner/:repo/blobs/:path+">
          <CoverageTab />
        </Route>
        <Route path="/:provider/:owner/:repo/" exact={true}>
          <CoverageTab />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when rendered with default route', () => {
    beforeEach(() => {
      setup({ initialEntries: ['/gh/test-org/test-repo/'] })
    })

    it('renders summary and root tree component', () => {
      expect(screen.getByText(/Summary Component/)).toBeInTheDocument()
      expect(screen.getByText(/Root OG Tree Component/)).toBeInTheDocument()
      expect(
        screen.queryByText(/Root Tree Component after Clicked/)
      ).not.toBeInTheDocument()
      expect(screen.queryByText(/Fileviewer Component/)).not.toBeInTheDocument()
    })
  })

  describe('when rendered with tree route', () => {
    beforeEach(() => {
      setup({ initialEntries: ['/gh/test-org/test-repo/tree/123'] })
    })

    it('renders summary and root tree component', () => {
      expect(screen.getByText(/Summary Component/)).toBeInTheDocument()
      expect(
        screen.getByText(/Root Tree Component after Clicked/)
      ).toBeInTheDocument()
      expect(
        screen.queryByText(/Root OG Tree Component/)
      ).not.toBeInTheDocument()
      expect(screen.queryByText(/Fileviewer Component/)).not.toBeInTheDocument()
    })
  })

  describe('when rendered with blob route', () => {
    beforeEach(async () => {
      setup({
        initialEntries: ['/gh/test-org/test-repo/blobs/main/path/to/file.js'],
      })
      await waitFor(() =>
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
      )
    })

    it('renders summary and root tree component', () => {
      expect(screen.getByText(/Summary Component/)).toBeInTheDocument()
      expect(screen.getByText(/Fileviewer Component/)).toBeInTheDocument()
      expect(
        screen.queryByText(/Root Tree Component after Clicked/)
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText(/Root OG Tree Component/)
      ).not.toBeInTheDocument()
    })
  })
})
