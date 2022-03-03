import { useParams } from 'react-router'

import A from 'ui/A'

import LoginButton from './LoginButton'

function getProviderShortName(provider) {
  const providerShortName = {
    gh: 'gh',
    github: 'gh',
    bb: 'bb',
    bitbucket: 'bb',
    gl: 'gl',
    gitlab: 'gl',
  }
  return providerShortName[provider] || null
}

function LoginPage() {
  const { provider } = useParams()
  const providerName = getProviderShortName(provider)

  return (
    <div className="flex flex-col justify-center items-center h-full">
      <h1 className="text-3xl	mb-4">Login to Codecov</h1>
      <p>You’ll be taken to your repo provider to authenticate</p>
      <div className="w-96 mx-auto mt-6">
        <div className="mb-4">
          <hr />
        </div>
        {providerName ? (
          <LoginButton provider={providerName} />
        ) : (
          <div className="space-y-4">
            <LoginButton provider="gh" />
            <LoginButton provider="bb" />
            <LoginButton provider="gl" />
          </div>
        )}
        <div className="my-6">
          <hr />
        </div>
        <p>
          If you are using GitHub Enterprise, GitLab EE/CE, or Bitbucket Server
          please view our <A to={{ pageName: 'enterprise' }}>self hosted</A>{' '}
          option.
        </p>
      </div>
    </div>
  )
}

export default LoginPage
