import {
  createColumnHelper,
  ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import cs from 'classnames'
import { Fragment, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useBundleAssets } from 'services/bundleAnalysis'
import {
  formatSizeToString,
  formatTimeToString,
} from 'shared/utils/bundleAnalysis'
import Icon from 'ui/Icon'
import Spinner from 'ui/Spinner'

import EmptyTable from './EmptyTable'

import 'ui/FileList/FileList.css'

const isNumericValue = (value: string) =>
  value === 'size' || value === 'loadTime'

interface Column {
  name: string
  extension: string
  size: number
  loadTime: number
}

const columnHelper = createColumnHelper<Column>()

const columns = [
  columnHelper.accessor('name', {
    header: 'Asset',
    cell: ({ getValue, row }) => {
      return (
        <p className="flex flex-row break-all">
          <span
            data-action="clickable"
            data-testid="modules-expand"
            className={cs(
              'inline-flex items-center gap-1 font-sans hover:underline focus:ring-2',
              {
                'text-ds-blue': row.getIsExpanded(),
              }
            )}
            onClick={() => row.toggleExpanded()}
          >
            <Icon
              size="md"
              name={row.getIsExpanded() ? 'chevronDown' : 'chevronRight'}
              variant="solid"
            />
          </span>
          {getValue()}
        </p>
      )
    },
  }),
  columnHelper.accessor('extension', {
    header: 'Type',
    cell: (info) => info.renderValue(),
  }),
  columnHelper.accessor('size', {
    header: 'Size',
    cell: ({ getValue }) => formatSizeToString(getValue()),
  }),
  columnHelper.accessor('loadTime', {
    header: 'Estimated load time (3G)',
    cell: ({ getValue }) => formatTimeToString(getValue()),
  }),
]

interface URLParams {
  provider: string
  owner: string
  repo: string
  branch: string
  bundle: string
}

interface LoaderProps {
  className?: string
}

const Loader = ({ className }: LoaderProps) => (
  <div className={cs('flex justify-center py-4', className)}>
    <Spinner />
  </div>
)

const AssetsTable: React.FC = () => {
  const tableRef = useRef<HTMLDivElement | null>(null)
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const [sorting, setSorting] = useState([{ id: 'size', desc: true }])
  const { provider, owner, repo, branch, bundle } = useParams<URLParams>()

  const { data, isLoading } = useBundleAssets({
    provider,
    owner,
    repo,
    branch,
    bundle,
    opts: { enabled: bundle !== '' },
  })

  const tableData: Array<Column> = useMemo(() => {
    if (data?.assets?.length) {
      return data.assets.map((asset) => ({
        name: asset.name,
        extension: asset.extension,
        size: asset.bundleData.size.uncompress,
        loadTime: asset.bundleData.loadTime.threeG,
      }))
    }

    return []
  }, [data])

  const table = useReactTable({
    columns,
    data: tableData,
    state: {
      sorting,
      expanded,
    },
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  })

  if (data?.assets?.length === 0) {
    return <EmptyTable />
  }

  return (
    <div className="filelistui" data-highlight-row="onHover">
      <div ref={tableRef}>
        {table.getHeaderGroups().map((headerGroup) => (
          <div key={headerGroup.id} className="filelistui-thead">
            {headerGroup.headers.map((header) => {
              return (
                <div
                  key={header.id}
                  data-sortable="true"
                  onClick={header.column.getToggleSortingHandler()}
                  className={cs({
                    'w-8/12': header.column.id === 'name',
                    'w-2/12 justify-end	flex': header.column.id === 'loadTime',
                    'w-1/12 justify-end	flex':
                      header.column.id !== 'name' &&
                      header.column.id !== 'loadTime',
                  })}
                  {...(isNumericValue(header.id)
                    ? {
                        'data-type': 'numeric',
                      }
                    : {})}
                >
                  <div
                    className={cs('flex gap-1 items-center', {
                      'flex-row-reverse justify-end': header.id === 'name',
                    })}
                  >
                    <span
                      className="text-ds-blue-darker"
                      data-sort-direction={header.column.getIsSorted()}
                    >
                      <Icon name="arrowUp" size="sm" />
                    </span>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
        {isLoading ? (
          <Loader />
        ) : (
          <div>
            {table.getRowModel().rows.map((row, i) => {
              const isExpanded = row.getIsExpanded()
              return (
                <Fragment key={row.getValue('name')}>
                  <div
                    className={cs('filelistui-row', {
                      'bg-ds-gray-primary sticky': isExpanded,
                    })}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <div
                        key={cell.id}
                        {...(isNumericValue(cell.column.id)
                          ? {
                              'data-type': 'numeric',
                            }
                          : {})}
                        className={cs({
                          'w-8/12': cell.column.id === 'name',
                          'w-2/12 justify-end	flex':
                            cell.column.id === 'loadTime',
                          'w-1/12 justify-end	flex':
                            cell.column.id !== 'name' &&
                            cell.column.id !== 'loadTime',
                        })}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </div>
                    ))}
                  </div>
                  <div data-expanded={row.getIsExpanded()}>
                    {row.getIsExpanded() ? (
                      <>
                        <p>Modules</p>
                        {/* ~~ Coming Soon ~~ */}
                        {/* <Suspense
                          fallback={<Loader className="bg-ds-gray-secondary" />}
                          key={i}
                        >
                          <ModulesTable
                            asset={row.getValue('name')}
                            branch={branch}
                          />
                        </Suspense> */}
                      </>
                    ) : null}
                  </div>
                </Fragment>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default AssetsTable
