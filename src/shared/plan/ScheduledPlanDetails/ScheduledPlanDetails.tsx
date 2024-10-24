import { format, fromUnixTime } from 'date-fns'
import PropType from 'prop-types'

export function getScheduleStart(scheduledPhase: {
  quantity: number
  plan: string
  startDate: number
}) {
  const scheduleStart = fromUnixTime(scheduledPhase?.startDate)
  return format(scheduleStart, 'MMMM do yyyy, h:mm aaaa')
}

function ScheduledPlanDetails({ scheduledPhase }) {
  const { plan, quantity } = scheduledPhase
  const scheduleStart = getScheduleStart(scheduledPhase)

  return (
    <div className="flex flex-col gap-0.5 text-xs">
      <h2 className="font-semibold">Scheduled</h2>
      <p className="text-base font-light text-ds-gray-senary">
        Start date {scheduleStart}
      </p>
      <p className="text-ds-gray-senary">
        {plan} with {quantity} seats
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
