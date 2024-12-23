import { useSuspenseQuery as useSuspenseQueryV5 } from '@tanstack/react-queryV5'
import { useParams } from 'react-router'

import { SelfHostedSettingsQueryOpts } from 'services/selfHosted/SelfHostedSettingsQueryOpts'

import ActivationLimit from './ActivationLimit'

interface URLParams {
  provider: string
}

function ActivationCount() {
  const { provider } = useParams<URLParams>()
  const { data } = useSuspenseQueryV5(SelfHostedSettingsQueryOpts({ provider }))

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

export default ActivationCount
