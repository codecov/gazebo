import { Redirect, useParams } from 'react-router-dom'

import NotFound from 'pages/NotFound'
import { useCommits } from 'services/commits'
import { useRepo } from 'services/repo'
import { useFlags } from 'shared/featureFlags'
import { useRedirect } from 'shared/useRedirect'

import NewRepoContent from './NewRepoContent'
import NewRepoGithubContent from './NewRepoGithubContent'

function NewRepoTab() {
  const { provider, owner, repo } = useParams()
  const { hardRedirect } = useRedirect({ href: `/${provider}` })
  const { data } = useRepo({ provider, owner, repo })
  const { data: commitsData } = useCommits({ provider, owner, repo })
  const { newRepoGhContent } = useFlags({ newRepoGhContent: false })

  // if the repo has commits redirect to coverage tab
  if (Array.isArray(commitsData?.commits) && commitsData?.commits.length > 0) {
    return <Redirect to={`/${provider}/${owner}/${repo}`} />
  }
  // if no upload token redirect
  else if (!data?.repository?.uploadToken) {
    hardRedirect()
    return <NotFound />
  }

  return (
    <div className="flex flex-col gap-6">
      <hr />
      <div className="mx-auto w-4/5 md:w-3/5 lg:w-3/6 mt-6">
        <h1 className="font-semibold text-3xl mb-4">
          Let&apos;s get your repo covered
        </h1>
        {newRepoGhContent ? <NewRepoGithubContent /> : <NewRepoContent />}
      </div>
    </div>
  )
}

export default NewRepoTab
