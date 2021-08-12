import { useParams } from 'react-router'

function LoginPage() {
  const { provider } = useParams()

  const buttonPerProvider = {
    gh: <a href="http://localhost/login/gh">Login with Github</a>,
    github: <a href="http://localhost/login/gh">Login with Github</a>,
    bb: <a href="http://localhost/login/bb">Login with Bitbucket</a>,
    bitbucket: <a href="http://localhost/login/bb">Login with Bitbucket</a>,
    gl: <a href="http://localhost/login/gl">Login with Gitlab</a>,
    gitlab: <a href="http://localhost/login/gl">Login with Gitlab</a>,
  }

  // only show the right provider button if the url is /login/gh for example, otherwise show all three providers
  const allProviderButtons = [
    buttonPerProvider.gh,
    buttonPerProvider.bb,
    buttonPerProvider.gl,
  ]
  const providersToShow =
    provider && buttonPerProvider[provider]
      ? buttonPerProvider[provider]
      : allProviderButtons

  return (
    <div>
      <h1>Login to Codecov</h1>
      <p>You’ll be taken to your repo provider to authenticate</p>
      <hr />
      {providersToShow.map((provider, i) => (
        <div key={i}>{provider}</div>
      ))}
    </div>
  )
}

export default LoginPage
