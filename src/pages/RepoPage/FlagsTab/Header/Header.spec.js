import { render, screen, waitFor } from 'custom-testing-library'

import { within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import useIntersection from 'react-use/lib/useIntersection'

import { useLocationParams } from 'services/navigation'
import { useRepoFlagsSelect } from 'services/repo/useRepoFlagsSelect'

import Header from './Header'

jest.mock('services/navigation')
jest.mock('services/repo/useRepoFlags')
jest.mock('services/repo/useRepoFlagsSelect')
jest.mock('react-use/lib/useIntersection')

describe('Header', () => {
  const updateLocationMock = jest.fn()
  const fetchNextPageMock = jest.fn()
  const defaultFlagsData = [
    { name: 'testing-1' },
    { name: 'testing-2' },
    { name: 'testing-3' },
    { name: 'testing-4' },
  ]
  function setup({
    flagsData,
    selectedFlags = [],
    hasNextPage = false,
    isIntersecting = false,
  } = {}) {
    useLocationParams.mockReturnValue({
      params: { search: '', historicalTrend: '', selectedFlags },
      updateParams: updateLocationMock,
    })
    useRepoFlagsSelect.mockReturnValue({
      data: flagsData,
      flagsCount: 15,
      hasNextPage,
      fetchNextPage: fetchNextPageMock,
      isFetchingNextPage: false,
    })

    useIntersection.mockReturnValue({ isIntersecting })

    render(<Header />)
  }
  describe('Configured Flags', () => {
    beforeEach(() => {
      setup({ flagsData: defaultFlagsData })
    })

    it('Renders the label', () => {
      expect(screen.getByText(/Configured flags/)).toBeInTheDocument()
    })
    it('Renders the correct number of flags on the repo', () => {
      expect(screen.getByText(/15/)).toBeInTheDocument()
    })
  })

  describe('Historical Trend', () => {
    describe('Title', () => {
      beforeEach(() => {
        setup({ flagsData: defaultFlagsData })
      })

      it('Renders the label', () => {
        expect(screen.getByText(/Historical trend/)).toBeInTheDocument()
      })
    })

    describe('Select', () => {
      beforeEach(() => {
        setup({ flagsData: defaultFlagsData })
        const historicalTrend = screen.getByRole('button', {
          name: 'Select Historical Trend',
        })
        userEvent.click(historicalTrend)
      })

      it('loads the expected list', async () => {
        expect(await screen.findByText('Last 6 months')).toBeVisible()
      })

      it('updates the location params on select', async () => {
        await screen.findByText('Last 6 months')
        const item = screen.getByText('Last 7 days')
        userEvent.click(item)

        await waitFor(() =>
          expect(updateLocationMock).toHaveBeenCalledWith({
            historicalTrend: 'LAST_7_DAYS',
          })
        )
      })
    })
  })

  describe('Search', () => {
    beforeEach(() => {
      setup({ flagsData: defaultFlagsData })
      const searchInput = screen.getByRole('textbox', {
        name: 'Search for flags',
      })
      userEvent.type(searchInput, 'flag1')
    })

    it('calls setSearchValue', async () => {
      await waitFor(() => expect(updateLocationMock).toHaveBeenCalled())
      await waitFor(() =>
        expect(updateLocationMock).toHaveBeenCalledWith({ search: 'flag1' })
      )
    })
  })

  describe('Flags Multi-select', () => {
    beforeEach(() => {
      setup({
        flagsData: defaultFlagsData,
        selectedFlags: ['testing-1', 'testing-2'],
      })
    })

    it('shows number of selected flags', async () => {
      expect(screen.getByText('2 selected flags')).toBeInTheDocument()
    })

    describe('when a flag is selected', () => {
      beforeEach(() => {
        const multiSelect = screen.getByText('2 selected flags')
        userEvent.click(multiSelect)
        userEvent.click(screen.getByText('testing-3'))
      })

      it('updates the location params', async () => {
        expect(updateLocationMock).toHaveBeenCalledWith({
          selectedFlags: ['testing-1', 'testing-2', 'testing-3'],
        })
      })

      it('updates the number of selected flags', async () => {
        expect(screen.getByText('3 selected flags')).toBeInTheDocument()
      })
    })

    describe('Multi-select search field', () => {
      beforeEach(() => {
        const multiSelectButton = screen.getByText('2 selected flags')
        userEvent.click(multiSelectButton)
        const multiSelect = screen.getByRole('listbox', {
          name: 'Select flags',
        })
        const searchInput = within(multiSelect).getByRole('textbox', {
          name: 'Search for Flags',
        })
        userEvent.type(searchInput, 'testing-4')
      })

      it('calls setSearchValue', async () => {
        await waitFor(() =>
          expect(useRepoFlagsSelect).toHaveBeenCalledWith({
            filters: { term: 'testing-4' },
            suspense: false,
          })
        )
      })
    })
  })

  describe('Flags Multi-select when there is no flags data', () => {
    beforeEach(() => {
      setup()
      const multiSelect = screen.getByText('All Flags')
      userEvent.click(multiSelect)
    })

    it('renders multi-select dropdown without flags', async () => {
      const multiSelect = screen.getByRole('listbox', {
        name: 'Select flags',
      })
      const searchInput = within(multiSelect).getByRole('textbox', {
        name: 'Search for Flags',
      })

      const allFlagsItem = within(multiSelect).getByText('All Flags')

      expect(searchInput).toBeInTheDocument()
      expect(allFlagsItem).toBeInTheDocument()
      const options = screen.getAllByRole('option')
      expect(options.length).toEqual(1)
    })
  })

  describe('Flags multi-select when hasNextPage is true and isIntersecting is true', () => {
    beforeEach(() => {
      setup({
        flagsData: defaultFlagsData,
        hasNextPage: true,
        isIntersecting: true,
      })
      const multiSelect = screen.getByText('All Flags')
      userEvent.click(multiSelect)
    })

    it('calls fetchNextPage', async () => {
      await waitFor(() => expect(fetchNextPageMock).toHaveBeenCalledWith())
    })
  })

  describe('Flags multi-select when hasNextPage is false and isIntersecting is true', () => {
    beforeEach(() => {
      setup({
        flagsData: defaultFlagsData,
        hasNextPage: false,
        isIntersecting: true,
      })
      const multiSelect = screen.getByText('All Flags')
      userEvent.click(multiSelect)
    })

    it('does not call fetchNextPage', async () => {
      await waitFor(() => expect(fetchNextPageMock).not.toHaveBeenCalledWith())
    })
  })
})
