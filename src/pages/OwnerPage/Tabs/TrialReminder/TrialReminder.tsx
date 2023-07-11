import A from 'ui/A/A'

import { useTrialReminderData } from './useTrialReminderData'

const TrialReminder: React.FC = () => {
  const {
    hideComponent,
    trialNotStarted,
    trialOngoing,
    trialExpired,
    dateDiff,
  } = useTrialReminderData()

  if (hideComponent) {
    return null
  } else if (trialNotStarted) {
    return (
      <div className="flex items-center font-semibold">
        {/* this is required because the A component has this random `[x: string]: any` record type on it */}
        {/* @ts-expect-error */}
        <A to={{ pageName: 'planTab' }}>&#128640; Trial Pro Team</A>
      </div>
    )
  } else if (trialOngoing) {
    return (
      <div className="flex items-center">
        <p>
          Trial is active with {dateDiff} days{' '}
          <span className="font-semibold">
            {/* this is required because the A component has this random `[x: string]: any` record type on it */}
            {/* @ts-expect-error */}
            <A to={{ pageName: 'planTab' }}>upgrade</A>
          </span>
        </p>
      </div>
    )
  } else if (trialExpired) {
    return (
      <div className="flex items-center font-semibold">
        {/* this is required because the A component has this random `[x: string]: any` record type on it */}
        {/* @ts-expect-error*/}
        <A to={{ pageName: 'planTab' }}>&#128640; Upgrade plan</A>
      </div>
    )
  } else {
    return null
  }
}

export default TrialReminder
