import { useSelfHostedSeatsConfig } from 'services/selfHosted'

function SeatDetails() {
  const { data: selfHostedSeats } = useSelfHostedSeatsConfig({
    suspense: false,
  })

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
