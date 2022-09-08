import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'

import { useAccountDetails } from 'services'

import Activation from './Activation'
import AutoActivate from './AutoActivate'

function MemberActivation() {
  const { owner, provider } = useParams()
  const { data: accountDetails } = useAccountDetails({ owner, provider })

  const planAutoActivate = accountDetails?.planAutoActivate

  return (
    <div className="border-2 border-ds-gray-primary">
      <Activation />
      {planAutoActivate !== undefined && (
        <>
          {/* TODO: have this be created dynamically w/ a better parent component */}
          <hr className="mx-4" />
          <AutoActivate planAutoActivate={planAutoActivate} />
        </>
      )}
    </div>
  )
}

MemberActivation.propTypes = {
  activatedUserCount: PropTypes.number,
  planQuantity: PropTypes.number,
}

export default MemberActivation
