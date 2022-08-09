import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import FlagsTable from './FlagsTable'
import useRepoFlagsTable from './hooks'

jest.mock('./hooks')

const flagsData = [
  {
    name: 'flag1',
    percentCovered: 93.26,
    percentChange: -1.56,
    measurements: [{ avg: 51.78 }, { avg: 93.356 }],
  },
  {
    name: 'flag2',
    percentCovered: 91.74,
    percentChange: null,
    measurements: [{ avg: null }, { avg: null }],
  },
]

describe('RepoContentsTable', () => {
  const fetchNextPage = jest.fn()
  const handleSort = jest.fn()

  function setup({
    isLoading = false,
    data = flagsData,
    hasNextPage = false,
    isSearching = false,
  } = {}) {
    useRepoFlagsTable.mockReturnValue({
      data,
      isLoading,
      isSearching,
      handleSort,
      hasNextPage,
      fetchNextPage: fetchNextPage,
      isFetchingNextPage: false,
    })

    render(
      <MemoryRouter initialEntries={['/gh/codecov/gazebo/flags']}>
        <Route path="/:provider/:owner/:repo/flags">
          <FlagsTable />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup()
    })

    it('renders table headers', () => {
      expect(screen.getByText('Flags')).toBeInTheDocument()
      expect(screen.getByText('Coverage %')).toBeInTheDocument()
      expect(screen.getByText('Trend')).toBeInTheDocument()
    })

    it('renders repo flags', () => {
      expect(screen.getByText('flag1')).toBeInTheDocument()
      expect(screen.getByText('flag2')).toBeInTheDocument()
    })

    it('renders flags coverage', () => {
      expect(screen.getByText(/93.26%/)).toBeInTheDocument()
      expect(screen.getByText(/91.74%/)).toBeInTheDocument()
    })

    it('renders flags sparkline with change', () => {
      expect(screen.getByText(/Flag flag1 trend sparkline/)).toBeInTheDocument()
      expect(screen.getByText(/-1.56/)).toBeInTheDocument()
      expect(screen.getByText(/Flag flag2 trend sparkline/)).toBeInTheDocument()
      expect(screen.getByText('No Data')).toBeInTheDocument()
    })
  })

  describe('when api is loading', () => {
    beforeEach(() => {
      setup({ isLoading: true })
    })

    it('renders spinner', () => {
      expect(screen.getByTestId('spinner')).toBeInTheDocument()
    })
  })

  describe('when no data is returned', () => {
    it('renders expected empty state message when isSearching is false', () => {
      setup({ data: [] })
      expect(
        screen.getByText(/There was a problem getting flags data/)
      ).toBeInTheDocument()
    })

    it('renders expected empty state message when isSearching is true', () => {
      setup({ data: [], isSearching: true })
      expect(screen.getByText(/No results found/)).toBeInTheDocument()
    })
  })

  describe('when hasNextPage is true', () => {
    beforeEach(() => {
      setup({ hasNextPage: true })
    })

    it('renders load more button', () => {
      expect(screen.getByText(/Load More/)).toBeInTheDocument()
    })
    it('fires next page button click', () => {
      screen.getByText(/Load More/).click()
      expect(fetchNextPage).toHaveBeenCalled()
    })
  })

  describe('when sorting', () => {
    beforeEach(() => {
      setup()
    })

    it('calls handleSort', async () => {
      screen.getByText(/Flags/).click()
      await waitFor(() =>
        expect(handleSort).toHaveBeenLastCalledWith([
          { desc: true, id: 'name' },
        ])
      )
      screen.getByText(/Flags/).click()
      await waitFor(() =>
        expect(handleSort).toHaveBeenLastCalledWith([
          { desc: false, id: 'name' },
        ])
      )
    })
  })
})
