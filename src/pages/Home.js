import { useEffect } from 'react'

import Server from 'shared/server'

function Home() {
  useEffect(() => {
    Server.get({
      path: '/profile',
      provider: 'gh',
    })
      .then(console.log)
      .catch(console.error)
  }, [])

  useEffect(() => {
    Server.get({
      path: '/github/codecov/repos/java-standard/',
      provider: 'gh',
    })
      .then(console.log)
      .catch(console.error)
  }, [])

  return <div>Im the home page</div>
}

export default Home
