import { isTeamPlan } from 'shared/utils/billing'

import ProPrice from './ProPrice'
import TeamPrice from './TeamPrice'

interface TotalPriceCalloutProps {
  newPlan: string
  seats: number
  setValue: (x: string, y: string) => void
}

const TotalPriceCallout: React.FC<TotalPriceCalloutProps> = ({
  newPlan,
  seats,
  setValue,
}) => {
  if (isTeamPlan(newPlan)) {
    return <TeamPrice newPlan={newPlan} seats={seats} setValue={setValue} />
  }

  return <ProPrice newPlan={newPlan} seats={seats} setValue={setValue} />
}

export default TotalPriceCallout
