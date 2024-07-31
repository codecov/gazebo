import { useParams } from 'react-router-dom'

import config from 'config'

import { useOrgUploadToken } from 'services/orgUploadToken'
import { useRepo } from 'services/repo'
import { useFlags } from 'shared/featureFlags'
import A from 'ui/A'
import { Card } from 'ui/Card'
import { CodeSnippet } from 'ui/CodeSnippet'

import { InstructionBox } from './TerminalInstructions'

import ExampleBlurb from '../ExampleBlurb'
import LearnMoreBlurb from '../LearnMoreBlurb'

interface URLParams {
  provider: string
  owner: string
  repo: string
}

function OtherCI() {
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

  const apiUrlCopy = config.IS_SELF_HOSTED ? ` -u ${config.API_URL}` : ''
  const uploadCommand = `./codecov${apiUrlCopy} upload-process -t ${uploadToken}${
    orgUploadToken ? ` -r ${repo}` : ''
  }`

  return (
    <div className="flex flex-col gap-6">
      <Step1 tokenCopy={tokenCopy} uploadToken={uploadToken} />
      <Step2 />
      <Step3 uploadCommand={uploadCommand} />
      <Step4 />
      <FeedbackCTA />
      <LearnMoreBlurb />
    </div>
  )
}

export default OtherCI

interface Step1Props {
  tokenCopy: string
  uploadToken: string
}

function Step1({ tokenCopy, uploadToken }: Step1Props) {
  return (
    <Card>
      <Card.Header>
        <Card.Title size="base">
          Step 1: add {tokenCopy} token as a secret to your CI Provider
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

function Step2() {
  return (
    <Card>
      <Card.Header>
        <Card.Title size="base">
          Step 2: add the{' '}
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

interface Step3Props {
  uploadCommand: string
}

function Step3({ uploadCommand }: Step3Props) {
  return (
    <Card>
      <Card.Header>
        <Card.Title size="base">
          Step 3: upload coverage to Codecov via the CLI after your tests have
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

function Step4() {
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
        </p>
      </Card.Content>
    </Card>
  )
}
