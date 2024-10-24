import { format, fromUnixTime } from 'date-fns'

export function getScheduleStart(scheduledPhase: {
  quantity: number
  plan: string
  startDate: number
}) {
  const scheduleStart = fromUnixTime(scheduledPhase?.startDate)
  return format(scheduleStart, 'MMMM do yyyy, h:mm aaaa')
}

function ScheduledPlanDetails({
  scheduledPhase,
}: {
  scheduledPhase: {
    quantity: number
    plan: string
    startDate: number
  }
}) {
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

export default ScheduledPlanDetails
