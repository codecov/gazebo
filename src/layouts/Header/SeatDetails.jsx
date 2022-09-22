import { useSelfHostedSeatsConfig } from 'services/selfHosted'

function SeatDetails() {
  const { data: selfHostedSeats } = useSelfHostedSeatsConfig({
    suspense: false,
  })

  if (!selfHostedSeats?.seatsUsed && !selfHostedSeats?.seatsLimit) {
    return null
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
