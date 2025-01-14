import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
} from '@tanstack/react-queryV5'
import { render, screen, waitFor, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense, useState } from 'react'
import { toast, Toaster } from 'react-hot-toast'
import { MemoryRouter, Route } from 'react-router'

import { CachedBundlesQueryOpts } from 'services/bundleAnalysis/CachedBundlesQueryOpts'

import { ConfigureCachedBundleModal } from './ConfigureCachedBundleModal'

const mockRepoOverview = {
  owner: {
    isCurrentUserActivated: true,
    repository: {
      __typename: 'Repository',
      private: false,
      defaultBranch: 'main',
      oldestCommitAt: '2022-10-10T11:59:59',
      coverageEnabled: true,
      bundleAnalysisEnabled: true,
      languages: ['typescript'],
      testAnalyticsEnabled: true,
    },
  },
}

const mockBundles = {
  owner: {
    repository: {
      __typename: 'Repository',
      branch: {
        head: {
          bundleAnalysis: {
            bundleAnalysisReport: {
              __typename: 'BundleAnalysisReport',
              bundles: [
                { name: 'bundle1', isCached: true },
                { name: 'bundle2', isCached: false },
              ],
            },
          },
        },
      },
    },
  },
}

const mockParsingError = {
  data: null,
  errors: [{ message: 'Parsing error' }],
}

const MockTestComponent = () => {
  const [isOpen, setIsOpen] = useState(true)
  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>Click me</button>
      <ConfigureCachedBundleModal isOpen={isOpen} setIsOpen={setIsOpen} />
    </div>
  )
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, suspense: true } },
})
const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <QueryClientProviderV5 client={queryClientV5}>
      <MemoryRouter
        initialEntries={['/gh/codecov/test-repo/bundles/main/bundle-1']}
      >
        <Route path="/:provider/:owner/:repo/bundles/:branch/:bundle">
          <Suspense fallback={<p>Loading</p>}>{children}</Suspense>
        </Route>
      </MemoryRouter>
      <Toaster />
    </QueryClientProviderV5>
  </QueryClientProvider>
)

const oldConsoleError = console.error
const server = setupServer()
beforeAll(() => {
  server.listen()

  // we're suppressing the console error because react modal is throwing an error that we don't care about for testing
  console.error = vi.fn()
})

afterEach(() => {
  queryClient.clear()
  queryClientV5.clear()
  server.resetHandlers()

  // need to remove toasts between renders
  toast.remove()
})

afterAll(() => {
  server.close()
  console.error = oldConsoleError
})

interface SetupArgs {
  mutationFails?: boolean
}

