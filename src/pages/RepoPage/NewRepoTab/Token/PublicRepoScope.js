import PropTypes from 'prop-types'

import { useOnboardingTracking } from 'layouts/UserOnboarding/useOnboardingTracking'
import A from 'ui/A'
import CopyClipboard from 'ui/CopyClipboard'

const PublicRepoScope = ({ isCurrentUserPartOfOrg, token }) => {
  const { copiedCIToken } = useOnboardingTracking()

  return isCurrentUserPartOfOrg ? (
    <>
      <p className="text-base">
        If the public project is on TravisCI, CircleCI, AppVeyor, Azure
        Pipelines, or{' '}
        <A
          href="https://github.com/codecov/codecov-action#usage"
          isExternal
          hook="gh-actions"
        >
          GitHub Actions
        </A>{' '}
        an upload token is not required. Otherwise, you&apos;ll need to set the
        token below and set it in your CI environment variables.
      </p>
      <p className="flex flex-row justify-center text-s mt-4">
        Codecov Token={' '}
        <span className="font-mono bg-ds-gray-secondary text-ds-gray-octonary h-auto xl:h-5 mr-2">
          {token}
        </span>
        <CopyClipboard string={token} onClick={() => copiedCIToken(token)} />
      </p>
    </>
  ) : (
    <p className="text-base">
      If the public project on TravisCI, CircleCI, AppVeyor, Azure Pipelines, or{' '}
      <A
        href="https://github.com/codecov/codecov-action#usage"
        target="_blank"
        isExternal
        hook="gh-actions"
      >
        GitHub Actions
      </A>{' '}
      an upload token is not required. Otherwise, you&apos;ll need a token to
      from the authorized member or admin.
    </p>
  )
}

PublicRepoScope.propTypes = {
  isCurrentUserPartOfOrg: PropTypes.bool,
  token: PropTypes.string,
}

export default PublicRepoScope
