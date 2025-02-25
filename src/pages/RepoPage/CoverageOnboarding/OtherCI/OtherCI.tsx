import { useState } from 'react'
import { useParams } from 'react-router-dom'

import config from 'config'

import { useOrgUploadToken } from 'services/orgUploadToken/useOrgUploadToken'
import { useRepo } from 'services/repo'
import A from 'ui/A'
import { Card } from 'ui/Card'
import { CodeSnippet } from 'ui/CodeSnippet'

import { InstructionBox } from './TerminalInstructions'

import ExampleBlurb from '../ExampleBlurb'
import LearnMoreBlurb from '../LearnMoreBlurb'
import OutputCoverageStep from '../OutputCoverageStep/OutputCoverageStep'
import {
  Framework,
  UseFrameworkInstructions,
} from '../UseFrameworkInstructions'

interface URLParams {
  provider: string
  owner: string
  repo: string
}

function OtherCI() {
  const { provider, owner, repo } = useParams<URLParams>()
  const { data } = useRepo({ provider, owner, repo })
  const { data: orgUploadToken } = useOrgUploadToken({
    provider,
    owner,
  })

  const uploadToken = orgUploadToken ?? data?.repository?.uploadToken ?? ''
  const tokenCopy = orgUploadToken ? 'global' : 'repository'

  const apiUrlCopy = config.IS_SELF_HOSTED ? ` -u ${config.API_URL}` : ''
  const uploadCommand = `./codecov${apiUrlCopy} upload-process${
    orgUploadToken ? ` -r ${owner}/${repo}` : ''
  }`

  const [framework, setFramework] = useState<Framework>('Jest')
  const frameworkInstruction = UseFrameworkInstructions({
    orgUploadToken,
    owner,
    repo,
  })

  return (
    <div className="flex flex-col gap-5">
      <OutputCoverageStep
        framework={framework}
        frameworkInstructions={frameworkInstruction}
        ciProvider="Codecov CLI"
        setFramework={setFramework}
      />
      <TokenStep tokenCopy={tokenCopy} uploadToken={uploadToken} />
      <InstallStep />
      <UploadStep uploadCommand={uploadCommand} />
      <MergeStep />
      <FeedbackCTA />
      <LearnMoreBlurb />
    </div>
  )
}

export default OtherCI

interface TokenStepProps {
  tokenCopy: string
  uploadToken: string
}

function TokenStep({ tokenCopy, uploadToken }: TokenStepProps) {
  return (
    <Card>
      <Card.Header>
        <Card.Title size="base">
          Step 2: add {tokenCopy} token as a secret to your CI Provider
        </Card.Title>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <div className="flex gap-4">
          <CodeSnippet className="basis-1/3" clipboard="CODECOV_TOKEN">
            CODECOV_TOKEN
          </CodeSnippet>
          <CodeSnippet className="basis-2/3" clipboard={uploadToken}>
            {uploadToken}
          </CodeSnippet>
        </div>
      </Card.Content>
    </Card>
  )
}

function InstallStep() {
  return (
    <Card>
      <Card.Header>
        <Card.Title size="base">
          Step 3: add the{' '}
          <A
            to={{ pageName: 'uploader' }}
            data-testid="uploader"
            isExternal
            hook="uploaderLink"
          >
            Codecov CLI
          </A>{' '}
          to your CI environment
        </Card.Title>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <InstructionBox />
      </Card.Content>
    </Card>
  )
}

interface UploadStepProps {
  uploadCommand: string
}

function UploadStep({ uploadCommand }: UploadStepProps) {
  return (
    <Card>
      <Card.Header>
        <Card.Title size="base">
          Step 4: upload coverage to Codecov via the CLI after your tests have
          run
        </Card.Title>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <CodeSnippet clipboard={uploadCommand}>{uploadCommand}</CodeSnippet>
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
          Step 5: merge to main or your preferred feature branch
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
        </p>
      </Card.Content>
    </Card>
  )
}
