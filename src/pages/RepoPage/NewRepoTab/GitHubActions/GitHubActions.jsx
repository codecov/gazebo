import { useParams } from 'react-router-dom'

import codecovReport from 'assets/repoConfig/codecov-report.png'
import patchAndProject from 'assets/repoConfig/patch-and-project.png'
import { useOnboardingTracking } from 'layouts/UserOnboarding/useOnboardingTracking'
import { useRepo } from 'services/repo'
import A from 'ui/A'
import CopyClipboard from 'ui/CopyClipboard'

const codecovActionString =
  '- name: Upload coverage reports to Codecov\n  uses: codecov/codecov-action@v3'

function GitHubActions() {
  const { provider, owner, repo } = useParams()
  const { data } = useRepo({ provider, owner, repo })
  const { copiedCIToken } = useOnboardingTracking()

  return (
    <>
      <div className="flex flex-col gap-4">
        <h2 className="pt-6 font-semibold text-base">
          Step 1: add repository token as{' '}
          <A to={{ pageName: 'githubRepoSecrets' }} isExternal>
            repository secret
          </A>
        </h2>
        <pre className="py-2 px-4 flex items-center gap-2 font-mono rounded-md bg-ds-gray-primary border-ds-gray-secondary border-2 overflow-auto">
          CODECOV_TOKEN={data?.repository?.uploadToken}
          <CopyClipboard
            string={data?.repository?.uploadToken}
            onClick={() => copiedCIToken(data?.repository?.uploadToken)}
          />
        </pre>
      </div>
      <div className="flex flex-col">
        <h2 className="pt-6 font-semibold text-base">
          Step 2: configure{' '}
          <A to={{ pageName: 'codecovGithubApp' }} isExternal>
            Codecov&apos;s GitHub app
          </A>
        </h2>
        <p className="text-base">
          Codecov will use the integration to post statuses and comments
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="pt-6 font-semibold text-base">
          Step 3: add Codecov to your{' '}
          <A to={{ pageName: 'githubRepoActions' }} isExternal>
            GitHub Actions workflow
          </A>
        </h2>
        <div className="flex items-start justify-between py-2 px-4 font-mono rounded-md bg-ds-gray-primary border-ds-gray-secondary border-2 whitespace-pre-line overflow-auto">
          <pre>
            - name: Upload coverage reports to Codecov
            <br />
            &nbsp;&nbsp;uses: codecov/codecov-action@v3
          </pre>
          <CopyClipboard string={codecovActionString} />
        </div>
      </div>
      <div className="flex flex-col">
        <h2 className="pt-6 font-semibold text-base">
          Step 4: get coverage analysis from Codecov
        </h2>
        <p className="text-base">
          Once you&apos;ve committed your changes in step 2 and ran your CI/CD
          pipeline. In tour pull request, you should see two status checks:
        </p>
        <img
          alt="codecov patch and project"
          src={patchAndProject}
          className="xl:w-2/3 self-center mt-2"
        />
        <p className="text-base">
          and a comment with coverage report in the pull request:
        </p>
        <img alt="codecov report" src={codecovReport} />
        <p>
          Learn more about the comment report and customizing{' '}
          <A to={{ pageName: 'prCommentLayout' }}>here</A>
        </p>
      </div>
      <div className="mt-6 border-l-2 border-ds-gray-secondary">
        <p className="pl-3 text-base pb-2">
          &#127881; Once steps are complete, you should see the coverage
          dashboard
        </p>
        <p className="pl-3">
          <span className="font-semibold">How was your setup experience?</span>{' '}
          Let us know in{' '}
          <A to={{ pageName: 'repoConfigFeedback' }} isExternal>
            this issue
          </A>
        </p>
      </div>
    </>
  )
}

export default GitHubActions
