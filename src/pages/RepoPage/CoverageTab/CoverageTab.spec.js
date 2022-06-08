import { render, screen, waitFor } from 'custom-testing-library'

import { MemoryRouter, Route } from 'react-router-dom'

import CoverageTab from './CoverageTab'

jest.mock('./subroute/Fileviewer', () => () => 'Fileviewer Component')
jest.mock('./Summary', () => () => 'Summary Component')

describe('Coverage Tab', () => {
  function setup({ initialEntries }) {
    render(
      <MemoryRouter initialEntries={initialEntries}>
        <Route path="/:provider/:owner/:repo/tree/:branch/:path+" exact>
          <CoverageTab />
        </Route>
        <Route path="/:provider/:owner/:repo/tree/:branch" exact>
          <CoverageTab />
        </Route>
        <Route path="/:provider/:owner/:repo/blobs/:ref/:path+">
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
      expect(
        screen.getByText(/Root OG Tree Component on the default branch/)
      ).toBeInTheDocument()
      expect(
        screen.queryByText(
          /Root Tree Component Branch switch, this is the root of the projects source/
        )
      ).not.toBeInTheDocument()
      expect(screen.queryByText(/Fileviewer Component/)).not.toBeInTheDocument()
    })
  })

  describe('when rendered with tree+branch on default route returns the root of the project', () => {
    beforeEach(() => {
      setup({ initialEntries: ['/gh/test-org/test-repo/tree/some-branch'] })
    })

    it('renders summary and root tree component', () => {
      expect(screen.getByText(/Summary Component/)).toBeInTheDocument()
      expect(
        screen.getByText(
          /Root Tree Component Branch switch, this is the root of the projects source/
        )
      ).toBeInTheDocument()
      expect(
        screen.queryByText(/Root OG Tree Component on the default branch/)
      ).not.toBeInTheDocument()
      expect(screen.queryByText(/Fileviewer Component/)).not.toBeInTheDocument()
    })
  })

  describe('when rendered with tree+branch route returns the root of that branch', () => {
    beforeEach(() => {
      setup({ initialEntries: ['/gh/test-org/test-repo/tree/main'] })
    })

    it('renders summary and root tree component', () => {
      expect(screen.getByText(/Summary Component/)).toBeInTheDocument()
      expect(
        screen.getByText(
          /Root Tree Component Branch switch, this is the root of the projects source/
        )
      ).toBeInTheDocument()
      expect(
        screen.queryByText(/Root OG Tree Component on the default branch/)
      ).not.toBeInTheDocument()
      expect(screen.queryByText(/Fileviewer Component/)).not.toBeInTheDocument()
    })
  })

  describe('when rendered with tree+branch route on a sub folder', () => {
    beforeEach(() => {
      setup({ initialEntries: ['/gh/test-org/test-repo/tree/master/src'] })
    })

    it('renders summary and root tree component', () => {
      expect(screen.getByText(/Summary Component/)).toBeInTheDocument()
      expect(
        screen.getByText(
          /Tree Component after Clicked including a folder location/
        )
      ).toBeInTheDocument()
      expect(
        screen.queryByText(/Root OG Tree Component on the default branch/)
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
        screen.queryByText(
          /Root Tree Component Branch switch, this is the root of the projects source/
        )
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText(/Root OG Tree Component/)
      ).not.toBeInTheDocument()
    })
  })
})
