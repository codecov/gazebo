import {
  useQueryClient as useQueryClientV5,
  useQuery as useQueryV5,
} from '@tanstack/react-queryV5'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { useParams } from 'react-router'

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

type CachedBundle = {
  bundleName: string
  toggleCaching: boolean
}

type SetBundleState = React.Dispatch<React.SetStateAction<CachedBundle[]>>

interface BundleTableProps {
  bundleState: CachedBundle[]
  setBundleState: SetBundleState
}

const BundleTable: React.FC<BundleTableProps> = ({
  bundleState,
  setBundleState,
}) => {
  const tableData = useMemo(() => {
    return bundleState.map(({ bundleName, toggleCaching }) => ({
      bundleName,
      toggleCaching: (
        <Toggle
          dataMarketing="toggle-bundle-cache-status"
          value={toggleCaching}
          label={toggleCaching ? 'Enabled' : 'Disabled'}
          onClick={() => {
            setBundleState((prev) =>
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
  }, [bundleState, setBundleState])

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
  bundleState: CachedBundle[]
  setBundleState: SetBundleState
  isBundlesPending: boolean
}

const BundleCachingModalBody: React.FC<BundleCachingModalBodyProps> = ({
  bundleState,
  setBundleState,
  isBundlesPending,
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
      {isBundlesPending ? (
        <Loader />
      ) : (
        <BundleTable
          bundleState={bundleState}
          setBundleState={setBundleState}
        />
      )}
    </>
  )
}

interface URLParams {
  provider: string
  owner: string
  repo: string
}

interface ConfigureCachedBundleModalProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

export const ConfigureCachedBundleModal = ({
  isOpen,
  setIsOpen,
}: ConfigureCachedBundleModalProps) => {
  const queryClientV5 = useQueryClientV5()
  const { provider, owner, repo } = useParams<URLParams>()
  const [bundleState, setBundleState] = useState<CachedBundle[]>([])

  const { mutate: updateBundleCache, isPending: updateBundleCachePending } =
    useUpdateBundleCache({
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

  const { data: bundleData, isPending: isBundlesPending } = useQueryV5({
    ...CachedBundlesQueryOpts({ provider, owner, repo, branch: defaultBranch }),
    // we can use the select hook to transform the data to the format we want
    select: (data) =>
      data.bundles.map((bundle) => ({
        bundleName: bundle.bundleName,
        toggleCaching: bundle.isCached,
      })),
    enabled: isOpen && !!defaultBranch,
  })

  // if the bundle data is loaded and the bundle state is empty, set the bundle state
  if (bundleData && bundleData.length > 0 && bundleState.length === 0) {
    setBundleState(bundleData)
  }

  const closeModal = () => {
    // this resets the state when the modal is closed
    setBundleState([])
    setIsOpen(false)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => closeModal()}
      title="Configure bundle caching data"
      body={
        <BundleCachingModalBody
          bundleState={bundleState}
          setBundleState={setBundleState}
          isBundlesPending={isBundlesPending}
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
              disabled={updateBundleCachePending || isBundlesPending}
              onClick={() => closeModal()}
            >
              Cancel
            </Button>
            <Button
              hook="save-bundle-caching-modal"
              variant="primary"
              disabled={updateBundleCachePending || isBundlesPending}
              onClick={() => {
                updateBundleCache(bundleState, {
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
  )
}
