import cs from 'classnames'

const cardClassName = 'border border-ds-gray-secondary bg-white rounded-md '

function Card({ children, className = '' }) {
  return <div className={cs(cardClassName, className)}>{children}</div>
}

export default Card
