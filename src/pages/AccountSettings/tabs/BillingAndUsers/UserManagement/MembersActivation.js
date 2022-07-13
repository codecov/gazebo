import { accountDetailsPropType } from 'services/account'
import A from 'ui/A'

const NumberWrapper = ({ children }) => (
  <span className="font-semibold text-lg">{children}</span>
)

function MemberActivation({ accountDetails }) {
  return (
    <div>
      <div className="flex flex-col border-2 border-ds-gray-primary p-4 gap-2 font-light">
        <h3 className="font-semibold">Member activation</h3>
        <p>
          <NumberWrapper>
            {accountDetails?.activatedUserCount || 0}
          </NumberWrapper>{' '}
          active members of{' '}
          <NumberWrapper>{accountDetails?.plan?.quantity || 0}</NumberWrapper>{' '}
          avaialbe seats{' '}
          <A to={{ pageName: 'upgradePlan' }} variant="semibold">
            change plan
          </A>
        </p>
      </div>
    </div>
  )
}

MemberActivation.propTypes = {
  accountDetails: accountDetailsPropType.isRequired,
}

export default MemberActivation
