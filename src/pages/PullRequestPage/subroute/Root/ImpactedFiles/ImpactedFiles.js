import { Suspense } from 'react'

import Icon from 'ui/Icon'
import Progress from 'ui/Progress'
import Spinner from 'ui/Spinner'
import Table from 'ui/Table'
import TotalsNumber from 'ui/TotalsNumber'

import useImpactedFilesTable from './hooks'

import FileDiff from '../FileDiff'

const columns = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    width: 'w-7/12 min-w-min',
    cell: ({ row, getValue }) => {
      return (
        <div
          className="flex gap-2 cursor-pointer items-center"
          data-testid="name-expand"
          onClick={() => row.toggleExpanded()}
        >
          <span
            className={
              row.getIsExpanded() ? 'text-ds-blue-darker' : 'text-current'
            }
          >
            <Icon
              size="md"
              name={row.getIsExpanded() ? 'chevron-down' : 'chevron-right'}
              variant="solid"
            />
          </span>
          {getValue()}
        </div>
      )
    },
  },
  {
    id: 'head',
    header: (
      <span className="w-full text-right">
        <span className="font-mono">HEAD</span> file coverage %
      </span>
    ),
    accessorKey: 'head',
    width: 'w-3/12 min-w-min',
    cell: (info) => info.getValue(),
  },
  {
    id: 'patch',
    header: <span className="w-full text-sm text-right">Patch %</span>,
    accessorKey: 'patch',
    width: 'w-28 min-w-min',
    cell: (info) => info.getValue(),
  },
  {
    id: 'change',
    header: <span className="w-full text-right">Change</span>,
    accessorKey: 'change',
    width: 'w-28 min-w-min',
    cell: (info) => info.getValue(),
  },
]

function createTable({ tableData }) {
  return tableData?.length > 0
    ? tableData?.map((row) => {
        const {
          headCoverage,
          patchCoverage,
          changeCoverage,
          hasHeadOrPatchCoverage,
          headName,
          fileName,
        } = row

        return {
          name: (
            <div className="flex flex-col">
              <span className="text-ds-blue">{fileName}</span>
              <span className="text-xs mt-0.5 text-ds-gray-quinary break-all">
                {headName}
              </span>
            </div>
          ),
          head: (
            <div className="flex flex-1 gap-2 items-center">
              <Progress amount={headCoverage} label />
            </div>
          ),
          patch: (
            <div className="w-full flex justify-end">
              <TotalsNumber value={patchCoverage} />
            </div>
          ),
          change: hasHeadOrPatchCoverage ? (
            <div className="w-full flex justify-end">
              <TotalsNumber
                value={changeCoverage}
                showChange
                data-testid="change-value"
              />
            </div>
          ) : (
            <span className="text-ds-gray-quinary text-sm ml-4">
              No data available
            </span>
          ),
        }
      })
    : []
}

const Loader = (
  <div className="flex items-center justify-center py-16">
    <Spinner />
  </div>
)

const renderSubComponent = ({ row }) => {
  const nameColumn = row.getValue('name')
  const [, pathItem] = nameColumn?.props?.children
  const path = pathItem?.props?.children
  // TODO: this component has a nested table and needs to be reworked as it is used inside the Table component, which leads to an accessibilty issue
  return (
    <Suspense fallback={Loader}>
      <FileDiff path={path} />
    </Suspense>
  )
}

function ImpactedFiles() {
  const { data, handleSort } = useImpactedFilesTable()
  const tableContent = createTable({ tableData: data?.impactedFiles })

  return (
    <Table
      data={tableContent}
      columns={columns}
      onSort={handleSort}
      renderSubComponent={renderSubComponent}
    />
  )
}

export default ImpactedFiles
