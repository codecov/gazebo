import PropTypes from 'prop-types'

import { useSelfHostedSettings } from 'services/selfHosted'

import ActivationLimit from './ActivationLimit'

function ActivationCount() {
  const { data } = useSelfHostedSettings()

  return (
    <div className="mt-4 flex flex-col gap-2 border-2 border-ds-gray-primary p-4">
      <h3 className="font-semibold">Activation count </h3>
      <p>
        <span className="text-lg font-semibold">{data?.seatsUsed}</span> active
        members of{' '}
        <span className="text-lg font-semibold">{data?.seatsLimit}</span>{' '}
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
