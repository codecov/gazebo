import PropTypes from 'prop-types'

import AppLink from 'shared/AppLink'

function Sidemenu({ links }) {
  return (
    <div>
      <nav className="sticky top-4 mx-4 mb-4 divide-y divide-ds-gray-tertiary overflow-hidden rounded border border-ds-gray-tertiary text-ds-gray-quinary sm:mx-0 lg:w-56">
        {links.map((tab) => (
          // need an extra div to have the border to separate links from the
          // active left border with a different color
          <div key={tab.pageName}>
            <AppLink
              {...tab}
              className="block p-3 hover:bg-ds-gray-quaternary/5"
              activeClassName="border-l-4 pl-2 border-ds-gray-octonary text-ds-gray-octonary font-semibold bg-ds-gray-quaternary bg-opacity-5"
            />
          </div>
        ))}
      </nav>
    </div>
  )
}

Sidemenu.propTypes = {
  links: PropTypes.arrayOf(PropTypes.shape(AppLink.propTypes)).isRequired,
}

export default Sidemenu
