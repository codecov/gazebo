import PropTypes from 'prop-types'

const styles = {
  card: 'border border-ds-gray-secondary rounded',
  header: 'border-b border-ds-gray-secondary p-4',
  body: 'p-4',
  footer: 'border-t border-ds-gray-secondary p-4',
}

function Card({ children, header, footer }) {
  return (
    <div className={styles.card}>
      {header && <div className={styles.header}>{header}</div>}
      <div className={styles.body}>{children}</div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  )
}

Card.propTypes = {
  header: PropTypes.node,
  footer: PropTypes.node,
}

export default Card
