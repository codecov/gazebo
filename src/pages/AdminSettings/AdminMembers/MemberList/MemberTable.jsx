import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import Table from 'old_ui/Table'
import { useLocationParams } from 'services/navigation'
import {
  useSelfHostedSettings,
  useSelfHostedUserList,
} from 'services/selfHosted'
import Api from 'shared/api'
import Button from 'ui/Button'
import Toggle from 'ui/Toggle'

const columns = [
  {
    id: 'userName',
    header: 'User Name',
    accessorKey: 'userName',
    cell: (info) => info.getValue(),
    width: 'w-3/12 min-win-min',
    justifyStart: true,
  },
  {
    id: 'type',
    header: () => <span className="flex grow flex-row text-center">Type</span>,
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
    header: 'Activation Status',
    accessorKey: 'activationStatus',
    cell: (info) => info.getValue(),
    width: 'w-3/12 min-win-min',
  },
]

const createTable = ({ tableData, mutate, seatData }) =>
  tableData?.length > 0
    ? tableData?.map(
        ({ activated, email, isAdmin, name, ownerid, student, username }) => {
          let maxSeats = seatData?.seatsUsed === seatData?.seatsLimit
          if (!!student) {
            maxSeats = false
          }
          const disableToggle = maxSeats && !activated

          return {
            userName: <p>{name || username}</p>,
            type: <p>{isAdmin ? 'Admin' : 'Developer'}</p>,
            email: <p>{email}</p>,
            activationStatus: (
              <Toggle
                dataMarketing="handle-members-activation"
                label={activated ? 'Activated' : 'Non-Active'}
                value={activated}
                onClick={() => {
                  mutate({ ownerid, activated: !activated })
                }}
                disabled={disableToggle}
              />
            ),
          }
        }
      )
    : []

function MemberTable() {
  const { provider } = useParams()
  const queryClient = useQueryClient()
  const { data: seatData } = useSelfHostedSettings()

  const { params } = useLocationParams({
    activated: undefined,
    isAdmin: undefined,
    search: '',
  })
  const { data, isFetching, hasNextPage, fetchNextPage } =
    useSelfHostedUserList(params)

  const { mutate } = useMutation({
    mutationFn: ({ activated, ownerid }) =>
      Api.patch({ path: `/users/${ownerid}`, provider, body: { activated } }),
    useErrorBoundary: true,
    onSuccess: () => {
      queryClient.invalidateQueries(['SelfHostedSettings'])
      queryClient.invalidateQueries(['Seats'])
      queryClient.invalidateQueries(['SelfHostedUserList'])
    },
  })

  const tableContent = useMemo(
    () => createTable({ tableData: data, mutate, seatData }),
    [data, mutate, seatData]
  )

  return (
    <>
      <Table data={tableContent} columns={columns} />
      {hasNextPage && (
        <div className="mt-4 flex w-full justify-center">
          <Button
            hook="load-more"
            isLoading={isFetching}
            onClick={() => fetchNextPage()}
          >
            Load More
          </Button>
        </div>
      )}
    </>
  )
}

export default MemberTable
