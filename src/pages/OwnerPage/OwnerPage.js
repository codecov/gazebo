import { useParams } from 'react-router-dom'

import ListRepo from 'shared/ListRepo'

import Header from './Header'

function HomePage() {
  const { owner } = useParams()

  return (
    <>
      <Header owner={owner} />
      <ListRepo owner={owner} />
    </>
  )
}

export default HomePage
