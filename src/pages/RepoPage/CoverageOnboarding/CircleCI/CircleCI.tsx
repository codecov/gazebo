import { useParams } from 'react-router-dom'

import {
  EVENT_METRICS,
  useStoreCodecovEventMetric,
} from 'services/codecovEventMetrics'
import { useOrgUploadToken } from 'services/orgUploadToken'
import { useRepo } from 'services/repo'
import { useFlags } from 'shared/featureFlags'
import { providerToInternalProvider } from 'shared/utils/provider'
import A from 'ui/A'
import { Card } from 'ui/Card'
import { CodeSnippet } from 'ui/CodeSnippet'

import ExampleBlurb from '../ExampleBlurb'
import LearnMoreBlurb from '../LearnMoreBlurb'

const orbsString = `orbs:
  codecov: codecov/codecov@4.0.1
workflows:
  upload-to-codecov:
    jobs:
      - checkout 
      - codecov/upload
`

interface URLParams {
  provider: string
  owner: string
  repo: string
}

function CircleCI() {
  const { newRepoFlag: showOrgToken } = useFlags({
    newRepoFlag: false,
  })
  const { provider, owner, repo } = useParams<URLParams>()
  const providerName = providerToInternalProvider(provider)
  const { data } = useRepo({ provider, owner, repo })
  const { data: orgUploadToken } = useOrgUploadToken({
    provider,
    owner,
    enabled: showOrgToken,
  })

  const uploadToken = orgUploadToken ?? data?.repository?.uploadToken ?? ''
  const tokenCopy = orgUploadToken ? 'global' : 'repository'

  return (
    <div className="flex flex-col gap-6">
      <Step1
        tokenCopy={tokenCopy}
        uploadToken={uploadToken}
        providerName={providerName}
      />
      <Step2 defaultBranch={data?.repository?.defaultBranch ?? ''} />
      <Step3 />
      <FeedbackCTA />
      <LearnMoreBlurb />
    </div>
  )
}

export default CircleCI

interface Step1Props {
  tokenCopy: string
  uploadToken: string
  providerName: string
}

function Step1({ tokenCopy, uploadToken, providerName }: Step1Props) {
  const { mutate: storeEventMetric } = useStoreCodecovEventMetric()
  const { owner } = useParams<URLParams>()
  return (
    <Card>
      <Card.Header>
        <Card.Title size="base">
          Step 1: add {tokenCopy} token to{' '}
          <A
            hook="circleCIEnvVarsLink"
            isExternal
            to={{
              pageName: 'circleCIEnvVars',
              options: { provider: providerName },
            }}
          >
            environment variables
          </A>
        </Card.Title>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <p>
          Environment variables in CircleCI can be found in project settings.
        </p>
        <div className="flex gap-4">
          <CodeSnippet className="basis-1/3" clipboard="CODECOV_TOKEN">
            CODECOV_TOKEN
          </CodeSnippet>
          <CodeSnippet
            className="basis-2/3"
            clipboard={uploadToken}
            clipboardOnClick={() =>
              storeEventMetric({
                owner,
                event: EVENT_METRICS.COPIED_TEXT,
                jsonPayload: { text: 'Step 1 CircleCI' },
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
}

function Step2({ defaultBranch }: Step2Props) {
  const { mutate: storeEventMetric } = useStoreCodecovEventMetric()
  const { owner } = useParams<URLParams>()
  return (
    <Card>
      <Card.Header>
        <Card.Title size="base">
          Step 2: add Codecov orb to CircleCI{' '}
          <A
            hook="circleCIyamlLink"
            isExternal
            to={{
              pageName: 'circleCIyaml',
              options: { branch: defaultBranch },
            }}
          >
            config.yml
          </A>
        </Card.Title>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <p>
          Add the following to your .circleci/config.yaml and push changes to
          repository.
        </p>
        <CodeSnippet
          clipboard={orbsString}
          clipboardOnClick={() =>
            storeEventMetric({
              owner,
              event: EVENT_METRICS.COPIED_TEXT,
              jsonPayload: { text: 'Step 2 CircleCI' },
            })
          }
        >
          {orbsString}
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
      <Card.Content className="flex flex-col gap-4">
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
