import { useParams } from 'react-router-dom'

import { useImpactedFilesComparison } from 'services/pull'
import { getFilenameFromFilePath } from 'shared/utils/url'
import A from 'ui/A'
import Progress from 'ui/Progress'
import Table from 'ui/Table'
import TotalsNumber from 'ui/TotalsNumber'

const table = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    width: 'w-7/12 min-w-min',
    cell: (info) => info.getValue(),
  },
  {
    id: 'headCoverage',
    header: (
      <span className="w-full text-right">
        <span className="font-mono">HEAD</span> file coverage %
      </span>
    ),
    accessorKey: 'coverage',
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
  if (tableData?.length <= 0) {
    return [{ name: null, coverage: null, patch: null, change: null }]
  }

  return tableData?.map((row) => {
    const {
      headCoverage,
      patchCoverage,
      changeCoverage,
      hasHeadAndPatchCoverage,
      headName,
    } = row

    return {
      name: (
        <div className="flex flex-col">
          <A
            to={{
              pageName: 'commitFile',
              // options: { commit, path: headName },
            }}
          >
            <span>{getFilenameFromFilePath(headName)}</span>
          </A>
          <span className="text-xs mt-0.5 text-ds-gray-quinary">
            {headName}
          </span>
        </div>
      ),
      coverage: (
        <div className="flex flex-1 gap-2 items-center">
          <Progress amount={headCoverage} label />
        </div>
      ),
      patch: (
        <div className="w-full flex justify-end">
          <TotalsNumber value={patchCoverage} />
        </div>
      ),
      change: hasHeadAndPatchCoverage ? (
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
}

function ImpactedFiles() {
  const { provider, owner, repo, pullId } = useParams()
  const { data } = useImpactedFilesComparison({ provider, owner, repo, pullId })
  const tableContent = createTable({ tableData: data })

  return (
    <>
      {data?.length === 0 ? (
        <p className="mx-4">No Files covered by tests were changed</p>
      ) : (
        <Table data={tableContent} columns={table} />
      )}
    </>
  )
}

export default ImpactedFiles
