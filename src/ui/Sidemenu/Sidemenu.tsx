import AppLink from 'shared/AppLink'
import { type AppLinkProps } from 'ui/Button'

interface SidemenuProps {
  links: AppLinkProps[]
}

function Sidemenu({ links }: SidemenuProps) {
  return (
    <div>
      <nav className="sticky top-4 mx-4 mb-4 divide-y divide-ds-gray-tertiary overflow-hidden rounded border border-ds-gray-tertiary text-ds-gray-quinary sm:mx-0 lg:w-56">
        {links.map((tab) => (
          // need an extra div to have the border to separate links from the
          // active left border with a different color
          <div key={tab.pageName}>
            <AppLink
              {...tab}
              // @ts-expect-error: AppLink is not typed yet
              className="block p-3 hover:bg-ds-gray-quaternary/5"
              activeClassName="border-l-4 pl-2 border-ds-gray-octonary text-ds-gray-octonary font-semibold bg-ds-gray-quaternary bg-opacity-5"
            />
          </div>
        ))}
      </nav>
    </div>
  )
}

export default Sidemenu
