import { useParams } from 'react-router-dom'

import { useRepo } from 'services/repo'
import A from 'ui/A'

import GithubConfigBanner from './GithubConfig/GithubConfigBanner'

function NewRepoGithubContent() {
  const { provider, owner, repo } = useParams()
  const { data } = useRepo({ provider, owner, repo })

  return (
    <div className="flex flex-col gap-6 text-base font-light">
      <div className="flex flex-col gap-1">
        <p>After completing the three steps in this guide, you’ll have:</p>
        <ul className="list-disc pl-6">
          <li>integrated Codecov into this repo’s CI/CD.</li>
          <li> uploaded coverage report to Codecov.</li>
          <li>
            iewed coverage reports on Codecov app and in your pull request.
          </li>
        </ul>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="font-semibold">Prerequisites</h3>
        <p>In order to get started you’ll need:</p>
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
            <A to={{ pageName: 'ciProviderWorkflow' }}>Example repo</A>.
          </li>{' '}
          {/*TBD right link*/}
        </ul>
      </div>

      <hr />

      <GithubConfigBanner privateRepo={data?.repository?.private} />
    </div>
  )
}
export default NewRepoGithubContent
