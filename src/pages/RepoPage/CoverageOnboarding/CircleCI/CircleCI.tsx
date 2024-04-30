import { useParams } from 'react-router-dom'

import patchAndProject from 'assets/repoConfig/patch-and-project.svg'
import { useOrgUploadToken } from 'services/orgUploadToken'
import { useRepo } from 'services/repo'
import { useFlags } from 'shared/featureFlags'
import { providerToInternalProvider } from 'shared/utils/provider'
import A from 'ui/A'
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
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="text-base font-semibold">
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
          </h2>
          <p className="text-base">
            Environment variables in CircleCI can be found in project&apos;s
            settings.
          </p>
        </div>
        <pre className="flex items-center gap-2 overflow-auto rounded-md border-2 border-ds-gray-secondary bg-ds-gray-primary px-4 py-2 font-mono">
          CODECOV_TOKEN={uploadToken}
          <CopyClipboard string={uploadToken ?? ''} />
        </pre>
      </div>
      <div className="flex flex-col gap-3">
        <div className="text-base">
          <h2 className="font-semibold">
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
          </h2>
          <p>
            Add the following to your .circleci/config.yaml and push changes to
            repository.
          </p>
        </div>
        <div className="flex items-start justify-between overflow-auto whitespace-pre-line rounded-md border-2 border-ds-gray-secondary bg-ds-gray-primary px-4 py-2 font-mono">
          <pre className="whitespace-pre">{orbsString}</pre>
          <CopyClipboard string={orbsString} />
        </div>
        <small>
          For more, see Codecov specific{' '}
          <A
            to={{ pageName: 'circleCIOrbs' }}
            isExternal
            hook="circleCIOrbsLink"
          >
            CircleCI Documentation
          </A>
        </small>
      </div>
      <ExampleBlurb />
      <div>
        <p>
          After you committed your changes and ran the repo&apos;s CI/CD
          pipeline. In your pull request, you should see two status checks and
          PR comment.
        </p>
        <img
          alt="codecov patch and project"
          src={patchAndProject.toString()}
          className="my-3 md:px-5"
          loading="lazy"
        />
        <p>
          Once merged to the default branch, subsequent pull requests will have
          checks and report comment. Additionally, you&apos;ll find your repo
          coverage dashboard here.
        </p>
        <p className="mt-6">
          Visit our guide to{' '}
          <A to={{ pageName: 'quickStart' }} isExternal hook="quick-start-link">
            learn more
          </A>{' '}
          about integrating Codecov into your CI/CD workflow.
        </p>
        <p className="mt-6 border-l-2 border-ds-gray-secondary pl-4">
          <span className="font-semibold">How was your setup experience?</span>{' '}
          Let us know in{' '}
          <A
            to={{ pageName: 'repoConfigFeedback' }}
            isExternal
            hook="repoConfigFeedbackLink"
          >
            this issue
          </A>
        </p>
      </div>
    </div>
  )
}

export default CircleCI
