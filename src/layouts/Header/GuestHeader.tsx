import Button from 'ui/Button'

import { LogoButton } from './DesktopMenu'

function GuestHeader() {
  return (
    <>
      <div data-testid="guest-header" className="flex items-center gap-4">
        <LogoButton defaultOrg={''} />
      </div>
      <div className="flex items-center gap-4 md:mx-4">
        <div
          data-testid="login-prompt"
          className="mx-2 flex items-center justify-between gap-4 md:mx-0"
        >
          <Button
            to={{ pageName: 'login' }}
            variant="primary"
            disabled={false}
            showExternalIcon={false}
            data-testid="login-link"
            hook="guest-header-login-link"
          >
            Login
          </Button>
        </div>
      </div>
    </>
  )
}

export default GuestHeader
