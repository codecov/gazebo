import { useParams } from 'react-router-dom'

import codecovReport from 'assets/repoConfig/codecov-report.png'
import patchAndProject from 'assets/repoConfig/patch-and-project.png'
import { useRepo } from 'services/repo'
import A from 'ui/A'

import CompletionBanner from './CompletionBanner'
import TeamBotBanner from './TeamBotBanner'
import TerminalInstructions from './TerminalInstructions'
import Token from './Token'
import UploaderCheckBanner from './UploaderCheckBanner.js/UploaderCheckBanner'

function NewRepoGithubContent() {
  const { provider, owner, repo } = useParams()
  const { data } = useRepo({ provider, owner, repo })

  return (
    <div className="flex flex-col gap-6 text-base font-light">
      <div className="flex flex-col gap-1">
        <p>After completing the three steps in this guide, you&apos;ll have:</p>
        <ul className="list-disc pl-6">
          <li>integrated Codecov into this repo&apos; s CI/CD.</li>
          <li>uploaded coverage report to Codecov.</li>
          <li>
            viewed coverage reports on Codecov app and in your pull request.
          </li>
        </ul>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="font-semibold">Prerequisites</h3>
        <p>In order to get started you&apos;ll need:</p>
        <ul className="list-disc pl-6">
          <li>
            familiarity with modifying your{' '}
            <A to={{ pageName: 'ciProviderWorkflow' }}> CI provider workflow</A>
            .
          </li>
          <li>
            a CI/CD provider that runs tests and collects coverage reports.
          </li>
        </ul>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="font-semibold">Resources</h3>
        <ul className="list-disc pl-6">
          <li>
            <A to={{ pageName: 'docs' }}>Quick start guide</A>.
          </li>
          <li>
            <A to={{ pageName: 'exampleRepos' }}>Example repos</A>.
          </li>{' '}
        </ul>
      </div>

      <hr />

      <div className="flex flex-col gap-1">
        <h2 className="font-semibold">
          Step 1: copy the repository upload token* and designate team bot
        </h2>
        <p>Set the token in your CI environment variable.</p>
        <span className="font-normal text-sm">
          <Token
            privateRepo={data?.repository?.private}
            uploadToken={data?.repository?.uploadToken}
            isCurrentUserPartOfOrg={data?.isCurrentUserPartOfOrg}
          />
        </span>
      </div>

      <TeamBotBanner />

      <div className="flex flex-col gap-1 mt-4">
        <h2 className="font-semibold">
          Step 2: add the Codecov uploader to your CI workflow
        </h2>
        <p>
          To start sharing your coverage reports with Codecov, you need to
          invoke the
          <A to={{ pageName: 'uploader' }} data-testid="uploader">
            {' '}
            uploader{' '}
          </A>
          in your CI pipeline
        </p>
        <span className="font-normal text-sm">
          <TerminalInstructions />
        </span>
        <UploaderCheckBanner />
      </div>

      <div className="flex flex-col gap-1 mt-4">
        <h2 className="font-semibold">
          Step 3: get coverage analysis from Codecov
        </h2>
        <p>
          Once you&apos;ve commit your changes in step 2 and ran your CI/CD
          pipeline.In your pull request, you should see two status checks:
        </p>
        <img
          alt="codecov patch and project"
          src={patchAndProject}
          className="xl:w-2/3 self-center mt-2"
        />
        <p>and a comment with coverage report in the pull request:</p>
        <img alt="codecov report" src={codecovReport} />
        <p className="text-sm">
          Learn more about the comment report and customizing{' '}
          <A to={{ pageName: '' }}>here</A>
        </p>{' '}
        {/*what is here*/}
      </div>

      <CompletionBanner />
    </div>
  )
}
export default NewRepoGithubContent
