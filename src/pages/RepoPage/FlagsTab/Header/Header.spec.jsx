import { render, screen, waitFor } from 'custom-testing-library'

import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'
import { MemoryRouter, Route } from 'react-router-dom'
import useIntersection from 'react-use/lib/useIntersection'

import { useLocationParams } from 'services/navigation'
import { useRepoBackfilled, useRepoFlagsSelect } from 'services/repo'

import Header from './Header'

jest.mock('react-use/lib/useIntersection')
jest.mock('services/navigation/useLocationParams')
jest.mock('services/repo/useRepoBackfilled')
jest.mock('services/repo/useRepoFlagsSelect')

beforeAll(() => {
  jest.useFakeTimers()
})
afterAll(() => {
  jest.useRealTimers()
})

describe('Header', () => {
  const updateLocationMock = jest.fn()
  const fetchNextPage = jest.fn()

  function setup(setRepoFlags = true) {
    useLocationParams.mockReturnValue({
      params: { search: '', historicalTrend: '', flags: [] },
      updateParams: updateLocationMock,
    })
    useRepoBackfilled.mockReturnValue({
      data: { flagsCount: 99 },
    })

    if (setRepoFlags) {
      useRepoFlagsSelect.mockReturnValue({
        data: [{ name: 'flag1' }],
      })
    }

    render(
      <MemoryRouter initialEntries={['/gh/codecov/gazebo/flags']}>
        <Route path="/:provider/:owner/:repo/flags" exact={true}>
          <Header />
        </Route>
      </MemoryRouter>
    )
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
        expect(await screen.findByText('Last 6 months')).toBeVisible()
      })

      it('updates the location params on select', async () => {
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

  describe('Flags feedback link', () => {
    beforeEach(() => {
      setup()
    })

    it('Renders the right copy', () => {
      expect(screen.getByText(/Please drop us a comment/)).toBeInTheDocument()
    })
    it('Renders the right link', () => {
      const link = screen.getByRole('link', {
        name: /here/i,
      })
      expect(link).toBeInTheDocument()
      expect(link.href).toBe(
        'https://github.com/codecov/Codecov-user-feedback/issues/27'
      )
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

  describe('Show by', () => {
    describe('Title', () => {
      beforeEach(() => {
        setup()
      })

      it('renders the label', () => {
        const showBy = screen.getByText('Show by')
        expect(showBy).toBeInTheDocument()
      })
    })

    describe('MultiSelect', () => {
      describe('on page load', () => {
        beforeEach(() => {
          setup()
        })

        it('loads the expected list', () => {
          const button = screen.getByText('All flags')
          userEvent.click(button)

          const flag1 = screen.getByText('flag1')
          expect(flag1).toBeInTheDocument()
        })

        it('updates the location params on select', async () => {
          const button = screen.getByText('All flags')
          userEvent.click(button)

          const flag1 = screen.getByText('flag1')
          userEvent.click(flag1)

          await waitFor(() =>
            expect(updateLocationMock).toHaveBeenCalledWith({
              flags: ['flag1'],
            })
          )
        })
      })

      describe('where onLoadMore is triggered', () => {
        describe('when there is a next page', () => {
          beforeEach(() => {
            useRepoFlagsSelect.mockReturnValue({
              data: [{ name: 'flag1' }],
              fetchNextPage,
              hasNextPage: true,
            })
            useIntersection.mockReturnValue({ isIntersecting: true })
            setup(false)
          })

          it('calls fetchNextPage', () => {
            const button = screen.getByText('All flags')
            userEvent.click(button)

            expect(fetchNextPage).toBeCalled()
          })
        })

        describe('when there is no next page', () => {
          beforeEach(() => {
            useRepoFlagsSelect.mockReturnValue({
              data: [{ name: 'flag1' }],
              fetchNextPage,
              hasNextPage: false,
            })
            useIntersection.mockReturnValue({ isIntersecting: true })
            setup(false)
          })

          it('does not calls fetchNextPage', () => {
            const button = screen.getByText('All flags')
            userEvent.click(button)

            expect(fetchNextPage).not.toBeCalled()
          })
        })
      })

      describe('when searching for a flag', () => {
        beforeEach(() => {
          setup()
        })

        it('displays the search box', () => {
          const button = screen.getByText('All flags')
          userEvent.click(button)

          const searchBox = screen.getByPlaceholderText('Search for Flags')
          expect(searchBox).toBeInTheDocument()
        })

        it('updates the textbox value when typing', () => {
          const button = screen.getByText('All flags')
          userEvent.click(button)

          const searchBox = screen.getByPlaceholderText('Search for Flags')
          userEvent.type(searchBox, 'flag2')

          const searchBoxUpdated =
            screen.getByPlaceholderText('Search for Flags')
          expect(searchBoxUpdated).toHaveAttribute('value', 'flag2')
        })

        it('calls useRepoFlagsSelect with term', () => {
          const button = screen.getByText('All flags')
          userEvent.click(button)

          const searchBox = screen.getByPlaceholderText('Search for Flags')
          userEvent.type(searchBox, 'flag2')

          act(() => {
            jest.advanceTimersByTime(5000)
          })

          expect(useRepoFlagsSelect).toBeCalledWith({
            filters: { term: 'flag2' },
            options: { suspense: false },
          })
        })
      })
    })
  })
})
