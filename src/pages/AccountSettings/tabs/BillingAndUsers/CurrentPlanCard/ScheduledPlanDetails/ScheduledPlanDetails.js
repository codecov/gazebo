import PropType from 'prop-types'
import { format, fromUnixTime } from 'date-fns'

function getScheduleStart(scheduledPhase) {
  const scheduleStart = fromUnixTime(scheduledPhase?.startDate)
  return format(scheduleStart, 'MMMM do yyyy, h:m aaaa')
}

function ScheduledPlanDetails({ scheduledPhase }) {
  const { plan, quantity } = scheduledPhase
  const scheduleStart = getScheduleStart(scheduledPhase)

  return (
    <div className="flex flex-col gap-0.5">
      <h2 className="font-semibold">Scheduled Details</h2>
      <span>Start Date: {scheduleStart}</span>
      <span className="capitalize">Plan: {plan}</span>
      <span>Seats: {quantity}</span>
      <hr className="my-6" />
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