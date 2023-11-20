import Icon from 'ui/Icon'
import TopBanner from 'ui/TopBanner'

const SessionExpiredBanner: React.FC = () => {
  return (
    <TopBanner>
      <TopBanner.Start>
        <span className="flex items-center">
          <Icon name="exclamationCircle" />
          <span className="ml-2 font-bold">
            Your session has expired.&nbsp;{' '}
          </span>
          Please log in again to continue.
        </span>
      </TopBanner.Start>
    </TopBanner>
  )
}

export default SessionExpiredBanner
