import PropType from 'prop-types'

function FullLayout({ children }) {
  return (
    <div className="flex-grow bg-gray-200">
      <article className="container py-10 px-4 sm:px-0">{children}</article>
    </div>
  )
}

FullLayout.propTypes = {
  sidebar: PropType.element.isRequired,
}

export default FullLayout
