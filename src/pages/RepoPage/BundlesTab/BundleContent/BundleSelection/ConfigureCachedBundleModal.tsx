import {
  useQueryClient as useQueryClientV5,
  useSuspenseQuery as useSuspenseQueryV5,
} from '@tanstack/react-queryV5'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  createContext,
  Suspense,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useParams } from 'react-router'
import { z } from 'zod'

import { CachedBundlesQueryOpts } from 'services/bundleAnalysis/CachedBundlesQueryOpts'
import { useUpdateBundleCache } from 'services/bundleAnalysis/useUpdateBundleCache'
import { useRepoOverview } from 'services/repo'
import { renderToast } from 'services/toast'
import { cn } from 'shared/utils/cn'
import { Alert } from 'ui/Alert'
import Button from 'ui/Button'
import Modal from 'ui/Modal'
import Spinner from 'ui/Spinner'
import Toggle from 'ui/Toggle'

const Loader = () => (
  <div className="mb-4 flex justify-center pt-4">
    <Spinner />
  </div>
)

const BundleArrayContentSchema = z.object({
  bundleName: z.string(),
  toggleCaching: z.boolean(),
})

const _ConfigureCacheModalContextSchema = z.array(BundleArrayContentSchema)

type ConfigureCacheModalContextValue = z.infer<
  typeof _ConfigureCacheModalContextSchema
>

const ConfigureCacheModalContext =
  createContext<ConfigureCacheModalContextValue | null>(null)

const columnHelper = createColumnHelper<{
  bundleName: string
  toggleCaching: React.ReactElement
}>()

const columns = [
  columnHelper.accessor('bundleName', {
    header: () => 'Bundle Name',
    cell: ({ renderValue }) => renderValue(),
  }),
  columnHelper.accessor('toggleCaching', {
    header: () => '',
    cell: ({ renderValue }) => renderValue(),
  }),
]

interface URLParams {
  provider: string
  owner: string
  repo: string
}

interface BundleTableProps {
  defaultBranch: string
  setContextState: SetContextState
}

const BundleTable: React.FC<BundleTableProps> = ({
  defaultBranch,
  setContextState,
}) => {
  const context = useContext(ConfigureCacheModalContext)
  const { provider, owner, repo } = useParams<URLParams>()
  const { data } = useSuspenseQueryV5(
    CachedBundlesQueryOpts({ provider, owner, repo, branch: defaultBranch })
  )

  // need this effect to set the context state when the component is mounted
  // so that we don't run into an error trying to set of a parent component
  // while rendering a child component
  useEffect(() => {
    if (context?.length === 0 && data?.bundles) {
      setContextState(
        data.bundles.map((bundle) => ({
          bundleName: bundle.bundleName,
          toggleCaching: bundle.isCached,
        }))
      )
    }
  }, [context?.length, data?.bundles, setContextState])

  const tableData = useMemo(() => {
    // early return if context is not set
    if (!context) return []

    return context?.map(({ bundleName, toggleCaching }) => ({
      bundleName,
      toggleCaching: (
        <Toggle
          dataMarketing="toggle-bundle-cache-status"
          value={toggleCaching}
          label={toggleCaching ? 'Enabled' : 'Disabled'}
          onClick={() => {
            setContextState((prev) =>
              prev.map((item) =>
                item.bundleName === bundleName
                  ? { bundleName, toggleCaching: !toggleCaching }
                  : item
              )
            )
          }}
        />
      ),
    }))
  }, [context, setContextState])

  const table = useReactTable({
    columns,
    data: tableData,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="tableui">
      <table>
        <colgroup>
          <col className="w-full @sm/table:w-6/12" />
          <col className="@sm/table:w-1/12" />
        </colgroup>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} scope="col">
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={cn(
                    cell.column.id === 'toggleCaching' &&
                      'flex w-full flex-row justify-end'
                  )}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

interface BundleCachingModalBodyProps {
  setContextState: SetContextState
  defaultBranch: string
}

const BundleCachingModalBody: React.FC<BundleCachingModalBodyProps> = ({
  setContextState,
  defaultBranch,
}) => {
  return (
    <>
      <Alert>
        <Alert.Title>What is Bundle Caching?</Alert.Title>
        <Alert.Description>
          When bundle data is not uploaded for a commit, we automatically cache
          carry forward the previous bundle data to prevent gaps in your
          reports. This ensures continuity in your analysis even if data is
          missing.
        </Alert.Description>
        <br />
        <Alert.Description>
          Note, if caching is removed trend data will not be available.
        </Alert.Description>
      </Alert>
      <Suspense fallback={<Loader />}>
        <BundleTable
          defaultBranch={defaultBranch}
          setContextState={setContextState}
        />
      </Suspense>
    </>
  )
}

interface ConfigureCachedBundleModalProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

type SetContextState = React.Dispatch<
  React.SetStateAction<ConfigureCacheModalContextValue>
>

export const ConfigureCachedBundleModal = ({
  isOpen,
  setIsOpen,
}: ConfigureCachedBundleModalProps) => {
  const { provider, owner, repo } = useParams<URLParams>()
  const queryClientV5 = useQueryClientV5()
  const [contextState, setContextState] =
    useState<ConfigureCacheModalContextValue>([])

  const { mutate: updateBundleCache, isPending } = useUpdateBundleCache({
    provider,
    owner,
    repo,
  })

  const { data: repoOverview } = useRepoOverview({
    provider,
    owner,
    repo,
  })
  const defaultBranch = repoOverview?.defaultBranch ?? ''

  const closeModal = () => {
    // this resets the context state when the modal is closed
    setContextState([])
    setIsOpen(false)
  }

  return (
    <ConfigureCacheModalContext.Provider value={contextState}>
      <Modal
        isOpen={isOpen}
        onClose={() => closeModal()}
        title="Configure bundle caching data"
        body={
          <BundleCachingModalBody
            setContextState={setContextState}
            defaultBranch={defaultBranch}
          />
        }
        footer={
          <div className="flex flex-1 flex-row items-center justify-between gap-2">
            <div className="text-xs text-gray-500">
              ℹ️ When bundle caching is turned off, to turn it back on,
              you&apos;ll need to upload the bundle report.
            </div>
            <div className="flex items-center gap-2">
              <Button
                hook="cancel-bundle-caching-modal"
                disabled={isPending}
                onClick={() => closeModal()}
              >
                Cancel
              </Button>
              <Button
                hook="save-bundle-caching-modal"
                variant="primary"
                disabled={isPending}
                onClick={() => {
                  updateBundleCache(contextState, {
                    onError: (error) => {
                      // 1. render the error toast
                      renderToast({
                        type: 'error',
                        title: 'Error updating bundle caching',
                        content: `Specify the error: ${error.message}`,
                        options: { duration: 10000, position: 'bottom-left' },
                      })
                    },
                    onSuccess: (bundles) => {
                      // 1. render the success toast
                      renderToast({
                        type: 'success',
                        title: 'Bundle caching updated',
                        content: '',
                        options: { duration: 10000, position: 'bottom-left' },
                      })

                      // 2. update the query data for the cached bundles
                      queryClientV5.setQueryData(
                        CachedBundlesQueryOpts({
                          provider,
                          owner,
                          repo,
                          branch: defaultBranch,
                        }).queryKey,
                        { bundles }
                      )

                      // 3. close the modal
                      closeModal()
                    },
                  })
                }}
              >
                Save
              </Button>
            </div>
          </div>
        }
      />
    </ConfigureCacheModalContext.Provider>
  )
}
