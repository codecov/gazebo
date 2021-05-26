import { useUser } from 'services/user'
import ListRepo from 'shared/ListRepo'

import Header from './Header'

function HomePage() {
  const { data: currentUser } = useUser({
    onError: console.log,
  })

  return (
    <>
      <Header currentUsername={currentUser.username} />
      <ListRepo />
    </>
  )
}

export default HomePage
