import cs from 'classnames'
import isArray from 'lodash/isArray'
import isEmpty from 'lodash/isEmpty'
import isNumber from 'lodash/isNumber'
import PropTypes from 'prop-types'
import qs from 'qs'
import { lazy, Suspense } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import Table from 'old_ui/Table'
import { useCommit } from 'services/commit'
import { useFlags } from 'shared/featureFlags'
import A from 'ui/A'
import Icon from 'ui/Icon'
import Spinner from 'ui/Spinner'
import TotalsNumber from 'ui/TotalsNumber'

const CommitFileDiff = lazy(() => import('../shared/CommitFileDiff'))

const getFileData = (row, commit) => {
  const headCov = row?.headCoverage?.coverage
  const patchCov = row?.patchCoverage?.coverage
  const baseCov = row?.baseCoverage?.coverage

  let change = Number.NaN
  if (isNumber(headCov) && isNumber(baseCov)) {
    change = headCov - baseCov
  }

  let hasData = false
  if (isNumber(headCov) || isNumber(patchCov)) {
    hasData = true
  }

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
    cell: ({ row, getValue }) => {
      return (
        <div
          className="flex cursor-pointer items-center gap-2"
          data-testid="name-expand"
          onClick={() => row.toggleExpanded()}
        >
          <span
            className={cs({
              'text-ds-blue-darker': row.getIsExpanded(),
              'text-current': !row.getIsExpanded(),
            })}
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
    id: 'patch',
    header: 'Patch',
    accessorKey: 'patch',
    width: 'w-1/12 justify-end',
    cell: (info) => info.getValue(),
  },
  {
    id: 'change',
    header: 'Change',
    accessorKey: 'change',
    width: 'w-1/12 justify-end',
    cell: (info) => info.getValue(),
  },
]

function createTable({ tableData }) {
  return tableData?.map(
    ({ headName, headCoverage, hasData, change, patchCoverage, commit }) => ({
      name: (
        <div className="flex flex-col break-all">
          <A
            to={{
              pageName: 'commitFileDiff',
              options: { commit: commit?.commitid, tree: headName },
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
      patch: <TotalsNumber value={patchCoverage} />,
      change: hasData ? (
        <TotalsNumber value={change} showChange data-testid="change-value" />
      ) : (
        <span className="ml-4 text-sm text-ds-gray-quinary">No data</span>
      ),
    })
  )
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
      <CommitFileDiff path={path} />
    </Suspense>
  )
}

RenderSubComponent.propTypes = {
  row: PropTypes.object.isRequired,
}

function FilesChangedTable() {
  const { provider, owner, repo, commit: commitSha } = useParams()
  const location = useLocation()

  const { commitTabFlagMultiSelect } = useFlags({
    commitTabFlagMultiSelect: false,
  })

  const queryParams = qs.parse(location.search, {
    ignoreQueryPrefix: true,
    depth: 1,
  })

  const flags =
    queryParams?.flags?.length > 0 && commitTabFlagMultiSelect
      ? queryParams?.flags
      : null

  const { data: commitData, isLoading } = useCommit({
    provider,
    owner,
    repo,
    commitid: commitSha,
    filters: {
      hasUnintendedChanges: false,
      flags,
    },
  })

  const commit = commitData?.commit
  if (isLoading || commit?.state === 'pending') {
    return <Loader />
  }

  let filesChanged = []
  if (
    commit?.compareWithParent?.__typename === 'Comparison' &&
    commit?.compareWithParent?.impactedFiles?.__typename === 'ImpactedFiles'
  ) {
    filesChanged = commit?.compareWithParent?.impactedFiles?.results
  }

  if (isEmpty(filesChanged)) {
    if (
      isArray(flags) ||
      (commit?.compareWithParent?.__typename === 'Comparison' &&
        commit?.compareWithParent?.impactedFiles?.__typename === 'UnknownFlags')
    ) {
      return (
        <p className="m-4">
          No files covered by tests and selected flags were changed
        </p>
      )
    }

    return <p className="m-4">No files covered by tests were changed</p>
  }

  const formattedData = filesChanged?.map((row) => getFileData(row, commit))
  const tableContent = createTable({ tableData: formattedData })

  return (
    <Table
      data={tableContent}
      columns={table}
      renderSubComponent={RenderSubComponent}
    />
  )
}

export default FilesChangedTable
