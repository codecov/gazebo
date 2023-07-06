import { useParams } from 'react-router-dom'

import config from 'config'

import ErrorBoundary from 'layouts/shared/ErrorBoundary'
import { useUser } from 'services/user'

import CannyWidget from './Canny/CannyWidget'

const BOARD_TOKEN = config.CANNY_BOARD_TOKEN

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
