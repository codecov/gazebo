import { useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useOrgUploadToken } from 'services/orgUploadToken/useOrgUploadToken'
import { useRepo } from 'services/repo'
import { useUploadTokenRequired } from 'services/uploadTokenRequired'
import { Provider } from 'shared/api/helpers'
import A from 'ui/A'
import { Card } from 'ui/Card'

import MergeStep from './MergeStep'
import TokenStep from './TokenStep'
import WorkflowYMLStep from './WorkflowYMLStep'

import LearnMoreBlurb from '../LearnMoreBlurb'
import OutputCoverageStep from '../OutputCoverageStep/OutputCoverageStep'
import {
  Framework,
  UseFrameworkInstructions,
} from '../UseFrameworkInstructions'

interface URLParams {
  provider: Provider
  owner: string
  repo: string
}

function GitHubActions() {
  const { provider, owner, repo } = useParams<URLParams>()
  const { data: orgUploadToken } = useOrgUploadToken({
    provider,
    owner,
  })

  const [isUsingGlobalToken, setIsUsingGlobalToken] = useState<boolean>(true)
  const { data: repoData } = useRepo({ provider, owner, repo })
  const repoUploadToken = repoData?.repository?.uploadToken ?? ''
  const previouslyGeneratedOrgToken = useRef<string | null | undefined>()
  const { data: uploadTokenRequiredData } = useUploadTokenRequired({
    provider,
    owner,
  })
  const hasPreviouslyGeneratedOrgToken = !!previouslyGeneratedOrgToken.current
  const isUploadTokenRequired = uploadTokenRequiredData?.uploadTokenRequired
  const showTokenSelector =
    !isUploadTokenRequired || !previouslyGeneratedOrgToken.current
  // token step is shown if upload token is required and org token has been previously generated
  // or if global token is selected and org token has been generated when not previously generated
  // or if repo token picker is selected and exists
  const showAddTokenStep =
    (isUploadTokenRequired && hasPreviouslyGeneratedOrgToken) ||
    (isUsingGlobalToken && !!orgUploadToken) ||
    (!isUsingGlobalToken && !!repoUploadToken)

  // If orgUploadToken does not exist on initial render, set it to null and we
  // do not touch it again on rerenders
  if (previouslyGeneratedOrgToken.current === undefined) {
    previouslyGeneratedOrgToken.current = orgUploadToken ?? null
  }

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
        ciProvider="GitHub Actions"
        setFramework={setFramework}
      />
      <TokenStep
        isUsingGlobalToken={isUsingGlobalToken}
        setIsUsingGlobalToken={setIsUsingGlobalToken}
        showAddTokenStep={showAddTokenStep}
        showTokenSelector={showTokenSelector}
        framework={framework}
      />
      <WorkflowYMLStep
        framework={framework}
        frameworkInstructions={frameworkInstructions}
        stepNum={showTokenSelector && showAddTokenStep ? 4 : 3}
      />
      <MergeStep stepNum={showTokenSelector && showAddTokenStep ? 5 : 4} />
      <FeedbackCTA />
      <LearnMoreBlurb />
    </div>
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
