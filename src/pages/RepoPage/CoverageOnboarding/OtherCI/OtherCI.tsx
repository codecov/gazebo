import { useParams } from 'react-router-dom'

import { useOrgUploadToken } from 'services/orgUploadToken'
import { useRepo } from 'services/repo'
import { useFlags } from 'shared/featureFlags'
import A from 'ui/A'
import { Card } from 'ui/Card'
import CopyClipboard from 'ui/CopyClipboard'

import { InstructionBox } from './TerminalInstructions'

import ExampleBlurb from '../ExampleBlurb'

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

  const uploadCommand = `codecovcli upload-process -t ${uploadToken}${
    orgUploadToken ? `-r ${repo}` : ''
  }`

  return (
    <div className="flex flex-col gap-6">
      <Step1 tokenCopy={tokenCopy} uploadToken={uploadToken} />
      <Step2 />
      <Step3 uploadCommand={uploadCommand} />
      <Step4 />
      <FeedbackCTA />
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
          <pre className="flex basis-1/3 items-center justify-between gap-2 rounded-md border border-ds-gray-secondary bg-ds-gray-primary p-4 font-mono">
            <div className="w-0 flex-1 overflow-hidden" data-testid="token-key">
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
  )
}

function Step2() {
  return (
    <Card>
      <Card.Header>
        <Card.Title size="base">
          Step 2: add Codecov{' '}
          <A
            to={{ pageName: 'uploader' }}
            data-testid="uploader"
            isExternal
            hook="uploaderLink"
          >
            uploader to your CI workflow
          </A>
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
          Step 3: upload coverage to Codecov via CLI after your tests have run
        </Card.Title>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <pre className="flex basis-2/3 items-center justify-between gap-2 rounded-md border border-ds-gray-secondary bg-ds-gray-primary p-4 font-mono">
          <div className="w-0 flex-1 overflow-hidden">{uploadCommand}</div>
          <CopyClipboard string={uploadCommand} />
        </pre>
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
          Codecov checks and comments. Additionally, you’ll find your repo
          coverage dashboard here. If you have merged try reloading the page.
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
