import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import FlagMultiSelect from './FlagMultiSelect'

const mocks = vi.hoisted(() => ({
  useIntersection: vi.fn(),
}))

vi.mock('react-use', async () => {
  const actual = await vi.importActual('react-use')
  return {
    ...actual,
    useIntersection: mocks.useIntersection,
  }
})

const mockRepoSettings = (isPrivate) => ({
  owner: {
    isCurrentUserPartOfOrg: true,
    repository: {
      __typename: 'Repository',
      activated: true,
      defaultBranch: 'main',
      private: isPrivate,
      uploadToken: 'token',
      graphToken: 'token',
      yaml: 'yaml',
      bot: {
        username: 'test',
      },
    },
  },
})

const mockFirstResponse = {
  owner: {
    repository: {
      __typename: 'Repository',
      coverageAnalytics: {
        flags: {
          edges: [
            {
              node: {
                name: 'flag-1',
              },
            },
          ],
          pageInfo: {
            hasNextPage: true,
            endCursor: '1-flag-1',
          },
        },
      },
    },
  },
}

const mockSecondResponse = {
  owner: {
    repository: {
      __typename: 'Repository',
      coverageAnalytics: {
        flags: {
          edges: [
            {
              node: {
                name: 'flag-2',
              },
            },
          ],
          pageInfo: {
            hasNextPage: false,
            endCursor: null,
          },
        },
      },
    },
  },
}

const mockBackfillHasFlagsAndActive = {
  config: {
    isTimescaleEnabled: true,
  },
  owner: {
    repository: {
      __typename: 'Repository',
      coverageAnalytics: {
        flagsMeasurementsActive: true,
        flagsMeasurementsBackfilled: true,
        flagsCount: 4,
      },
    },
  },
}

const mockBackfillTimeScaleDisabled = {
  config: {
    isTimescaleEnabled: false,
  },
  owner: {
    repository: {
      __typename: 'Repository',
      coverageAnalytics: {
        flagsMeasurementsActive: true,
        flagsMeasurementsBackfilled: true,
        flagsCount: 4,
      },
    },
  },
}

const mockBackfillNoFlagsPresent = {
  config: {
    isTimescaleEnabled: true,
  },
  owner: {
    repository: {
      __typename: 'Repository',
      coverageAnalytics: {
        flagsMeasurementsActive: true,
        flagsMeasurementsBackfilled: true,
        flagsCount: 0,
      },
    },
  },
}

const mockBackfillFlagMeasureNotActive = {
  config: {
    isTimescaleEnabled: true,
  },
  owner: {
    repository: {
      __typename: 'Repository',
      coverageAnalytics: {
        flagsMeasurementsActive: false,
        flagsMeasurementsBackfilled: true,
        flagsCount: 4,
      },
    },
  },
}

const queryClient = new QueryClient()
const server = setupServer()

let testLocation
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/cool-repo']}>
      <Route path="/:provider/:owner/:repo">{children}</Route>
      <Route
        path="*"
        render={({ location }) => {
          testLocation = location
          return null
        }}
      />
    </MemoryRouter>
  </QueryClientProvider>
)

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClient.clear()
  server.restoreHandlers()
})

afterAll(() => {
  server.close()
})

