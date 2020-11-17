const cardClassName = 'bg-white rounded-md shadow-card'

function Card({ children, className = '' }) {
  return <div className={`${cardClassName} ${className}`}>{children}</div>
}

export default Card
