import { render, screen, waitFor } from 'custom-testing-library'

import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

import {} from 'services/repo'

import Header from './Header'

const mocks = vi.hoisted(() => ({
  useIntersection: vi.fn(),
  useLocationParams: vi.fn(),
  useRepoBackfilled: vi.fn(),
  useRepoFlagsSelect: vi.fn(),
}))

vi.mock('react-use', async () => {
  const actual = await vi.importActual('react-use')
  return {
    ...actual,
    useIntersection: mocks.useIntersection,
  }
})

vi.mock('services/navigation/useLocationParams', async () => {
  const actual = await vi.importActual('services/navigation')
  return {
    ...actual,
    useLocationParams: mocks.useLocationParams,
  }
})

vi.mock('services/repo', async () => {
  const actual = await vi.importActual('services/repo')
  return {
    ...actual,
    useRepoBackfilled: mocks.useRepoBackfilled,
    useRepoFlagsSelect: mocks.useRepoFlagsSelect,
  }
})

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/gazebo/flags']}>
    <Route path="/:provider/:owner/:repo/flags" exact={true}>
      {children}
    </Route>
  </MemoryRouter>
)

describe('Header', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  function setup(setRepoFlags = true) {
    const user = userEvent.setup()
    const updateLocationMock = vi.fn()

    mocks.useLocationParams.mockReturnValue({
      params: { search: '', historicalTrend: '', flags: [] },
      updateParams: updateLocationMock,
    })
    mocks.useRepoBackfilled.mockReturnValue({
      data: { flagsCount: 99 },
    })
    if (setRepoFlags) {
      mocks.useRepoFlagsSelect.mockReturnValue({
        data: [{ name: 'flag1' }],
      })
    }

    return { user, updateLocationMock }
  }

  describe('Configured Flags', () => {
    beforeEach(() => setup())

    it('Renders the label', () => {
      render(<Header />, { wrapper })

      expect(screen.getByText(/Configured flags/)).toBeInTheDocument()
    })
    it('Renders the correct number of flags on the repo', () => {
      render(<Header />, { wrapper })

      expect(screen.getByText(/99/)).toBeInTheDocument()
    })
  })

  describe('Historical Trend', () => {
    describe('Title', () => {
      beforeEach(() => setup())

      it('Renders the label', () => {
        render(<Header />, { wrapper })

        expect(screen.getByText(/Historical trend/)).toBeInTheDocument()
      })
    })

    describe('Select', () => {
      beforeEach(() => setup())

      it('loads the expected list', async () => {
        const { user } = setup()
        render(<Header />, { wrapper })

        const historicalTrend = screen.getByRole('button', {
          name: 'Select Historical Trend',
        })
        await user.click(historicalTrend)

        expect(screen.getByText('Last 6 months')).toBeVisible()
      })

      it('updates the location params on select', async () => {
        const { user, updateLocationMock } = setup()
        render(<Header />, { wrapper })

        const historicalTrend = screen.getByRole('button', {
          name: 'Select Historical Trend',
        })
        await user.click(historicalTrend)

        const item = screen.getByText('Last 7 days')
        await user.click(item)

        expect(updateLocationMock).toHaveBeenCalledWith({
          historicalTrend: 'LAST_7_DAYS',
        })
      })
    })
  })

  describe('Flags feedback link', () => {
    beforeEach(() => setup())

    it('Renders the right copy', () => {
      render(<Header />, { wrapper })

      expect(screen.getByText(/Please drop us a comment/)).toBeInTheDocument()
    })

    it('Renders the right link', () => {
      render(<Header />, { wrapper })

      const link = screen.getByRole('link', {
        name: /here/i,
      })
      expect(link).toBeInTheDocument()
      expect(link.href).toBe(
        'https://github.com/codecov/Codecov-user-feedback/issues/27'
      )
    })
  })

  describe('Show by', () => {
    describe('Title', () => {
      beforeEach(() => setup())

      it('renders the label', () => {
        render(<Header />, { wrapper })

        const showBy = screen.getByText('Show by')
        expect(showBy).toBeInTheDocument()
      })
    })

    describe('MultiSelect', () => {
      describe('on page load', () => {
        it('loads the expected list', async () => {
          const { user } = setup()
          render(<Header />, { wrapper })

          const button = screen.getByText('All flags')
          await user.click(button)

          const flag1 = screen.getByText('flag1')
          expect(flag1).toBeInTheDocument()
        })

        it('updates the location params on select', async () => {
          const { user, updateLocationMock } = setup()
          render(<Header />, { wrapper })

          const button = screen.getByText('All flags')
          await user.click(button)

          const flag1 = screen.getByText('flag1')
          await user.click(flag1)

          expect(updateLocationMock).toHaveBeenCalledWith({
            flags: ['flag1'],
          })
        })
      })

      describe('where onLoadMore is triggered', () => {
        describe('when there is a next page', () => {
          it('calls fetchNextPage', async () => {
            const { user } = setup(false)
            const fetchNextPage = vi.fn()
            mocks.useRepoFlagsSelect.mockReturnValue({
              data: [{ name: 'flag1' }],
              fetchNextPage,
              hasNextPage: true,
            })
            mocks.useIntersection.mockReturnValue({ isIntersecting: true })

            render(<Header />, { wrapper })

            const button = screen.getByText('All flags')
            await user.click(button)

            expect(fetchNextPage).toHaveBeenCalled()
          })
        })

        describe('when there is no next page', () => {
          it('does not calls fetchNextPage', async () => {
            const { user } = setup(false)
            const fetchNextPage = vi.fn()
            mocks.useRepoFlagsSelect.mockReturnValue({
              data: [{ name: 'flag1' }],
              fetchNextPage,
              hasNextPage: false,
            })
            mocks.useIntersection.mockReturnValue({ isIntersecting: true })

            render(<Header />, { wrapper })

            const button = screen.getByText('All flags')
            await user.click(button)

            expect(fetchNextPage).not.toHaveBeenCalled()
          })
        })
      })

      describe('when searching for a flag', () => {
        it('displays the search box', async () => {
          const { user } = setup()
          render(<Header />, { wrapper })

          const button = screen.getByText('All flags')
          await user.click(button)

          const searchBox = screen.getByPlaceholderText('Search for Flags')
          expect(searchBox).toBeInTheDocument()
        })

        it('updates the textbox value when typing', async () => {
          const { user } = setup()
          render(<Header />, { wrapper })

          const button = screen.getByText('All flags')
          await user.click(button)

          const searchBox = screen.getByPlaceholderText('Search for Flags')
          await user.type(searchBox, 'flag2')

          const searchBoxUpdated =
            screen.getByPlaceholderText('Search for Flags')
          expect(searchBoxUpdated).toHaveAttribute('value', 'flag2')
        })

        it('calls useRepoFlagsSelect with term', async () => {
          const { user } = setup()
          render(<Header />, { wrapper })

          const button = screen.getByText('All flags')
          await user.click(button)

          const searchBox = screen.getByPlaceholderText('Search for Flags')
          await user.type(searchBox, 'flag2')

          await waitFor(
            () =>
              expect(mocks.useRepoFlagsSelect).toHaveBeenCalledWith({
                filters: { term: 'flag2' },
                options: { suspense: false },
              }),
            { timeout: 600 }
          )
        })
      })
    })
  })
})
