import { useParams } from 'react-router-dom'

import { useOrgUploadToken } from 'services/orgUploadToken'
import { useRepo } from 'services/repo'
import { useFlags } from 'shared/featureFlags'
import A from 'ui/A'
import { Card } from 'ui/Card'
import CopyClipboard from 'ui/CopyClipboard'

import ExampleBlurb from '../ExampleBlurb'

interface URLParams {
  provider: string
  owner: string
  repo: string
}

function GitHubActions() {
  const { newRepoFlag: showOrgToken } = useFlags({
    newRepoFlag: false,
  })
  const { provider, owner, repo } = useParams<URLParams>()
  const { data } = useRepo({ provider, owner, repo })
  const { data: orgUploadToken } = useOrgUploadToken({
    provider,
    owner,
    enabled: showOrgToken,
  })

  const uploadToken = orgUploadToken ?? data?.repository?.uploadToken
  const tokenCopy = orgUploadToken ? 'global' : 'repository'
  const actionString = `- name: Upload coverage reports to Codecov
    uses: codecov/codecov-action@v4.0.1
    with:
      token: \${{ secrets.CODECOV_TOKEN }}${
        orgUploadToken
          ? `
      slug: ${owner}/${repo}`
          : ''
      }`

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <Card.Header>
          <Card.Title size="base">
            Step 1: add {tokenCopy} token as{' '}
            <A
              to={{ pageName: 'githubRepoSecrets' }}
              isExternal
              hook="GitHub-repo-secrects-link"
            >
              repository secret
            </A>
          </Card.Title>
        </Card.Header>
        <Card.Content className="flex flex-col gap-4">
          <p>
            Admin required to access repo settings &gt; secrets and variable
            &gt; actions
          </p>
          <div className="flex gap-4">
            {/* We have plans to make this a component. Too much copy pasta */}
            <pre className="flex basis-1/3 items-center justify-between gap-2 rounded-md border border-ds-gray-secondary bg-ds-gray-primary p-4 font-mono">
              <div
                className="w-0 flex-1 overflow-hidden"
                data-testid="token-key"
              >
                CODECOV_TOKEN
              </div>
              <CopyClipboard string="CODECOV_TOKEN" />
            </pre>
            <pre className="flex basis-2/3 items-center justify-between gap-2 rounded-md border border-ds-gray-secondary bg-ds-gray-primary p-4 font-mono">
              <div className="w-0 flex-1 overflow-hidden">{uploadToken}</div>
              <CopyClipboard string={uploadToken ?? ''} />
            </pre>
          </div>
        </Card.Content>
      </Card>
      <Card>
        <Card.Header>
          <Card.Title size="base">
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
          </Card.Title>
        </Card.Header>
        <Card.Content className="flex flex-col gap-4">
          <p>
            After tests run, this will upload your coverage report to Codecov:
          </p>

          <div className="flex items-start justify-between overflow-auto rounded-md border border-ds-gray-secondary bg-ds-gray-primary p-4 font-mono">
            <pre className="whitespace-pre">{actionString}</pre>
            <CopyClipboard string={actionString} />
          </div>
          <ExampleBlurb />
        </Card.Content>
      </Card>
      <Card>
        <Card.Header>
          <Card.Title size="base">
            Step 3: merge to main or your preferred feature branch
          </Card.Title>
        </Card.Header>
        <Card.Content>
          <p>
            Once merged to your default branch, subsequent pull requests will
            have Codecov checks and comments. Additionally, you’ll find your
            repo coverage dashboard here. If you have merged try reloading the
            page.
          </p>
        </Card.Content>
      </Card>
      <Card>
        <Card.Content>
          <p>
            <span className="font-semibold">
              How was your setup experience?
            </span>{' '}
            Let us know in{' '}
            <A
              to={{ pageName: 'repoConfigFeedback' }}
              isExternal
              hook="repo-config-feedback"
            >
              this issue
            </A>
          </p>
        </Card.Content>
      </Card>
    </div>
  )
}

export default GitHubActions
