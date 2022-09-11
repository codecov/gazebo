import PropTypes from 'prop-types'

import { ReactComponent as Logo } from './logo.svg'
import styles from './LogoSpinner.module.css'

function LogoSpinner({ size = 100 }) {
  const height = `${size}px`
  return (
    <div
      className={styles.spinner}
      style={{ height }}
      data-testid="logo-spinner"
    >
      <Logo />
    </div>
  )
}

LogoSpinner.propTypes = {
  size: PropTypes.number,
}

export default LogoSpinner
