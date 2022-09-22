import PropTypes from 'prop-types'

import { useSelfHostedSettings } from 'services/selfHosted'

import ActivationLimit from './ActivationLimit'

function ActivationCount() {
  const { data } = useSelfHostedSettings()

  return (
    <div className="flex flex-col p-4 gap-2 border-2 border-ds-gray-primary mt-4">
      <h3 className="font-semibold">Activation count </h3>
      <p>
        <span className="font-semibold text-lg">{data?.seatsUsed}</span> active
        members of{' '}
        <span className="font-semibold text-lg">{data?.seatsLimit}</span>{' '}
        available seats
      </p>
      {data?.seatsUsed === data?.seatsLimit && <ActivationLimit />}
    </div>
  )
}

ActivationCount.propTypes = {
  seatsUsed: PropTypes.number,
  seatsLimit: PropTypes.number,
}

export default ActivationCount
