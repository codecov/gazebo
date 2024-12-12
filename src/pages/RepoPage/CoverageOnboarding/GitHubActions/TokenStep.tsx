import { UseMutateFunction } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import orgSecretDark from 'assets/onboarding/org_secret_dark.png'
import orgSecretLight from 'assets/onboarding/org_secret_light.png'
import useGenerateOrgUploadToken from 'pages/AccountSettings/tabs/OrgUploadToken/useGenerateOrgUploadToken'
import {
  EVENT_METRICS,
  StoreEventMetricMutationArgs,
  useStoreCodecovEventMetric,
} from 'services/codecovEventMetrics'
import { useOrgUploadToken } from 'services/orgUploadToken'
import { useRepo } from 'services/repo'
import { useUploadTokenRequired } from 'services/uploadTokenRequired'
import { useIsCurrentUserAnAdmin } from 'services/user'
import { Provider } from 'shared/api/helpers'
import { useFlags } from 'shared/featureFlags'
import { Theme, useThemeContext } from 'shared/ThemeContext'
import A from 'ui/A'
import Button from 'ui/Button'
import { Card } from 'ui/Card'
import { CodeSnippet } from 'ui/CodeSnippet'
import { ExpandableSection } from 'ui/ExpandableSection'
import { RadioTileGroup } from 'ui/RadioTileGroup'

export const TOKEN_OPTIONS = {
  GLOBAL: 'global',
  REPO: 'repo',
} as const

interface URLParams {
  provider: Provider
  owner: string
  repo: string
}

interface SecretGHExampleProps {
  storeEventMetric: UseMutateFunction<
    any,
    unknown,
    StoreEventMetricMutationArgs,
    unknown
  >
  uploadToken: string
  owner: string
}

function GitHubOrgSecretExample({
  storeEventMetric,
  uploadToken,
  owner,
}: SecretGHExampleProps) {
  const { theme } = useThemeContext()
  const isDarkMode = theme === Theme.DARK
  const orgSecretImg = isDarkMode ? orgSecretDark : orgSecretLight

  return (
    <>
      <p>
        Codecov requires a token to authenticate uploading your coverage
        reports. <b>Organization admin</b> required to access organization
        settings &gt; secrets and variables &gt; actions
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
              event: EVENT_METRICS.COPIED_TEXT,
              jsonPayload: { text: 'GHA token copied' },
            })
          }
        >
          {uploadToken}
        </CodeSnippet>
      </div>
      <ExpandableSection className="-mt-px">
        <ExpandableSection.Trigger>
          <p className="font-normal">
            Your organization secret in GitHub should look like this:
          </p>
        </ExpandableSection.Trigger>
        <ExpandableSection.Content>
          <img
            className="size-full object-cover"
            alt="org settings secret"
            src={orgSecretImg}
          />
        </ExpandableSection.Content>
      </ExpandableSection>
    </>
  )
}

interface OrgOrRepoTokenSelectorProps {
  isUsingGlobalToken: boolean
  handleValueChange: (value: string) => void
  hasOrgUploadToken: boolean
}

function OrgOrRepoTokenSelector({
  isUsingGlobalToken,
  handleValueChange,
  hasOrgUploadToken,
}: OrgOrRepoTokenSelectorProps) {
  const { owner } = useParams<URLParams>()
  const isAdmin = useIsCurrentUserAnAdmin({ owner })
  const { regenerateToken, isLoading } = useGenerateOrgUploadToken()

  return (
    <div>
      <RadioTileGroup
        value={isUsingGlobalToken ? TOKEN_OPTIONS.GLOBAL : TOKEN_OPTIONS.REPO}
        name="token-selection"
        onValueChange={handleValueChange}
      >
        <RadioTileGroup.Item
          value={TOKEN_OPTIONS.GLOBAL}
          data-testid="global-token-radio"
        >
          <RadioTileGroup.Label>Global upload token</RadioTileGroup.Label>
          <RadioTileGroup.Description>
            Use it for uploading coverage reports across all your
            organization&apos;s repositories.
          </RadioTileGroup.Description>
        </RadioTileGroup.Item>
        <RadioTileGroup.Item
          value={TOKEN_OPTIONS.REPO}
          data-testid="repo-token-radio"
        >
          <RadioTileGroup.Label>Repository token</RadioTileGroup.Label>
          <RadioTileGroup.Description>
            Use it for uploading coverage reports in the enigma repository.
          </RadioTileGroup.Description>
        </RadioTileGroup.Item>
      </RadioTileGroup>
      {isUsingGlobalToken && !hasOrgUploadToken && (
        <>
          <div className="flex items-center justify-between pb-3.5 pt-7">
            <p className="font-semibold">Generate a global upload token</p>
            <div>
              <Button
                variant="default"
                hook="generate-org-upload-token"
                onClick={() => regenerateToken()}
                disabled={isLoading || !isAdmin}
                to={undefined}
              >
                Generate
              </Button>
            </div>
          </div>
          <p>
            You need to be an{' '}
            <span className="font-semibold">organization admin</span> to
            generate a global upload token.
          </p>
        </>
      )}
    </div>
  )
}

