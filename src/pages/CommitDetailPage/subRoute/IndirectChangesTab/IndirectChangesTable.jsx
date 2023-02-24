import isNumber from 'lodash/isNumber'
import PropTypes from 'prop-types'
import { Suspense, useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { useCommit } from 'services/commit'
import A from 'ui/A'
import Icon from 'ui/Icon'
import Spinner from 'ui/Spinner'
import Table from 'ui/Table'
import TotalsNumber from 'ui/TotalsNumber'

import CommitFileView from './CommitFileView'

const getFileData = (row, commit) => {
  const headCov = row?.headCoverage?.coverage
  const patchCov = row?.patchCoverage?.coverage
  const baseCov = row?.baseCoverage?.coverage

  const change =
    isNumber(headCov) && isNumber(baseCov) ? headCov - baseCov : Number.NaN

  const hasData = isNumber(headCov) || isNumber(patchCov)

  return {
    headCoverage: headCov,
    patchCoverage: patchCov,
    hasData,
    change,
    headName: row?.headName,
    commit,
  }
}

const table = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    width: 'w-7/12',
    cell: ({ row, getValue }) => (
      <div
        className="flex cursor-pointer items-center gap-2"
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
    ),
    justifyStart: true,
  },
  {
    id: 'coverage',
    header: 'HEAD',
    accessorKey: 'coverage',
    width: 'w-3/12 justify-end',
    cell: (info) => info.getValue(),
  },
  {
    id: 'change',
    header: 'Change',
    accessorKey: 'change',
    width: 'w-2/12 justify-end',
    cell: (info) => info.getValue(),
  },
]

function createTable({ tableData }) {
  if (tableData.length <= 0) {
    return [{ name: null, coverage: null, patch: null, change: null }]
  }

  return tableData.map((row) => {
    const { headName, headCoverage, hasData, change, commit } = row

    return {
      name: (
        <div className="flex flex-col break-all">
          <A
            to={{
              pageName: 'commitFileView',
              options: { commit, tree: headName },
            }}
          >
            {headName}
          </A>
        </div>
      ),
      coverage: <TotalsNumber value={headCoverage} plain />,
      /*
          The container div fot TotalsNumber is added due to the current state of table cells styling,
          shouldn't be necessary in the future if fixed/updated
      */
      change: hasData ? (
        <TotalsNumber value={change} showChange data-testid="change-value" />
      ) : (
        <span className="ml-4 text-sm text-ds-gray-quinary md:whitespace-nowrap">
          No data available
        </span>
      ),
    }
  })
}

const Loader = () => (
  <div className="mb-4 flex justify-center">
    <Spinner size={60} />
  </div>
)

const RenderSubComponent = ({ row }) => {
  const nameColumn = row.getValue('name')
  const file = nameColumn?.props?.children
  const path = file?.props?.children

  return (
    <Suspense fallback={<Loader />}>
      <CommitFileView path={path} />
    </Suspense>
  )
}

RenderSubComponent.propTypes = {
  row: PropTypes.object.isRequired,
}

function IndirectChangesTable() {
  const { provider, owner, repo, commit: commitSHA } = useParams()

  const { data: commitData, isLoading } = useCommit({
    provider,
    owner,
    repo,
    commitid: commitSHA,
    filters: {
      hasUnintendedChanges: true,
    },
  })

  const commit = commitData?.commit
  const indirectChangedFiles = commit?.compareWithParent?.impactedFiles

  const formattedData = useMemo(
    () => indirectChangedFiles.map((row) => getFileData(row, commit)),
    [indirectChangedFiles, commit]
  )
  const tableContent = createTable({ tableData: formattedData })

  if (isLoading || commit?.state === 'pending') return <Loader />

  if (indirectChangedFiles?.length === 0)
    return <p className="m-4">No files covered by tests were changed</p>

  return (
    <Table
      data={tableContent}
      columns={table}
      renderSubComponent={RenderSubComponent}
    />
  )
}

export default IndirectChangesTable
