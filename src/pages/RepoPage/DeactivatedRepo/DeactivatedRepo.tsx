import { useParams } from 'react-router-dom'

import { useRepo } from 'services/repo'
import A from 'ui/A'

import deactivatedRepo from './assets/deactivatedRepo.svg'

interface URLParams {
  provider: string
  owner: string
  repo: string
}

function DeactivatedRepo() {
  const { provider, owner, repo } = useParams<URLParams>()
  const { data: repoData } = useRepo({
    provider,
    owner,
    repo,
  })
  const isCurrentUserPartOfOrg = repoData?.isCurrentUserPartOfOrg

  // TODO: Add a link to 'our docs' page in the non-org user case once it's available.
  return (
    <div className="flex h-full flex-col items-center justify-center text-ds-gray-octonary">
      <div className="flex max-w-lg flex-col justify-center gap-2 text-center">
        <img
          alt="Repo deactivated illustration"
          className="mx-auto mb-8"
          src={deactivatedRepo}
        />
        <span className="text-3xl"> This repo has been deactivated </span>
        <span className="text-base">
          {isCurrentUserPartOfOrg ? (
            <>
              To reactivate the repo go to{' '}
              <A
                to={{ pageName: 'settings' }}
                isExternal={false}
                hook="link-to-settings"
              >
                Settings{' '}
              </A>{' '}
              or upload a coverage report and it will be automatically
              re-activated.
            </>
          ) : (
            'Contact an administrator of your git organization to grant write-permissions in your git-provider for this repository.'
          )}
        </span>
      </div>
    </div>
  )
}

export default DeactivatedRepo
