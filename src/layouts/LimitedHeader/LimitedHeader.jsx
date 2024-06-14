import cs from 'classnames'

import { CodecovIcon } from 'assets/svg/codecov'
import { useImpersonate } from 'services/impersonate'
import { useUser } from 'services/user'
import A from 'ui/A'
import Avatar from 'ui/Avatar'

export default function LimitedHeader() {
  const { isImpersonating } = useImpersonate()
  const { data: currentUser, isLoading } = useUser()
  const defaultOrg =
    currentUser?.owner?.defaultOrgUsername ?? currentUser?.user?.username

  return (
    <header
      data-testid="header"
      className={cs('text-white', {
        'bg-ds-gray-octonary': !isImpersonating,
        'bg-ds-pink-tertiary': isImpersonating,
      })}
    >
      <nav className="container mx-auto flex flex-wrap items-center justify-between gap-2 px-3 py-4 sm:px-0">
        <div className="flex items-center gap-4">
          <A
            to={{ pageName: 'owner', options: { owner: defaultOrg } }}
            variant="header"
          >
            <span className="sr-only">Link to Homepage</span>
            <CodecovIcon />
          </A>
        </div>

        {!isLoading && (
          <div className="mx-2 flex items-center gap-4 md:mx-4">
            <Avatar user={currentUser?.user} bordered />
          </div>
        )}
      </nav>
    </header>
  )
}
