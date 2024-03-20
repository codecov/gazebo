import isEmpty from 'lodash/isEmpty'
import isEqual from 'lodash/isEqual'
import PropTypes from 'prop-types'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { useParams } from 'react-router-dom'

import Table from 'old_ui/Table'
import { useAccountDetails } from 'services/account'
import { useInfiniteUsers } from 'services/users'
import { getOwnerImg } from 'shared/utils'
import { isFreePlan } from 'shared/utils/billing'
import Avatar, { DefaultAuthor } from 'ui/Avatar'
import Spinner from 'ui/Spinner'
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

function _renderUsername({ name, username, user }) {
  return (
    <div className="flex flex-1 flex-row items-center gap-3 truncate">
      <Avatar user={user} />
      {name || username}
    </div>
  )
}

function _renderActivationStatus({
  activated,
  handleActivate,
  maxSeatsReached,
  ownerid,
  student,
}) {
  let disabled = maxSeatsReached
  if (!!student) {
    disabled = false
  }
  const disableToggle = disabled && !activated

  return (
    <Toggle
      dataMarketing="handle-members-activation"
      label={activated ? 'Activated' : 'Non-Active'}
      value={activated}
      onClick={() => {
        handleActivate({ ownerid, activated })
      }}
      disabled={disableToggle}
    />
  )
}

const createTable = ({
  tableData,
  handleActivate,
  provider,
  maxSeatsReached,
}) =>
  tableData?.length > 0
    ? tableData?.map(
        ({ activated, email, isAdmin, name, ownerid, username, student }) => {
          const user = {
            avatarUrl:
              getOwnerImg(provider, username) || DefaultAuthor.AVATAR_URL,
            username: username || DefaultAuthor.USERNAME,
          }

          return {
            username: _renderUsername({ name, username, user }),
            type: <p className="truncate">{isAdmin ? 'Admin' : 'Developer'}</p>,
            email: <p className="truncate">{email}</p>,
            activationStatus: _renderActivationStatus({
              activated,
              handleActivate,
              maxSeatsReached,
              ownerid,
              student,
            }),
          }
        }
      )
    : []

function LoadMoreTrigger({ intersectionRef }) {
  return (
    <span
      ref={intersectionRef}
      className="invisible relative top-[-65px] block leading-[0]"
    >
      Loading
    </span>
  )
}

LoadMoreTrigger.propTypes = {
  intersectionRef: PropTypes.func,
}

function MembersTable({ handleActivate, params }) {
  const [sortBy, setSortBy] = useState([])
  const { owner, provider } = useParams()
  const { ref, inView } = useInView()

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
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, fetchNextPage])

  const handleSort = useCallback(
    (tableSortBy) => {
      if (!isEqual(sortBy, tableSortBy)) {
        if (isEmpty(tableSortBy)) {
          setSortBy(null)
        } else {
          const [{ id, desc }] = tableSortBy
          const { value } = OrderItems.find((iter) => {
            return iter.name === id && iter.desc === desc
          })
          setSortBy(value)
        }
      }
    },
    [sortBy]
  )

  const { data: accountDetails } = useAccountDetails({ owner, provider })
  const maxSeatsReached =
    accountDetails?.activatedUserCount >= accountDetails?.plan?.quantity &&
    !isFreePlan(accountDetails?.plan?.value)

  const tableContent = useMemo(
    () =>
      createTable({
        tableData: data?.results,
        handleActivate,
        provider,
        maxSeatsReached,
      }),
    [data?.results, handleActivate, provider, maxSeatsReached]
  )

  return (
    <>
      <Table data={tableContent} columns={columns} onSort={handleSort} />
      <div className="flex flex-row justify-center">
        {(isLoading || isFetchingNextPage) && <Spinner />}
      </div>
      <LoadMoreTrigger intersectionRef={ref} />
    </>
  )
}

MembersTable.propTypes = {
  handleActivate: PropTypes.func,
  params: PropTypes.object,
  updateParams: PropTypes.func,
}

export default MembersTable
