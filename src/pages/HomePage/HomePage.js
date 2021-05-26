import ListRepo from 'shared/ListRepo'
import Header from './Header'
import PropTypes from 'prop-types'

function HomePage({ active = false }) {
  return (
    <>
      <Header />
      <ListRepo active={active} />
    </>
  )
}

HomePage.propTypes = {
  active: PropTypes.bool,
}

export default HomePage