describe('ConfigureCachedBundleModal', () => {
  function setup({ mutationFails = false }: SetupArgs) {
    const user = userEvent.setup()
    const mutationInput = vi.fn()

    server.use(
      graphql.query('GetRepoOverview', () => {
        return HttpResponse.json({ data: mockRepoOverview })
      }),
      graphql.query('CachedBundleList', () => {
        return HttpResponse.json({ data: mockBundles })
      }),
      graphql.mutation('UpdateBundleCacheConfig', (info) => {
        mutationInput(info.variables)
        if (mutationFails) {
          return HttpResponse.json(mockParsingError)
        }
        // respond with the same data as the input
        return HttpResponse.json({
          data: {
            updateBundleCacheConfig: {
              results: info.variables.bundles.map(
                (bundle: { bundleName: string; toggleCaching: boolean }) => ({
                  bundleName: bundle.bundleName,
                  isCached: bundle.toggleCaching,
                })
              ),
              error: null,
            },
          },
        })
      })
    )

    return { user, mutationInput }
  }

  describe('rendering modal contents', () => {
    it('renders the title', async () => {
      setup({})
      render(<MockTestComponent />, { wrapper })

      const modalHeader = await screen.findByText(
        'Configure bundle caching data'
      )
      expect(modalHeader).toBeInTheDocument()
    })

    it('renders the body', async () => {
      setup({})
      render(<MockTestComponent />, { wrapper })

      const alertTitle = await screen.findByText('What is Bundle Caching?')
      expect(alertTitle).toBeInTheDocument()

      const alertDescription = await screen.findByText(
        'When bundle data is not uploaded for a commit, we automatically carry forward the previous bundle data to prevent gaps in your reports. This ensures continuity in your analysis even if data is missing.'
      )
      expect(alertDescription).toBeInTheDocument()

      const alertDescription2 = await screen.findByText(
        'Note, if caching is removed trend data will not be available.'
      )
      expect(alertDescription2).toBeInTheDocument()

      const bundleTable = await screen.findByRole('table')
      expect(bundleTable).toBeInTheDocument()

      const bundleRow = await within(bundleTable).findByText('bundle1')
      expect(bundleRow).toBeInTheDocument()
    })

    it('renders the footer', async () => {
      setup({})
      render(<MockTestComponent />, { wrapper })

      const footerText = await screen.findByText(
        "ℹ️ After turning bundle caching on, you'll need to upload a new bundle report."
      )
      expect(footerText).toBeInTheDocument()

      const cancelButton = await screen.findByText('Cancel')
      expect(cancelButton).toBeInTheDocument()

      const saveButton = await screen.findByText('Save')
      expect(saveButton).toBeInTheDocument()
    })
  })

  describe('interacting with the bundles list', () => {
    describe('user can toggle caching', () => {
      it('toggles caching off', async () => {
        const { user } = setup({})
        render(<MockTestComponent />, { wrapper })

        const bundleTable = await screen.findByRole('table')
        expect(bundleTable).toBeInTheDocument()

        const tableRow = await within(bundleTable).findAllByRole('row')
        // header row + 2 data rows
        expect(tableRow).toBeDefined()
        expect(tableRow).toHaveLength(3)

        // ensuring that the table row is found
        assert(tableRow[1], 'Table row not found')

        const toggle = await within(tableRow[1]).findByRole('button')
        expect(toggle).toBeInTheDocument()

        const text = await within(tableRow[1]).findByText('Enabled')
        expect(text).toBeInTheDocument()

        await user.click(toggle)

        await waitFor(() => expect(text).toHaveTextContent('Disabled'))
      })

      it('toggles caching on', async () => {
        const { user } = setup({})
        render(<MockTestComponent />, { wrapper })

        const bundleTable = await screen.findByRole('table')
        expect(bundleTable).toBeInTheDocument()

        const tableRow = await within(bundleTable).findAllByRole('row')
        // header row + 2 data rows
        expect(tableRow).toBeDefined()
        expect(tableRow).toHaveLength(3)

        // ensuring that the table row is found
        assert(tableRow[2] !== undefined, 'Table row not found')

        const toggle = await within(tableRow[2]).findByRole('button')
        expect(toggle).toBeInTheDocument()

        const text = await within(tableRow[2]).findByText('Disabled')
        expect(text).toBeInTheDocument()

        await user.click(toggle)

        await waitFor(() => expect(text).toHaveTextContent('Enabled'))
      })
    })
  })

  describe('interacting with the modal', () => {
    describe('closing the modal', () => {
      it('resets the modal state when closed and re-opened', async () => {
        const { user } = setup({})
        render(<MockTestComponent />, { wrapper })

        const bundleTable = await screen.findByRole('table')
        expect(bundleTable).toBeInTheDocument()

        const tableRow = await within(bundleTable).findAllByRole('row')
        // header row + 2 data rows
        expect(tableRow).toBeDefined()
        expect(tableRow).toHaveLength(3)

        // ensuring that the table row is found
        assert(tableRow[1] !== undefined, 'Table row not found')

        const toggle = await within(tableRow[1]).findByRole('button')
        expect(toggle).toBeInTheDocument()

        const text = await within(tableRow[1]).findByText('Enabled')
        expect(text).toBeInTheDocument()

        await user.click(toggle)

        await waitFor(() => expect(text).toHaveTextContent('Disabled'))

        const closeBtn = await screen.findByLabelText('Close')
        await user.click(closeBtn)

        const modalHeader = screen.queryByText('Configure bundle caching data')
        expect(modalHeader).not.toBeInTheDocument()

        const openModalBtn = await screen.findByText('Click me')
        await user.click(openModalBtn)

        const bundleTable2 = await screen.findByRole('table')
        expect(bundleTable2).toBeInTheDocument()

        const tableRow2 = await within(bundleTable2).findAllByRole('row')
        // header row + 2 data rows
        expect(tableRow2).toBeDefined()
        expect(tableRow2).toHaveLength(3)

        // ensuring that the table row is found
        assert(tableRow2[1] !== undefined, 'Table row not found')

        const toggle2 = await within(tableRow2[1]).findByRole('button')
        expect(toggle2).toBeInTheDocument()

        const text2 = await within(tableRow2[1]).findByText('Enabled')
        expect(text2).toBeInTheDocument()
      })
    })

    describe('cancelling the modal', () => {
      it('resets the modal state when cancelled and re-opened', async () => {
        const { user } = setup({})
        render(<MockTestComponent />, { wrapper })

        const bundleTable = await screen.findByRole('table')
        expect(bundleTable).toBeInTheDocument()

        const tableRow = await within(bundleTable).findAllByRole('row')
        // header row + 2 data rows
        expect(tableRow).toBeDefined()
        expect(tableRow).toHaveLength(3)

        // ensuring that the table row is found
        assert(tableRow[1] !== undefined, 'Table row not found')

        const toggle = await within(tableRow[1]).findByRole('button')
        expect(toggle).toBeInTheDocument()

        const text = await within(tableRow[1]).findByText('Enabled')
        expect(text).toBeInTheDocument()

        await user.click(toggle)

        await waitFor(() => expect(text).toHaveTextContent('Disabled'))

        const cancelButton = await screen.findByText('Cancel')
        await user.click(cancelButton)

        const modalHeader = screen.queryByText('Configure bundle caching data')
        expect(modalHeader).not.toBeInTheDocument()

        const openModalBtn = await screen.findByText('Click me')
        await user.click(openModalBtn)

        const bundleTable2 = await screen.findByRole('table')
        expect(bundleTable2).toBeInTheDocument()

        const tableRow2 = await within(bundleTable2).findAllByRole('row')
        // header row + 2 data rows
        expect(tableRow2).toBeDefined()
        expect(tableRow2).toHaveLength(3)

        // ensuring that the table row is found
        assert(tableRow2[1] !== undefined, 'Table row not found')

        const toggle2 = await within(tableRow2[1]).findByRole('button')
        expect(toggle2).toBeInTheDocument()

        const text2 = await within(tableRow2[1]).findByText('Enabled')
        expect(text2).toBeInTheDocument()
      })
    })

    describe('user saving the modal', () => {
      it('fires the mutation', async () => {
        const { user, mutationInput } = setup({})
        render(<MockTestComponent />, { wrapper })

        const bundleTable = await screen.findByRole('table')
        expect(bundleTable).toBeInTheDocument()

        const saveButton = await screen.findByText('Save')
        await user.click(saveButton)

        expect(mutationInput).toHaveBeenCalledWith({
          owner: 'codecov',
          repo: 'test-repo',
          bundles: [
            { bundleName: 'bundle1', toggleCaching: true },
            { bundleName: 'bundle2', toggleCaching: false },
          ],
        })

        await waitFor(() => expect(queryClientV5.isMutating).toBeTruthy())
      })

      describe('on a successful mutation', () => {
        it('renders the success toast', async () => {
          const { user } = setup({})
          render(<MockTestComponent />, { wrapper })

          const bundleTable = await screen.findByRole('table')
          expect(bundleTable).toBeInTheDocument()

          const saveButton = await screen.findByText('Save')
          await user.click(saveButton)

          const toast = await screen.findByText(/Bundle caching updated/)
          expect(toast).toBeInTheDocument()
        })

        it('updates the query cache', async () => {
          const { user } = setup({})
          render(<MockTestComponent />, { wrapper })

          const bundleTable = await screen.findByRole('table')
          expect(bundleTable).toBeInTheDocument()

          const tableRow = await within(bundleTable).findAllByRole('row')
          // header row + 2 data rows
          expect(tableRow).toBeDefined()
          expect(tableRow).toHaveLength(3)

          const cacheQueryKey = CachedBundlesQueryOpts({
            provider: 'gh',
            owner: 'codecov',
            repo: 'test-repo',
            branch: 'main',
          }).queryKey

          const unmodifiedCache = queryClientV5.getQueryData(cacheQueryKey)
          expect(unmodifiedCache).toEqual({
            bundles: [
              { bundleName: 'bundle1', isCached: true },
              { bundleName: 'bundle2', isCached: false },
            ],
          })

          // ensuring that the table row is found
          assert(tableRow[2] !== undefined, 'Table row not found')

          const toggle = await within(tableRow[2]).findByRole('button')
          expect(toggle).toBeInTheDocument()

          const text = await within(tableRow[2]).findByText('Disabled')
          expect(text).toBeInTheDocument()

          await user.click(toggle)

          const saveButton = await screen.findByText('Save')
          await user.click(saveButton)

          const modifiedCache = queryClientV5.getQueryData(cacheQueryKey)
          expect(modifiedCache).toEqual({
            bundles: [
              { bundleName: 'bundle1', isCached: true },
              { bundleName: 'bundle2', isCached: true },
            ],
          })
        })

        it('closes the modal', async () => {
          const { user } = setup({})
          render(<MockTestComponent />, { wrapper })

          const bundleTable = await screen.findByRole('table')
          expect(bundleTable).toBeInTheDocument()

          const saveButton = await screen.findByText('Save')
          await user.click(saveButton)

          const modal = screen.queryByText('Configure bundle caching data')
          await waitFor(() => expect(modal).not.toBeInTheDocument())
        })
      })

      describe('on a failed mutation', () => {
        it('renders the error toast', async () => {
          const { user } = setup({ mutationFails: true })
          render(<MockTestComponent />, { wrapper })

          const bundleTable = await screen.findByRole('table')
          expect(bundleTable).toBeInTheDocument()

          const saveButton = await screen.findByText('Save')
          await user.click(saveButton)

          const toast = await screen.findByText(/Error updating bundle caching/)
          expect(toast).toBeInTheDocument()
        })
      })
    })
  })
})
