import { useUser } from 'services/user'
import ContextSwitcher from 'ui/ContextSwitcher'

function HomePage() {
  const { data: user } = useUser()

  const currentContext = {
    owner: user,
    pageName: 'provider',
  }

  const contexts = [
    currentContext,
    {
      owner: {
        username: 'spotify',
        avatarUrl: 'https://github.com/spotify.png?size=40',
      },
      pageName: 'owner',
    },
    {
      owner: {
        username: 'codecov',
        avatarUrl: 'https://github.com/codecov.png?size=40',
      },
      pageName: 'owner',
    },
  ]

  return (
    <>
      <ContextSwitcher currentContext={currentContext} contexts={contexts} />
    </>
  )
}

export default HomePage
