import { useParams } from 'react-router-dom'

import { useStoreCodecovEventMetric } from 'services/codecovEventMetrics'
import { useOrgUploadToken } from 'services/orgUploadToken'
import { useRepo } from 'services/repo'
import { useFlags } from 'shared/featureFlags'
import A from 'ui/A'
import { Card } from 'ui/Card'
import { CodeSnippet } from 'ui/CodeSnippet'

import ExampleBlurb from '../ExampleBlurb'
import LearnMoreBlurb from '../LearnMoreBlurb'

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

  const uploadToken = orgUploadToken ?? data?.repository?.uploadToken ?? ''
  const tokenCopy = orgUploadToken ? 'global' : 'repository'
  // prettier-ignore
  const actionString =
  `- name: Upload coverage reports to Codecov
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
      <Step1 tokenCopy={tokenCopy} uploadToken={uploadToken} />
      <Step2
        defaultBranch={data?.repository?.defaultBranch ?? ''}
        actionString={actionString}
      />
      <Step3 />
      <FeedbackCTA />
      <LearnMoreBlurb />
    </div>
  )
}

interface Step1Props {
  tokenCopy: string
  uploadToken: string
}

function Step1({ tokenCopy, uploadToken }: Step1Props) {
  const { mutate: storeEventMetric } = useStoreCodecovEventMetric()
  const { owner } = useParams<URLParams>()
  return (
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
          Admin required to access repo settings &gt; secrets and variable &gt;
          actions
        </p>
        <div className="flex gap-4">
          <CodeSnippet
            className="basis-1/3"
            clipboard="CODECOV_TOKEN"
            data-testid="token-key"
          >
            CODECOV_TOKEN
          </CodeSnippet>
          <CodeSnippet
            className="basis-2/3"
            clipboard={uploadToken}
            clipboardOnClick={() =>
              storeEventMetric({
                owner,
                event: 'COPIED_TEXT',
                jsonPayload: { text: 'Step 1 GHA' },
              })
            }
          >
            {uploadToken}
          </CodeSnippet>
        </div>
      </Card.Content>
    </Card>
  )
}

interface Step2Props {
  defaultBranch: string
  actionString: string
}

function Step2({ defaultBranch, actionString }: Step2Props) {
  const { mutate: storeEventMetric } = useStoreCodecovEventMetric()
  const { owner } = useParams<URLParams>()
  return (
    <Card>
      <Card.Header>
        <Card.Title size="base">
          Step 2: add Codecov to your{' '}
          <A
            to={{
              pageName: 'githubRepoActions',
            }}
            options={{ branch: defaultBranch }}
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

        <CodeSnippet
          clipboard={actionString}
          clipboardOnClick={() =>
            storeEventMetric({
              owner,
              event: 'COPIED_TEXT',
              jsonPayload: { text: 'Step 2 GHA' },
            })
          }
        >
          {actionString}
        </CodeSnippet>
        <ExampleBlurb />
      </Card.Content>
    </Card>
  )
}

function Step3() {
  return (
    <Card>
      <Card.Header>
        <Card.Title size="base">
          Step 3: merge to main or your preferred feature branch
        </Card.Title>
      </Card.Header>
      <Card.Content>
        <p>
          Once merged to your default branch, subsequent pull requests will have
          Codecov checks and comments. Additionally, you’ll find your repo
          coverage dashboard here. If you have merged, try reloading the page.
        </p>
      </Card.Content>
    </Card>
  )
}

function FeedbackCTA() {
  return (
    <Card>
      <Card.Content>
        <p>
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
      </Card.Content>
    </Card>
  )
}

export default GitHubActions
