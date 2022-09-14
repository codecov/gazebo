import { useParams } from 'react-router-dom'

import { useRepo } from 'services/repo'
import { useFlags } from 'shared/featureFlags'
import { NotFoundException } from 'shared/utils'

import { useRedirectToVueOverview } from './hooks'
import NewRepoContent from './NewRepoContent'
import NewRepoGithubContent from './NewRepoGithubContent'

function NewRepoTab() {
  const { provider, owner, repo } = useParams()
  const { data } = useRepo({ provider, owner, repo })
  const { newRepoGhContent } = useFlags({ newRepoGhContent: false })

  if (!data?.isCurrentUserPartOfOrg && data?.repository?.private)
    throw new NotFoundException()

  useRedirectToVueOverview({
    noAccessOpenSource:
      !data?.isCurrentUserPartOfOrg && !data?.repository?.private,
    missingUploadToken: !data?.repository?.uploadToken,
  })

  return (
    <div className="flex flex-col gap-6">
      <hr />
      <div className="mx-auto w-4/5 md:w-3/5 lg:w-3/6 mt-6">
        <h1 className="font-semibold text-3xl my-4">
          Let&apos;s get your repo covered
        </h1>
        {newRepoGhContent ? <NewRepoGithubContent /> : <NewRepoContent />}
      </div>
    </div>
  )
}

export default NewRepoTab
