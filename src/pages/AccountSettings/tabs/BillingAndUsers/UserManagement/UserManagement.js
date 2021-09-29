import PropTypes from 'prop-types'
import Modal from 'ui/Modal'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { FormControls } from './FormControls'
import { FormPaginate } from './FormPaginate'

import Card from 'old_ui/Card'
import Toggle from 'old_ui/Toggle'
import User from 'old_ui/User'
import Button from 'old_ui/Button'

import {
  useLocationParams,
  ApiFilterEnum,
  useNavLinks,
} from 'services/navigation'
import { useAutoActivate, useAccountDetails } from 'services/account'
import { useUsers, useUpdateUser } from 'services/users'
import { getOwnerImg } from 'shared/utils'

const UserManagementClasses = {
  root: 'space-y-4 col-span-2 mb-20 flex-grow', // Select pushes page length out. For now padding
  cardHeader: 'flex justify-between items-center pb-4',
  activateUsers:
    'flex items-center py-2 px-4 shadow rounded-full text-blue-500',
  activateUsersText: 'ml-2',
  title: 'text-2xl font-bold',
  results: 'shadow divide-y divide-gray-200 divide-solid p-6',
  userTable: 'grid grid-cols-5 lg:gap-2 my-6',
  user: 'col-span-4',
  ctaWrapper: 'flex items-center justify-end',
  cta: 'w-full truncate',
}

function useActivateUser({ provider, owner }) {
  const { mutate, ...rest } = useUpdateUser({
    provider,
    owner,
  })

  function activate(ownerid, activated) {
    return mutate({ targetUserOwnerid: ownerid, activated })
  }

  return { activate, ...rest }
}

function createPills({ isAdmin, email, student }) {
  return [
    isAdmin ? { label: 'Admin', highlight: true } : null,
    email,
    student ? 'Student' : null,
  ]
}

function UserManagement({ provider, owner }) {
  // local state is pulled from url params.
  // Defaults are not shown in url.
  const { params, updateParams } = useLocationParams({
    activated: ApiFilterEnum.none, // Default to no filter on activated
    isAdmin: ApiFilterEnum.none, // Default to no filter on isAdmin
    ordering: 'name', // Default sort is A-Z Name
    search: '', // Default to no seach on initial load
    page: 1, // Default to first page
    pageSize: 50, // Default page size
  })
  // Get user API data
  const { data, isSuccess } = useUsers({
    provider,
    owner,
    query: params,
  })
  // Makes the PUT call to activate/deactivate selected user
  const { activate } = useActivateUser({ owner, provider })
  const { mutate: autoActivate } = useAutoActivate({ owner, provider })
  const { data: accountDetails } = useAccountDetails({ owner, provider })
  const { upgradePlan } = useNavLinks()
  const [isOpen, setIsOpen] = useState(false)
  const maxActivatedUsers = 5

  const handleActivate = (user) => {
    if (
      accountDetails.activatedUserCount >= maxActivatedUsers &&
      !user.activated
    ) {
      setIsOpen(true)
    } else {
      activate(user.ownerid, !user.activated)
    }
  }

  return (
    <article className={UserManagementClasses.root}>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Upgrade to Pro"
        body={
          <div className="flex flex-col gap-6">
            <p>
              Your org has activated the maximum number of free users. You’ll
              need to upgrade to Pro to add new seats.
            </p>
          </div>
        }
        footer={
          <div className="flex gap-2">
            <Button
              variant="outline"
              color="gray"
              className="rounded-none"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              Component={Link}
              to={upgradePlan.path()}
              useRouter={!upgradePlan.isExternalLink}
            >
              Upgrade now
            </Button>
          </div>
        }
      />
      <FormControls
        current={params}
        onChange={updateParams}
        defaultValues={{
          search: params.search,
          activated: ApiFilterEnum.none,
          isAdmin: ApiFilterEnum.none,
          ordering: 'name',
        }}
      />
      <Card className={UserManagementClasses.results}>
        <div className={UserManagementClasses.cardHeader}>
          <h2 className={UserManagementClasses.title}>Users</h2>
          <span className={UserManagementClasses.activateUsers}>
            <Toggle
              showLabel={true}
              onClick={() => autoActivate(!accountDetails.planAutoActivate)}
              value={accountDetails.planAutoActivate}
              label="Auto activate users"
              labelClass={UserManagementClasses.activateUsersText}
            />
          </span>
        </div>
        <div>
          {isSuccess &&
            data.results.map((user) => (
              <div
                key={user.username}
                className={UserManagementClasses.userTable}
              >
                <User
                  className={UserManagementClasses.user}
                  username={user.username}
                  name={user.name}
                  avatarUrl={getOwnerImg(provider, user.username)}
                  pills={createPills(user)}
                />
                <div className={UserManagementClasses.ctaWrapper}>
                  <Button
                    data-cy={`activate-${user.ownerid}`}
                    className={UserManagementClasses.cta}
                    color={user.activated ? 'red' : 'blue'}
                    variant={user.activated ? 'outline' : 'normal'}
                    onClick={() => handleActivate(user)}
                  >
                    {user.activated ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </div>
            ))}
        </div>
        <FormPaginate
          totalPages={data.totalPages}
          page={params.page}
          next={data.next}
          previous={data.previous}
          onChange={updateParams}
        />
      </Card>
    </article>
  )
}

UserManagement.propTypes = {
  provider: PropTypes.string.isRequired,
  owner: PropTypes.string.isRequired,
}

export default UserManagement
