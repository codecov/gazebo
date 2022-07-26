import PropTypes from 'prop-types'

import A from 'ui/A'

function MemberActivation({ activatedUserCount, planQuantity }) {
  return (
    <div>
      <div className="flex flex-col border-2 border-ds-gray-primary p-4 gap-2 font-light">
        <h3 className="font-semibold">Member activation</h3>
        <p>
          <span className="font-semibold text-lg">
            {activatedUserCount || 0}
          </span>{' '}
          active members of{' '}
          <span className="font-semibold text-lg">{planQuantity || 0}</span>{' '}
          avaialbe seats{' '}
          <span className="text-xs">
            <A to={{ pageName: 'upgradePlan' }} variant="semibold">
              change plan
            </A>
          </span>
        </p>
      </div>
    </div>
  )
}

MemberActivation.propTypes = {
  activatedUserCount: PropTypes.number,
  planQuantity: PropTypes.number,
}

export default MemberActivation
