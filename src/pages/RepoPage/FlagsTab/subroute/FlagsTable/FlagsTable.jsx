import PropTypes from 'prop-types'
import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useRepoConfig } from 'services/repo/useRepoConfig'
import { determineProgressColor } from 'shared/utils/determineProgressColor'
import Button from 'ui/Button'
import CoverageProgress from 'ui/CoverageProgress'
import Icon from 'ui/Icon'
import Spinner from 'ui/Spinner'
import Table from 'ui/Table'

import DeleteFlagModal from './DeleteFlagModal'
import useRepoFlagsTable from './hooks'
import TableSparkline from './TableEntries/TableSparkline'

const headers = [
  {
    id: 'name',
    header: 'Flags',
    accessorKey: 'name',
    cell: (info) => info.getValue(),
    width: 'w-6/12',
    justifyStart: true,
  },
  {
    id: 'coverage',
    header: <span className="w-full text-right">Coverage %</span>,
    accessorKey: 'coverage',
    cell: (info) => info.getValue(),
    width: 'w-4/12',
    enableSorting: false,
    justifyStart: true,
  },
  {
    id: 'trend',
    header: 'Trend',
    accessorKey: 'trend',
    cell: (info) => info.getValue(),
    width: 'w-4/12',
    enableSorting: false,
  },
  {
    id: 'delete',
    header: '',
    accessorKey: 'delete',
    cell: (info) => info.getValue(),
    width: 'w-1/12',
    enableSorting: false,
  },
]

function createTableData({ tableData, indicationRange, setModalInfo }) {
  return tableData?.length > 0
    ? tableData.map(
        ({ name, percentCovered, percentChange, measurements }) => ({
          name: <span>{name}</span>,
          coverage: (
            <CoverageProgress
              amount={percentCovered}
              color={determineProgressColor({
                coverage: percentCovered,
                ...indicationRange,
              })}
              label
            />
          ),
          trend: (
            <TableSparkline
              measurements={measurements}
              change={percentChange}
              name={name}
            />
          ),
          delete: (
            <button
              data-testid="delete-flag"
              onClick={() => setModalInfo({ flagName: name, showModal: true })}
            >
              <Icon size="md" name="trash" variant="outline" />
            </button>
          ),
        })
      )
    : []
}

const Loader = ({ isLoading }) => {
  return (
    isLoading && (
      <div className="flex flex-1 justify-center">
        <Spinner size={60} />
      </div>
    )
  )
}

Loader.propTypes = {
  isLoading: PropTypes.bool,
}

const getEmptyStateText = ({ isSearching }) =>
  isSearching ? 'No results found' : 'There was a problem getting flags data'

function FlagsTable() {
  const { provider, owner, repo } = useParams()
  const { data: repoConfigData } = useRepoConfig({ provider, owner, repo })
  const [modalInfo, setModalInfo] = useState({
    flagName: null,
    showModal: false,
  })

  const {
    data,
    isLoading,
    handleSort,
    isSearching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useRepoFlagsTable()

  const tableData = useMemo(
    () =>
      createTableData({
        tableData: data,
        indicationRange: repoConfigData?.indicationRange,
        setModalInfo,
      }),
    [data, repoConfigData]
  )

  return (
    <>
      {modalInfo?.showModal && (
        <DeleteFlagModal
          flagName={modalInfo?.flagName}
          closeModal={() => setModalInfo({ flag: null, showModal: false })}
        />
      )}
      <Table data={tableData} columns={headers} onSort={handleSort} />
      <Loader isLoading={isLoading} />
      {tableData?.length === 0 && !isLoading && (
        <p className="flex flex-1 justify-center">
          {getEmptyStateText({ isSearching })}
        </p>
      )}
      {hasNextPage && (
        <div className="mt-4 flex flex-1 justify-center">
          <Button
            hook="load-more"
            isLoading={isFetchingNextPage}
            onClick={fetchNextPage}
          >
            Load More
          </Button>
        </div>
      )}
    </>
  )
}
export default FlagsTable
