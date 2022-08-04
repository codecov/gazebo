import { useParams } from 'react-router-dom'

import { useAccountDetails } from 'services/account'
import A from 'ui/A'

function Activation() {
  const { owner, provider } = useParams()
  const { data: accountDetails } = useAccountDetails({ owner, provider })

  const activatedUserCount = accountDetails?.activatedUserCount
  const planQuantity = accountDetails?.plan?.quantity

  return (
    <div className="flex flex-col p-4 gap-2">
      <h3 className="font-semibold">Member activation</h3>
      <p>
        <span className="font-semibold text-lg">{activatedUserCount || 0}</span>{' '}
        active members of{' '}
        <span className="font-semibold text-lg">{planQuantity || 0}</span>{' '}
        available seats{' '}
        <span className="text-xs">
          <A to={{ pageName: 'upgradePlan' }} variant="semibold">
            change plan
          </A>
        </span>
      </p>
      {/* TODO: new feature https://www.figma.com/file/iNTJAiBYGem3A4LmI4gvKX/Plan-and-members?node-id=103%3A1696 */}
    </div>
  )
}

export default Activation
