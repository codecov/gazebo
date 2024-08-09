import upsideDownUmbrella from 'layouts/shared/NetworkErrorBoundary/assets/error-upsidedown-umbrella.svg'
import { NetworkErrorMessage } from 'layouts/shared/NetworkErrorBoundary/NetworkErrorBoundary'
import A from 'ui/A'
import Button from 'ui/Button'

const UnauthorizedRepoDisplay = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center pb-16 text-center">
      <img src={upsideDownUmbrella} alt="Forbidden" className="w-1/6" />
      <h1 className="mt-6 text-2xl">Unauthorized</h1>
      <p className="mt-6">
        Activation is required to view this repo, please{' '}
        <A
          to={{ pageName: 'membersTab' }}
          isExternal={false}
          hook="repo-page-to-members-tab"
          className="my-4"
        >
          click here to activate your account.
        </A>
      </p>
      <NetworkErrorMessage />
      <p className="mb-4 font-bold">Error 403</p>
      <Button to={{ pageName: 'owner' }} disabled={undefined} hook={undefined}>
        Return to previous page
      </Button>
    </div>
  )
}

export default UnauthorizedRepoDisplay
