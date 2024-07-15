import { CodecovIcon } from 'assets/svg/codecov'
import A from 'ui/A'
import Button from 'ui/Button'

const LogoButton = ({
  defaultOrg,
  fillColor,
}: {
  defaultOrg?: string
  fillColor?: string
}) => {
  let pageName = 'root'
  if (defaultOrg) {
    pageName = 'owner'
  }

  return (
    <A
      to={{
        pageName: pageName,
        options: { owner: defaultOrg },
      }}
      variant="headerDeprecated"
      data-testid="homepage-link"
      isExternal={pageName === 'root' ? true : false}
      hook="desktop-menu-homepage-link"
    >
      <span className="sr-only">Link to Homepage</span>
      <CodecovIcon fillColor={fillColor} />
    </A>
  )
}

function GuestHeader() {
  return (
    <div className="container mx-auto flex flex-wrap items-center justify-between gap-2 border-b px-3 py-4 sm:px-0">
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
    </div>
  )
}

export default GuestHeader
