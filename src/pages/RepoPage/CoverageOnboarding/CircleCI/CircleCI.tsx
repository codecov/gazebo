import { useState } from 'react'
import { useParams } from 'react-router-dom'

import envVarScreenshot from 'assets/onboarding/env_variable_screenshot.png'
import {
  EVENT_METRICS,
  useStoreCodecovEventMetric,
} from 'services/codecovEventMetrics/useStoreCodecovEventMetric'
import { useOrgUploadToken } from 'services/orgUploadToken/useOrgUploadToken'
import { useRepo } from 'services/repo'
import { Provider } from 'shared/api/helpers'
import { providerToInternalProvider } from 'shared/utils/provider'
import A from 'ui/A'
import { Card } from 'ui/Card'
import { CodeSnippet } from 'ui/CodeSnippet'
import { ExpandableSection } from 'ui/ExpandableSection'

import ExampleBlurb from '../ExampleBlurb'
import LearnMoreBlurb from '../LearnMoreBlurb'
import OutputCoverageStep from '../OutputCoverageStep/OutputCoverageStep'
import {
  Framework,
  UseFrameworkInstructions,
} from '../UseFrameworkInstructions'

const orbsString = `orbs:
  codecov: codecov/codecov@5
workflows:
  upload-to-codecov:
    jobs:
      - checkout 
      - codecov/upload
`

interface URLParams {
  provider: Provider
  owner: string
  repo: string
}

function CircleCI() {
  const { provider, owner, repo } = useParams<URLParams>()
  const providerName = providerToInternalProvider(provider)
  const { data } = useRepo({ provider, owner, repo })
  const { data: orgUploadToken } = useOrgUploadToken({
    provider,
    owner,
  })

  const uploadToken = orgUploadToken ?? data?.repository?.uploadToken ?? ''
  const tokenCopy = orgUploadToken ? 'global' : 'repository'

  const [framework, setFramework] = useState<Framework>('Jest')
  const frameworkInstructions = UseFrameworkInstructions({
    orgUploadToken,
    owner,
    repo,
  })

  return (
    <div className="flex flex-col gap-5">
      <OutputCoverageStep
        framework={framework}
        frameworkInstructions={frameworkInstructions}
        owner={owner}
        setFramework={setFramework}
      />
      <TokenStep
        tokenCopy={tokenCopy}
        uploadToken={uploadToken}
        providerName={providerName!}
      />
      <OrbYAMLStep defaultBranch={data?.repository?.defaultBranch ?? ''} />
      <MergeStep />
      <FeedbackCTA />
      <LearnMoreBlurb />
    </div>
  )
}

export default CircleCI

interface TokenStepProps {
  tokenCopy: string
  uploadToken: string
  providerName: string
}

function TokenStep({ tokenCopy, uploadToken, providerName }: TokenStepProps) {
  const { mutate: storeEventMetric } = useStoreCodecovEventMetric()
  const { owner } = useParams<URLParams>()
  return (
    <Card>
      <Card.Header>
        <Card.Title size="base">
          Step 2: add {tokenCopy} token to environment variables
        </Card.Title>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <p>
          <A
            hook="circleCIEnvVarsLink"
            isExternal
            to={{
              pageName: 'circleCIEnvVars',
              options: { provider: providerName },
            }}
          >
            Environment variables
          </A>{' '}
          in CircleCI can be found in project settings.
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
        <ExpandableSection className="-mt-px">
          <ExpandableSection.Trigger>
            <p className="font-normal">
              Your environment variable in CircleCI should look like this:
            </p>
          </ExpandableSection.Trigger>
          <ExpandableSection.Content>
            <img
              className="size-full object-cover"
              alt="settings environment variable"
              src={envVarScreenshot}
            />
          </ExpandableSection.Content>
        </ExpandableSection>
      </Card.Content>
    </Card>
  )
}

interface OrbYAMLStepProps {
  defaultBranch: string
}

function OrbYAMLStep({ defaultBranch }: OrbYAMLStepProps) {
  const { mutate: storeEventMetric } = useStoreCodecovEventMetric()
  const { owner } = useParams<URLParams>()
  return (
    <Card>
      <Card.Header>
        <Card.Title size="base">
          Step 3: add Codecov orb to CircleCI{' '}
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

function MergeStep() {
  return (
    <Card>
      <Card.Header>
        <Card.Title size="base">
          Step 4: merge to main or your preferred feature branch
        </Card.Title>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <p>
          Once merged to your default branch, subsequent pull requests will have
          Codecov checks and comments. Additionally, you&apos;ll find your repo
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
          .
        </p>
      </Card.Content>
    </Card>
  )
}
