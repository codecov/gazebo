import { useParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import ListRepo from 'shared/ListRepo'

import Header from './Header'

function HomePage({ active = false }) {
  const { owner } = useParams()

  return (
    <>
      <Header owner={owner} />
      <ListRepo active={active} owner={owner} />
    </>
  )
}

HomePage.propTypes = {
  active: PropTypes.bool,
}

export default HomePage
