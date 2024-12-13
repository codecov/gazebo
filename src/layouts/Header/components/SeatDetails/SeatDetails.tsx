import { useSuspenseQuery as useSuspenseQueryV5 } from '@tanstack/react-queryV5'
import { useParams } from 'react-router'

import { SelfHostedSeatsConfigQueryOpts } from 'services/selfHosted/SelfHostedSeatsConfigQueryOpts'

interface URLParams {
  provider: string
}

function SeatDetails() {
  const { provider } = useParams<URLParams>()
  const { data: selfHostedSeats } = useSuspenseQueryV5(
    SelfHostedSeatsConfigQueryOpts({ provider })
  )

  if (!selfHostedSeats?.seatsUsed || !selfHostedSeats?.seatsLimit) {
    return <p>Unable to get seat usage information</p>
  }

  return (
    <p>
      <span className="font-semibold">{selfHostedSeats?.seatsUsed}</span> active
      users of{' '}
      <span className="font-semibold">{selfHostedSeats?.seatsLimit}</span>{' '}
      available seats
    </p>
  )
}

export default SeatDetails
