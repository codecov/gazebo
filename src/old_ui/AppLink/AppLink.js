import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

function AppLink({
  Component = Link,
  useRouter = true,
  children,
  to,
  ...props
}) {
  if (!useRouter) {
    return (
      <a href={to} {...props}>
        {children}
      </a>
    )
  }
  return (
    <Component to={to} {...props}>
      {children}
    </Component>
  )
}

AppLink.propTypes = {
  useRouter: PropTypes.bool,
  Component: PropTypes.elementType,
  to: PropTypes.string,
}

export default AppLink
