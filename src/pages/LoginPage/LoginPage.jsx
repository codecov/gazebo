import { useParams } from 'react-router-dom'

import { useLocationParams } from 'services/navigation/useLocationParams'
import { loginProviderToShortName } from 'shared/utils/loginProviders'
import A from 'ui/A'

import LoginButton from './LoginButton'

function LoginPage() {
  const { provider } = useParams()
  const { params } = useLocationParams()
  const providerName = loginProviderToShortName(provider)

  if ('state' in params) {
    localStorage.setItem('sentry-token', params?.state)
  }

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <h1 className="mb-4	text-3xl">Log in to Codecov</h1>
      <p>You&apos;ll be taken to your provider to authenticate</p>
      <div className="mx-auto mt-6 w-96">
        <div className="mb-4">
          <hr />
        </div>
        {providerName ? (
          <LoginButton provider={providerName} />
        ) : (
          <div className="space-y-4">
            <LoginButton provider="gh" />
            <LoginButton provider="sentry" />
            <LoginButton provider="bb" />
            <LoginButton provider="gl" />
          </div>
        )}
        <div className="my-6">
          <hr />
        </div>
        <p>
          If you are using GitHub Enterprise Server, GitLab EE/CE, or Bitbucket
          Server please view our{' '}
          <A to={{ pageName: 'dedicatedEnterpriseCloudGuide' }}>
            Dedicated Enterprise Cloud
          </A>{' '}
          option.
        </p>
      </div>
    </div>
  )
}

export default LoginPage
