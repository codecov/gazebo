import { useParams } from 'react-router-dom'

import patchAndProject from 'assets/repoConfig/patch-and-project.svg'
import { useOrgUploadToken } from 'services/orgUploadToken'
import { useRepo } from 'services/repo'
import { useFlags } from 'shared/featureFlags'
import { providerToInternalProvider } from 'shared/utils/provider'
import A from 'ui/A'
import { Card } from 'ui/Card'
import CopyClipboard from 'ui/CopyClipboard'

import ExampleBlurb from '../ExampleBlurb'

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

  const uploadToken = orgUploadToken ?? data?.repository?.uploadToken
  const tokenCopy = orgUploadToken ? 'global' : 'repository'

  return (
    <div className="flex flex-col gap-6">
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
            Step 2: add Codecov orb to CircleCI{' '}
            <A
              hook="circleCIyamlLink"
              isExternal
              to={{
                pageName: 'circleCIyaml',
                options: { branch: data?.repository?.defaultBranch },
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
          <div className="flex items-start justify-between overflow-auto whitespace-pre-line rounded-md border border-ds-gray-secondary bg-ds-gray-primary p-4 font-mono">
            <pre className="whitespace-pre">{orbsString}</pre>
            <CopyClipboard string={orbsString} />
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
        <Card.Content className="flex flex-col gap-4">
          <p>
            Once you&apos;ve committed your changes and ran your CI/CD pipeline,
            you should see status checks and comments in your pull request.
          </p>
          <img
            alt="codecov patch and project"
            src={patchAndProject.toString()}
            className="my-3 md:px-5"
            loading="lazy"
          />
          <p>
            Once merged to your default branch, subsequent pull requests will
            have status checks and report comments. Additionally, you&apos;ll
            find your repo coverage dashboard here.
          </p>
          <p>
            Visit our guide to{' '}
            <A
              to={{ pageName: 'quickStart' }}
              isExternal
              hook="quick-start-link"
            >
              learn more
            </A>{' '}
            about integrating Codecov into your CI/CD workflow.
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

export default CircleCI
