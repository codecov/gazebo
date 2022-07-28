import { render, screen, waitFor } from 'custom-testing-library'

import userEvent from '@testing-library/user-event'

import { useLocationParams } from 'services/navigation'
import { useRepoFlagsSelect } from 'services/repo/useRepoFlagsSelect'

import Header from './Header'

jest.mock('services/navigation')
jest.mock('services/repo/useRepoFlagsSelect')

describe('Header', () => {
  const updateLocationMock = jest.fn()
  function setup() {
    useLocationParams.mockReturnValue({
      params: { search: '', historicalTrend: '' },
      updateParams: updateLocationMock,
    })
    useRepoFlagsSelect.mockReturnValue({
      data: new Array(99),
    })

    render(<Header />)
  }
  describe('Configured Flags', () => {
    beforeEach(() => {
      setup()
    })

    it('Renders the label', () => {
      expect(screen.getByText(/Configured flags/)).toBeInTheDocument()
    })
    it('Renders the correct number of flags on the repo', () => {
      expect(screen.getByText(/99/)).toBeInTheDocument()
    })
  })

  describe('Historical Trend', () => {
    describe('Title', () => {
      beforeEach(() => {
        setup()
      })

      it('Renders the label', () => {
        expect(screen.getByText(/Historical trend/)).toBeInTheDocument()
      })
    })

    describe('Select', () => {
      beforeEach(() => {
        setup()
        const historicalTrend = screen.getByRole('button', {
          name: 'Select Historical Trend',
        })
        userEvent.click(historicalTrend)
      })

      it('loads the expected list', async () => {
        expect(await screen.findByText('All time')).toBeVisible()
      })
      it('updates the location params on select', async () => {
        await screen.findByText('All time')

        const item = screen.getByText('Last 7 days')
        userEvent.click(item)

        await waitFor(() =>
          expect(updateLocationMock).toHaveBeenCalledWith({
            historicalTrend: 'Last 7 days',
          })
        )
      })
    })
  })

  describe('Search', () => {
    beforeEach(() => {
      setup()
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
})
