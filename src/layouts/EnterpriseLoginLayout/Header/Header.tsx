import cs from 'classnames'

import { CodecovIcon } from 'assets/svg/codecov'
import { useImpersonate } from 'services/impersonate'
import A from 'ui/A'

function Header() {
  const { isImpersonating } = useImpersonate()
  return (
    <header
      className={cs('text-white', {
        'bg-ds-primary-base': !isImpersonating,
        'bg-ds-pink-tertiary': isImpersonating,
      })}
    >
      <nav
        className="container mx-auto flex gap-4 px-3 py-4 sm:px-0"
        data-testid="desktop-menu"
      >
        <A
          to={{
            pageName: 'root',
          }}
          variant="header"
          data-testid="homepage-link"
          hook="homepage-link"
          isExternal
        >
          <span className="sr-only">Link to Homepage</span>
          <CodecovIcon />
        </A>
        <A
          hook="header-enterprise"
          to={{ pageName: 'docs' }}
          variant="header"
          showExternalIcon={false}
          isExternal
        >
          Docs
        </A>
        <A
          to={{ pageName: 'support' }}
          variant="header"
          showExternalIcon={false}
          hook="support-link"
          isExternal
        >
          Support
        </A>
        <A
          to={{ pageName: 'blog' }}
          variant="header"
          showExternalIcon={false}
          hook="blog-link"
          isExternal
        >
          Blog
        </A>
      </nav>
    </header>
  )
}

export default Header
