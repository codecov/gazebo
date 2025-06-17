import { useParams } from 'react-router'

import { useUser } from 'services/user'
import { Alert } from 'ui/Alert'

interface URLParams {
  owner: string
}

export function PersonalOrgWarning() {
  const { owner } = useParams<URLParams>()
  const { data } = useUser()
  const username = data?.user.username

  if (owner !== username) {
    return null
  }

  return (
    <Alert variant="info">
      <Alert.Title>
        You&apos;re about to upgrade your personal organization:{' '}
        <span className="font-bold">{username}</span>
      </Alert.Title>
      <Alert.Description>
        If you&apos;d like to upgrade a different organization, click on the
        organization selector at the top left of the page.
      </Alert.Description>
    </Alert>
  )
}
