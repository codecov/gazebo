/* eslint-disable complexity */
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useLocationParams } from 'services/navigation'
import {
  useSelfHostedSettings,
  useSelfHostedUserList,
} from 'services/selfHosted'
import Api from 'shared/api'
import Button from 'ui/Button'
import Table from 'ui/Table'
import Toggle from 'ui/Toggle'

const columns = [
  {
    id: 'userName',
    header: 'User Name',
    accessorKey: 'userName',
    cell: (info) => info.getValue(),
    width: 'w-3/12 min-win-min',
  },
  {
    id: 'type',
    header: () => <span className="flex flex-row grow text-center">Type</span>,
    accessorKey: 'type',
    cell: (info) => info.getValue(),
    width: 'w-2/12 min-win-min',
  },
  {
    id: 'email',
    header: 'email',
    accessorKey: 'email',
    cell: (info) => info.getValue(),
    width: 'w-4/12 min-win-min',
  },
  {
    id: 'activationStatus',
    header: 'Activation Status',
    accessorKey: 'activationStatus',
    cell: (info) => info.getValue(),
    width: 'w-3/12 min-win-min',
  },
]

const createTable = ({ tableData, mutate, disableToggle }) =>
  tableData?.length > 0
    ? tableData?.map(
        ({ activated, email, isAdmin, name, ownerid, username }) => ({
          userName: <p>{name || username}</p>,
          type: <p>{isAdmin ? 'Admin' : 'Developer'}</p>,
          email: <p>{email}</p>,
          activationStatus: (
            <div className="flex flex-row-reverse grow">
              <Toggle
                dataMarketing="handle-members-activation"
                label={activated ? 'Activated' : 'Non-Active'}
                value={activated}
                onClick={() => {
                  mutate({ ownerid, activated: !activated })
                }}
                disabled={!activated && disableToggle}
              />
            </div>
          ),
        })
      )
    : []

function MemberTable() {
  const queryClient = useQueryClient()
  const { data: seatData } = useSelfHostedSettings()
  const disableToggle = seatData?.seatsUsed === seatData?.seatsLimit

  const { params } = useLocationParams({
    activated: undefined,
    isAdmin: undefined,
    search: '',
  })
  const { data, isFetching, hasNextPage, fetchNextPage } =
    useSelfHostedUserList(params)

  const { mutate } = useMutation(
    ({ activated, ownerid }) =>
      Api.patch({ path: `/users/${ownerid}`, body: { activated } }),
    {
      useErrorBoundary: true,
      onSuccess: () => {
        queryClient.invalidateQueries(['SelfHostedSettings'])
        queryClient.invalidateQueries(['Seats'])
        queryClient.invalidateQueries([
          'SelfHostedUserList',
          params?.activated,
          params?.search,
          params?.isAdmin,
        ])
      },
    }
  )

  const tableContent = createTable({ tableData: data, mutate, disableToggle })

  return (
    <>
      <Table data={tableContent} columns={columns} />
      {hasNextPage && (
        <div className="w-full mt-4 flex justify-center">
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