const AddTokenStep = ({
  stepNum,
  isUsingGlobalToken,
}: {
  stepNum: number
  isUsingGlobalToken: boolean
}) => {
  const { newRepoFlag: showOrgToken } = useFlags({
    newRepoFlag: false,
  })
  const { provider, owner, repo } = useParams<URLParams>()
  const { data: orgUploadToken } = useOrgUploadToken({
    provider,
    owner,
    enabled: showOrgToken,
  })
  const { data } = useRepo({ provider, owner, repo })
  const repoUploadToken = data?.repository?.uploadToken ?? ''
  const { mutate: storeEventMetric } = useStoreCodecovEventMetric()
  return (
    <Card>
      <Card.Header>
        <Card.Title size="base">
          <>
            Step {stepNum}: add token as{' '}
            <A
              to={{
                pageName: isUsingGlobalToken
                  ? 'githubOrgSecrets'
                  : 'githubRepoSecrets',
              }}
              isExternal
              hook={
                isUsingGlobalToken
                  ? 'GitHub-org-secrets-link'
                  : 'GitHub-repo-secrets-link'
              }
            >
              {isUsingGlobalToken ? 'organization secret' : 'repository secret'}
            </A>
          </>
        </Card.Title>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <GitHubOrgSecretExample
          storeEventMetric={storeEventMetric}
          uploadToken={
            isUsingGlobalToken ? (orgUploadToken ?? '') : repoUploadToken
          }
          owner={owner}
        />
      </Card.Content>
    </Card>
  )
}

interface TokenStepSectionProps {
  isUsingGlobalToken: boolean
  setIsUsingGlobalToken: (value: boolean) => void
  showAddTokenStep: boolean
  showTokenSelector: boolean
}

function TokenStepSection({
  isUsingGlobalToken,
  setIsUsingGlobalToken,
  showAddTokenStep,
  showTokenSelector,
}: TokenStepSectionProps) {
  const { newRepoFlag: showOrgToken } = useFlags({
    newRepoFlag: false,
  })
  const { provider, owner } = useParams<URLParams>()
  const { data: uploadTokenRequiredData } = useUploadTokenRequired({
    provider,
    owner,
  })
  const isUploadTokenRequired = uploadTokenRequiredData?.uploadTokenRequired
  const { data: orgUploadToken } = useOrgUploadToken({
    provider,
    owner,
    enabled: showOrgToken,
  })

  const handleValueChange = (value: string) => {
    setIsUsingGlobalToken(value === TOKEN_OPTIONS.GLOBAL)
  }

  return (
    <>
      {showTokenSelector && (
        <Card>
          <Card.Header>
            <Card.Title size="base">
              Step 2: Select an upload token to add as a secret on GitHub
              {!isUploadTokenRequired && (
                <span className="ml-3.5 text-sm font-normal italic">
                  -optional
                </span>
              )}
            </Card.Title>
          </Card.Header>
          <Card.Content className="flex flex-col gap-4">
            <OrgOrRepoTokenSelector
              isUsingGlobalToken={isUsingGlobalToken}
              handleValueChange={handleValueChange}
              hasOrgUploadToken={!!orgUploadToken}
            />
          </Card.Content>
        </Card>
      )}
      {showAddTokenStep && (
        <AddTokenStep
          stepNum={showTokenSelector ? 3 : 2}
          isUsingGlobalToken={isUsingGlobalToken}
        />
      )}
    </>
  )
}

export default TokenStepSection
