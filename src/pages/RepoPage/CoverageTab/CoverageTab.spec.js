import { render, screen, waitFor } from 'custom-testing-library'

import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

import { useLocationParams } from 'services/navigation'

import CoverageTab from './CoverageTab'

jest.mock('./subroute/Fileviewer', () => () => 'Fileviewer Component')
jest.mock('./subroute/RepoContents', () => () => 'RepoContents Component')
jest.mock('./Summary', () => () => 'Summary Component')
jest.mock('services/navigation', () => ({
  ...jest.requireActual('services/navigation'),
  useLocationParams: jest.fn(),
}))

describe('Coverage Tab', () => {
  const mockUpdateParams = jest.fn()
  function setup({ initialEntries }) {
    useLocationParams.mockReturnValue({
      params: { search: '' },
      updateParams: mockUpdateParams,
    })

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
      expect(screen.queryByText(/Fileviewer Component/)).not.toBeInTheDocument()
    })
  })

  describe('when rendered with tree+branch on default route returns the root of the project', () => {
    beforeEach(() => {
      setup({ initialEntries: ['/gh/test-org/test-repo/tree/some-branch'] })
    })

    it('renders summary and root tree component', () => {
      expect(screen.getByText(/Summary Component/)).toBeInTheDocument()
      expect(screen.getByText(/RepoContents Component/)).toBeInTheDocument()
      expect(screen.queryByText(/Fileviewer Component/)).not.toBeInTheDocument()
    })
  })

  describe('when rendered with tree+branch route returns the root of that branch', () => {
    beforeEach(() => {
      setup({ initialEntries: ['/gh/test-org/test-repo/tree/main'] })
    })

    it('renders summary and root tree component', () => {
      expect(screen.getByText(/Summary Component/)).toBeInTheDocument()
      expect(screen.getByText(/RepoContents Component/)).toBeInTheDocument()
      expect(screen.queryByText(/Fileviewer Component/)).not.toBeInTheDocument()
    })
  })

  describe('when rendered with tree+branch route on a sub folder', () => {
    beforeEach(() => {
      setup({ initialEntries: ['/gh/test-org/test-repo/tree/master/src'] })
    })

    it('renders summary and root tree component', () => {
      expect(screen.getByText(/Summary Component/)).toBeInTheDocument()
      expect(screen.getByText(/RepoContents Component/)).toBeInTheDocument()
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
        screen.queryByText(/RepoContents Component/)
      ).not.toBeInTheDocument()
    })
  })

  describe.each([
    '/gh/test-org/test-repo/',
    '/gh/test-org/test-repo/tree/main',
    '/gh/test-org/test-repo/tree/master/src',
  ])('update search params after typing on route %s', (entries) => {
    beforeEach(() => {
      setup({ initialEntries: [entries] })
      const searchInput = screen.getByRole('textbox', {
        name: 'Search for files',
      })
      userEvent.type(searchInput, 'file.js')
    })

    it('calls setSearchValue', async () => {
      await waitFor(() => expect(mockUpdateParams).toHaveBeenCalled())
      await waitFor(() =>
        expect(mockUpdateParams).toHaveBeenCalledWith({ search: 'file.js' })
      )
    })
  })
})
