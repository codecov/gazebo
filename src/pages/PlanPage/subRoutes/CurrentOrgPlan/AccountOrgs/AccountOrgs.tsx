import A from 'ui/A'
import { Card } from 'ui/Card'

import { Account } from '../hooks/useEnterpriseAccountDetails'

interface AccountOrgsArgs {
  account: Account
}

export default function AccountOrgs({ account }: AccountOrgsArgs) {
  return (
    <Card>
      <Card.Header>
        <Card.Title size="sm">Account details</Card.Title>
        <Card.Description className="text-sm text-ds-gray-quinary">
          To modify your orgs and seats, please {/* @ts-ignore-error */}
          <A to={{ pageName: 'enterpriseSupport' }}>contact support</A>.
        </Card.Description>
      </Card.Header>
      <Card.Content className="m-0 flex divide-x font-medium">
        <div className="flex-1 p-4">
          <p>Total organizations</p>
          <p className="pt-2 text-xl">{account.organizations.totalCount}</p>
        </div>
        <div className="flex-1 p-4">
          <p>Total seats</p>
          <p className="pt-2 text-xl">{account.totalSeatCount}</p>
        </div>
        <div className="flex-1 p-4">
          <p>Seats remaining</p>
          <p className="pt-2 text-xl">
            {account.totalSeatCount - account.activatedUserCount}
          </p>
        </div>
      </Card.Content>
    </Card>
  )
}
