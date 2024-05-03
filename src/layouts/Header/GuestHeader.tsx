import A from 'ui/A'
import Button from 'ui/Button'

import { LogoButton } from './DesktopMenu'

function GuestHeader() {
  return (
    <>
      <div data-testid="guest-header" className="flex items-center gap-4">
        <LogoButton defaultOrg={''} fillColor="#F01F7A" />
        <A
          to={{ pageName: 'whyTestCode' }}
          variant="guestHeader"
          isExternal={false}
          showExternalIcon={false}
          data-testid="why-test-link"
          hook="guest-header-why-test-link"
        >
          Why Test Code?
        </A>
        <A
          to={{ pageName: 'demo' }}
          variant="guestHeader"
          isExternal={false}
          showExternalIcon={false}
          data-testid="demo-link"
          hook="guest-header-demo-link"
        >
          Get a Demo
        </A>
        <A
          to={{ pageName: 'pricing' }}
          variant="guestHeader"
          isExternal={false}
          showExternalIcon={false}
          data-testid="pricing-link"
          hook="guest-header-pricing-link"
        >
          Pricing
        </A>
      </div>
      <div className="flex items-center gap-4 md:mx-4">
        <div
          data-testid="login-prompt"
          className="mx-2 flex items-center justify-between gap-4 md:mx-0"
        >
          <A
            to={{ pageName: 'login' }}
            variant="guestHeader"
            isExternal={false}
            data-testid="login-link"
            hook="guest-header-login-link"
          >
            Login
          </A>
          <Button
            to={{ pageName: 'freeTrial' }}
            variant="primary"
            disabled={false}
            showExternalIcon={false}
            data-testid="start-trial-link"
            hook="guest-header-start-trial-link"
          >
            Start Free Trial
          </Button>
        </div>
      </div>
    </>
  )
}

export default GuestHeader
