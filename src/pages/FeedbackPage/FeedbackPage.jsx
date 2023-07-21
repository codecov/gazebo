import { useParams } from 'react-router-dom'

import ErrorBoundary from 'layouts/shared/ErrorBoundary'
import { useUser } from 'services/user'

import CannyWidget from './Canny/CannyWidget'

const BOARD_TOKEN = '0acac6b2-1912-bfa8-cc54-0dac794f7375'

function FeedbackPage() {
  const { data: user } = useUser()
  const { provider } = useParams()

  return (
    <>
      <ErrorBoundary>
        <CannyWidget
          basePath={`/${provider}/feedback`}
          boardToken={BOARD_TOKEN}
          ssoToken={user?.user?.cannySSOToken}
        />
      </ErrorBoundary>
    </>
  )
}

export default FeedbackPage
