import { Fragment } from 'react'
import AppLink from 'old_ui/AppLink'

import Dropdown from './Dropdown'
import { useNavLinks, useStaticNavLinks } from 'services/navigation'
import { ReactComponent as CodecovIcon } from 'assets/svg/codecov.svg'
import { useUser } from 'services/user'

// TODO text sizing
let staticLinkClasses = 'ml-8 font-sans font-semibold text-ds-gray-secondary'

// TODO responsiveness

function DesktopMenu() {
  const { provider } = useNavLinks()
  const { docs, support, blog } = useStaticNavLinks()
  const { data: user } = useUser({
    suspense: false,
  })

  return (
    <>
      <div data-testid="desktop-menu" className="flex items-center">
        <AppLink
          to={provider.path()}
          useRouter={!provider.isExternalLink}
          tabIndex="0"
          className="mx-2 md:mx-0 flex-shrink-0"
        >
          <span className="sr-only">Link to Homepage</span>
          <CodecovIcon />
        </AppLink>
        <AppLink
          to={docs.path()}
          useRouter={false}
          className={staticLinkClasses}
        >
          Docs
        </AppLink>
        <AppLink
          to={support.path()}
          useRouter={false}
          className={staticLinkClasses}
        >
          Support
        </AppLink>
        <AppLink
          to={blog.path()}
          useRouter={false}
          className={staticLinkClasses}
        >
          Blog
        </AppLink>
      </div>
      <Dropdown user={user} />
    </>
  )
}

export default DesktopMenu
