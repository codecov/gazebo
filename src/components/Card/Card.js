import cs from 'classnames'

const cardClassName = 'bg-white rounded-md shadow-card'

function Card({ children, className = '' }) {
  return <div className={cs(cardClassName, className)}>{children}</div>
}

export default Card