describe('FlagMultiSelect', () => {
  function setup(
    {
      isIntersecting = false,
      noNextPage = false,
      backfillData = mockBackfillHasFlagsAndActive,
      isTeamPlan = false,
      isPrivate = false,
    } = {
      isIntersecting: false,
      noNextPage: false,
      mockBackfillHasFlagsAndActive: mockBackfillHasFlagsAndActive,
      isTeamPlan: false,
      isPrivate: false,
    }
  ) {
    const user = userEvent.setup()
    const mockApiVars = vi.fn()

    mocks.useIntersection.mockReturnValue({ isIntersecting: isIntersecting })

    server.use(
      graphql.query('FlagsSelect', (info) => {
        mockApiVars(info.variables)

        if (!!info.variables?.after || noNextPage) {
          return HttpResponse.json({ data: mockSecondResponse })
        }

        return HttpResponse.json({ data: mockFirstResponse })
      }),
      graphql.query('BackfillFlagMemberships', () => {
        return HttpResponse.json({ data: backfillData })
      }),
      graphql.query('IsTeamPlan', () => {
        return HttpResponse.json({
          data: { owner: { plan: { isTeamPlan } } },
        })
      }),
      graphql.query('GetRepoSettingsTeam', () => {
        return HttpResponse.json({ data: mockRepoSettings(isPrivate) })
      })
    )

    return { user, mockApiVars }
  }

  describe('when selecting a flag', () => {
    it('updates the location params', async () => {
      const { user } = setup({})

      render(<FlagMultiSelect />, { wrapper })

      const select = await screen.findByRole('button', {
        name: 'Select flags to show',
      })
      expect(select).toBeInTheDocument()

      await waitFor(() => expect(select).not.toHaveAttribute('disabled'))
      await user.click(select)

      const flag1 = await screen.findByText('flag-1')
      expect(flag1).toBeInTheDocument()
      await user.click(flag1)

      expect(testLocation?.state).toStrictEqual({
        search: '',
        flags: ['flag-1'],
      })
    })
  })

  describe('when onLoadMore is triggered', () => {
    describe('when there is a next page', () => {
      it('calls fetchNextPage', async () => {
        const { user } = setup({ isIntersecting: true })

        render(<FlagMultiSelect />, { wrapper })

        const select = await screen.findByText('All flags')
        expect(select).toBeInTheDocument()
        await user.click(select)

        const flag1 = await screen.findByText('flag-1')
        expect(flag1).toBeInTheDocument()

        const flag2 = await screen.findByText('flag-2')
        expect(flag2).toBeInTheDocument()
      })
    })

    describe('there is not a next page', () => {
      it('does not call fetch next page', async () => {
        const { user } = setup({
          isIntersecting: true,
          noNextPage: true,
        })

        render(<FlagMultiSelect />, { wrapper })

        const select = await screen.findByText('All flags')
        expect(select).toBeInTheDocument()
        await user.click(select)

        const flag2 = await screen.findByText('flag-2')
        expect(flag2).toBeInTheDocument()
      })
    })
  })

  describe('when searching for a flag', () => {
    it('updates the text box', async () => {
      const { user } = setup({})

      render(<FlagMultiSelect />, { wrapper })

      const select = await screen.findByText('All flags')
      expect(select).toBeInTheDocument()
      await user.click(select)

      const searchBox = screen.getByPlaceholderText('Search for Flags')
      await user.type(searchBox, 'flag2')

      const searchBoxUpdated = screen.getByPlaceholderText('Search for Flags')
      expect(searchBoxUpdated).toHaveAttribute('value', 'flag2')
    })

    it('calls the api with search term', async () => {
      const { user, mockApiVars } = setup({})

      render(<FlagMultiSelect />, { wrapper })

      const select = await screen.findByText('All flags')
      expect(select).toBeInTheDocument()
      await user.click(select)

      const searchBox = screen.getByPlaceholderText('Search for Flags')
      await user.type(searchBox, 'flag2')

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      await waitFor(() =>
        expect(mockApiVars).toHaveBeenCalledWith({
          owner: 'codecov',
          repo: 'cool-repo',
          filters: { term: 'flag2' },
        })
      )
    })
  })

  describe('when flag count is zero', () => {
    it('does not show multi select', async () => {
      setup({ backfillData: mockBackfillNoFlagsPresent })

      const { container } = render(<FlagMultiSelect />, { wrapper })

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      await waitFor(() => expect(container).toBeEmptyDOMElement())
    })
  })

  describe('when on team plan', () => {
    describe('repo is public', () => {
      it('renders multi select', async () => {
        setup({
          isTeamPlan: true,
          isPrivate: false,
        })
        render(<FlagMultiSelect />, { wrapper })

        const select = await screen.findByText('All flags')
        expect(select).toBeInTheDocument()
      })
    })

    describe('repo is private', () => {
      it('does not show multi select', async () => {
        setup({ isTeamPlan: true, isPrivate: true })
        const { container } = render(<FlagMultiSelect />, { wrapper })

        await waitFor(() => queryClient.isFetching)
        await waitFor(() => !queryClient.isFetching)

        await waitFor(() => expect(container).toBeEmptyDOMElement())
      })
    })
  })

  describe('when timescale is disabled', () => {
    it('renders disabled multi select', async () => {
      setup({ backfillData: mockBackfillTimeScaleDisabled })

      render(<FlagMultiSelect />, { wrapper })

      const select = await screen.findByRole('button')
      expect(select).toBeInTheDocument()
      expect(select).toBeDisabled()
    })
  })

  describe('when no flag measurement are not active', () => {
    it('renders disabled multi select', async () => {
      setup({
        backfillData: mockBackfillFlagMeasureNotActive,
      })

      render(<FlagMultiSelect />, { wrapper })

      const select = await screen.findByRole('button')
      expect(select).toBeInTheDocument()
      expect(select).toBeDisabled()
    })
  })
})
