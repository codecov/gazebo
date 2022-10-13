import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import Button from 'old_ui/Button'
import Card from 'old_ui/Card'
import User from 'old_ui/User'
import { useAccountDetails } from 'services/account'
import {
  ApiFilterEnum,
  useLocationParams,
  useNavLinks,
} from 'services/navigation'
import { useUser } from 'services/user'
import { useUpdateUser, useUsers } from 'services/users'
import { getOwnerImg } from 'shared/utils'
import { isEnterprisePlan, isFreePlan } from 'shared/utils/billing'
import { formatTimeToNow } from 'shared/utils/dates'
import A from 'ui/A'
import Modal from 'ui/Modal'
import Toggle from 'ui/Toggle'

import FormControls from './FormControls'
import FormPaginate from './FormPaginate'

const UserManagementClasses = {
  root: 'space-y-4 col-span-2 mb-20 grow mt-4', // Select pushes page length out. For now padding
  cardHeader: 'flex justify-between items-center pb-4',
  activateUsers:
    'flex items-center py-2 px-4 shadow rounded-full text-blue-500',
  title: 'text-2xl font-bold',
  results: 'shadow divide-y divide-gray-200 divide-solid p-6',
  userTable: 'grid grid-cols-5 lg:gap-2 my-6',
  user: 'col-span-4',
  ctaWrapper: 'flex items-center justify-end gap-2',
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

function useUsersData({ provider, owner }) {
  const { params, updateParams } = useLocationParams({
    activated: ApiFilterEnum.none, // Default to no filter on activated
    isAdmin: ApiFilterEnum.none, // Default to no filter on isAdmin
    ordering: '-name', // Default sort is A-Z Name
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
  const { data: currentUser } = useUser()

  return {
    params,
    updateParams,
    data,
    isSuccess,
    currentUser: currentUser?.user,
  }
}

function createPills({ isAdmin, email, student, lastPullTimestamp }) {
  return [
    isAdmin ? { label: 'Admin', highlight: true } : null,
    email,
    student ? 'Student' : null,
    lastPullTimestamp ? `last PR: ${formatTimeToNow(lastPullTimestamp)}` : null,
  ]
}

function MembersList() {
  const { owner, provider } = useParams()
  const { params, updateParams, data, isSuccess } = useUsersData({
    provider,
    owner,
  })
  const { activate } = useActivateUser({ owner, provider })
  const { data: accountDetails } = useAccountDetails({ owner, provider })
  const { upgradePlan } = useNavLinks()
  const [isOpen, setIsOpen] = useState(false)

  const maxActivatedUsers = 5
  const isEnterprise = isEnterprisePlan(accountDetails?.plan?.value) || false

  const handleActivate = (user) => {
    if (
      accountDetails?.activatedUserCount >= maxActivatedUsers &&
      !user.activated &&
      isFreePlan(accountDetails?.plan?.value)
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
            <p>
              <span className="font-semibold">Need help upgrading? </span>
              <A to={{ pageName: 'sales' }}>Contact</A> our sales team today!
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
          ordering: '-name',
        }}
        isEnterprisePlan={isEnterprise}
      />
      <Card className={UserManagementClasses.results}>
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
                  pills={createPills({ ...user })}
                />
                <div className={UserManagementClasses.ctaWrapper}>
                  <Toggle
                    hook="handle-members-activation"
                    label={user.activated ? 'Activated' : 'Not yet activated'}
                    value={user.activated}
                    onClick={() => handleActivate(user)}
                  />
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

export default MembersList
