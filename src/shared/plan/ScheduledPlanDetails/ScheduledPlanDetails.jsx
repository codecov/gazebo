import { format, fromUnixTime } from 'date-fns'
import PropType from 'prop-types'

function getScheduleStart(scheduledPhase) {
  const scheduleStart = fromUnixTime(scheduledPhase?.startDate)
  return format(scheduleStart, 'MMMM do yyyy, h:m aaaa')
}

function ScheduledPlanDetails({ scheduledPhase }) {
  const { plan, quantity } = scheduledPhase
  const scheduleStart = getScheduleStart(scheduledPhase)

  return (
    <div className="flex flex-col gap-0.5 text-xs">
      <h2 className="font-semibold">Scheduled Details</h2>
      <p className="text-ds-gray-senary">
        Start date {scheduleStart} {plan} with {quantity} seats
      </p>
    </div>
  )
}

ScheduledPlanDetails.propTypes = {
  scheduledPhase: PropType.shape({
    quantity: PropType.number.isRequired,
    plan: PropType.string.isRequired,
    startDate: PropType.number.isRequired,
  }),
}

export default ScheduledPlanDetails
