import { isEqual } from 'lodash'
import PropTypes from 'prop-types'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useIntersection } from 'react-use'

import { useAccountDetails } from 'services/account'
import { useInfiniteUsers } from 'services/users'
import { getOwnerImg } from 'shared/utils'
import Avatar, { DefaultAuthor } from 'ui/Avatar'
import Spinner from 'ui/Spinner'
import Table from 'ui/Table'
import Toggle from 'ui/Toggle'

import { OrderItems } from '../enums'

const columns = [
  {
    id: 'username',
    header: 'User name',
    accessorKey: 'username',
    cell: (info) => info.getValue(),
    width: 'w-3/12 min-win-min',
    justifyStart: true,
  },
  {
    id: 'type',
    header: () => 'Type',
    accessorKey: 'type',
    cell: (info) => info.getValue(),
    width: 'w-2/12 min-win-min',
    justifyStart: true,
  },
  {
    id: 'email',
    header: 'email',
    accessorKey: 'email',
    cell: (info) => info.getValue(),
    width: 'w-4/12 min-win-min',
    justifyStart: true,
  },
  {
    id: 'activationStatus',
    header: () => <span className="w-full text-right">Activation status</span>,
    accessorKey: 'activationStatus',
    cell: (info) => info.getValue(),
    width: 'w-3/12 min-win-min',
  },
]

const createTable = ({
  tableData,
  handleActivate,
  provider,
  maxSeatsReached,
}) =>
  tableData?.length > 0
    ? tableData?.map(
        // eslint-disable-next-line complexity
        ({ activated, email, isAdmin, name, ownerid, username }) => {
          const user = {
            avatarUrl:
              getOwnerImg(provider, username) || DefaultAuthor.AVATAR_URL,
            username: username || DefaultAuthor.USERNAME,
          }

          return {
            username: (
              <div className="flex flex-row gap-3 items-center truncate">
                <Avatar user={user} />
                {name || username}
              </div>
            ),
            type: <p>{isAdmin ? 'Admin' : 'Developer'}</p>,
            email: <p className="truncate">{email}</p>,
            activationStatus: (
              <div className="flex flex-row-reverse grow">
                <Toggle
                  dataMarketing="handle-members-activation"
                  label={activated ? 'Activated' : 'Non-Active'}
                  value={activated}
                  onClick={() => handleActivate({ ownerid, activated })}
                  disabled={maxSeatsReached && !activated}
                />
              </div>
            ),
          }
        }
      )
    : []

function LoadMoreTrigger({ intersectionRef }) {
  return (
    <>
      <span
        ref={intersectionRef}
        className="relative top-[-65px] invisible block leading-[0]"
      >
        Loading
      </span>
    </>
  )
}

LoadMoreTrigger.propTypes = {
  intersectionRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
}

// eslint-disable-next-line max-statements
function MembersTable({ handleActivate, params }) {
  const [sortBy, setSortBy] = useState([])
  const { owner, provider } = useParams()
  const intersectionRef = useRef(null)
  const intersection = useIntersection(intersectionRef, {
    root: null,
    rootMargin: '0px',
    threshold: 0,
  })

  const { data, hasNextPage, fetchNextPage, isLoading, isFetchingNextPage } =
    useInfiniteUsers(
      {
        provider,
        owner,
        query: {
          ...params,
          ordering: sortBy,
        },
      },
      {
        suspense: false,
      }
    )

  useEffect(() => {
    if (intersection?.isIntersecting && hasNextPage) {
      fetchNextPage()
    }
  }, [intersection?.isIntersecting, hasNextPage, fetchNextPage])

  const handleSort = useCallback(
    (tableSortBy) => {
      if (!isEqual(sortBy, tableSortBy)) {
        const [{ id, desc }] = tableSortBy
        const { value } = OrderItems.find((iter) => {
          return iter.name === id && iter.desc === desc
        })

        setSortBy(value)
      }
    },
    [sortBy]
  )

  const { data: accountDetails } = useAccountDetails({ owner, provider })
  const maxSeatsReached =
    accountDetails?.activatedUserCount >= accountDetails?.plan?.quantity

  const tableContent = useMemo(
    () =>
      createTable({
        tableData: data,
        handleActivate,
        provider,
        maxSeatsReached,
      }),
    [data, handleActivate, provider, maxSeatsReached]
  )

  return (
    <>
      <Table data={tableContent} columns={columns} onSort={handleSort} />
      <div className="flex flex-row justify-center">
        {(isLoading || isFetchingNextPage) && <Spinner />}
      </div>
      <LoadMoreTrigger intersectionRef={intersectionRef} />
    </>
  )
}

MembersTable.propTypes = {
  handleActivate: PropTypes.func,
  params: PropTypes.object,
  updateParams: PropTypes.func,
}

export default MembersTable
