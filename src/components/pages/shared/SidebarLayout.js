import PropType from 'prop-types'

function SidebarLayout({ sidebar, children }) {
  return (
    <div className="flex-grow grid grid-cols-1 sm:grid-cols-7 bg-gray-200">
      {sidebar}
      <article className="col-span-6 grid sm:grid-cols-5 grid-cols-1 sm:gap-4 gap-0 p-0 sm:p-4 px-4 sm:px-0">
        {children}
      </article>
    </div>
  )
}

SidebarLayout.propTypes = {
  sidebar: PropType.element.isRequired,
  children: PropType.element.isRequired,
}

export default SidebarLayout
