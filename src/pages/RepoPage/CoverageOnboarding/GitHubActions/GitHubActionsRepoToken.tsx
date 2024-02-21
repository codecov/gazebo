import { useParams } from 'react-router-dom'

import patchAndProject from 'assets/repoConfig/patch-and-project.svg'
import { useRepo } from 'services/repo'
import A from 'ui/A'
import CopyClipboard from 'ui/CopyClipboard'
import Icon from 'ui/Icon'

const codecovActionString = `- name: Upload coverage reports to Codecov
  uses: codecov/codecov-action@v3
  with:
    CODECOV_TOKEN: \${{ secrets.CODECOV_TOKEN }}
`

interface URLParams {
  provider: string
  owner: string
  repo: string
}

function GitHubActionsRepoToken() {
  const { provider, owner, repo } = useParams<URLParams>()
  const { data } = useRepo({ provider, owner, repo })
  const repoUploadToken = data?.repository?.uploadToken

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div>
          <div className="mb-4 flex flex-col gap-2 overflow-auto border-l-4 border-ds-blue bg-ds-gray-primary p-4">
            Before integrating with Codecov, ensure that your project already
            generates coverage reports. Codecov relies on these reports to
            provide the coverage analysis.
            <A
              to={{ pageName: 'quickStart' }}
              isExternal
              hook="quick-start-link-github-repo"
            >
              <Icon name="bookOpen" size="sm" />
              Read our documentation
            </A>
          </div>
          <h2 className="text-base font-semibold">
            Step 1: add repository token as{' '}
            <A
              to={{ pageName: 'githubRepoSecrets' }}
              isExternal
              hook="GitHub-repo-secrects-link"
            >
              repository secret
            </A>
          </h2>
          <p className="text-base">
            Admin required to access repo settings &gt; secrets and variable
            &gt; actions
          </p>
        </div>
        <pre className="flex items-center gap-2 overflow-auto rounded-md border-2 border-ds-gray-secondary bg-ds-gray-primary px-4 py-2 font-mono">
          CODECOV_TOKEN={repoUploadToken}
          <CopyClipboard string={repoUploadToken} />
        </pre>
      </div>
      <div className="flex flex-col gap-4">
        <div className="text-base">
          <h2 className="font-semibold">
            Step 2: add Codecov to your{' '}
            <A
              to={{
                pageName: 'githubRepoActions',
              }}
              options={{ branch: data?.repository?.defaultBranch }}
              isExternal
              hook="GitHub-repo-actions-link"
            >
              GitHub Actions workflow yaml file
            </A>
          </h2>
          <p>
            After tests run, this will upload your coverage report to Codecov:
          </p>
        </div>
        <div className="flex items-start justify-between overflow-auto rounded-md border-2 border-ds-gray-secondary bg-ds-gray-primary px-4 py-2 font-mono">
          <pre className="whitespace-pre">{codecovActionString}</pre>
          <CopyClipboard string={codecovActionString} />
        </div>
      </div>
      <div>
        <p>
          After you committed your changes and ran the repo&apos;s CI/CD
          pipeline. In your pull request, you should see two status checks and
          PR comment.
        </p>
        <img
          alt="codecov patch and project"
          src={patchAndProject.toString()}
          className="my-3 md:px-5"
          loading="lazy"
        />
        <p>
          Once merged to the default branch, subsequent pull requests will have
          checks and report comment. Additionally, you&apos;ll find your repo
          coverage dashboard here.
        </p>
        <p className="mt-6 border-l-2 border-ds-gray-secondary pl-4">
          <span className="font-semibold">How was your setup experience?</span>{' '}
          Let us know in{' '}
          <A
            to={{ pageName: 'repoConfigFeedback' }}
            isExternal
            hook="repo-config-feedback"
          >
            this issue
          </A>
        </p>
      </div>
    </div>
  )
}

export default GitHubActionsRepoToken
