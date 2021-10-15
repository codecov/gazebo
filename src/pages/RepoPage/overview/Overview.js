import A from 'ui/A'
import CopyClipboard from 'ui/CopyClipboard/CopyClipboard'
import PropTypes from 'prop-types'
import Icon from 'ui/Icon'

function Overview({ data }) {
  if (!data || !data?.repo?.uploadToken) {
    return null
  }

  const { uploadToken: token, private: privateRepo } = data?.repo
  const { isPartOfOrg } = data

  const privateRepoScope = (
    <div>
      <div className="text-base">
        Copy the below token and set it in your CI environment variables.
      </div>
      <div className="flex flex-row justify-center text-s mt-4">
        Codecov Token={' '}
        <span className="font-mono bg-ds-gray-secondary text-ds-gray-octonary h-auto xl:h-4">
          {token}
        </span>
        <CopyClipboard string={token} />
      </div>
    </div>
  )

  const PublicRepoScope = isPartOfOrg ? (
    <div>
      <div className="text-base">
        If the public project is on TravisCI, CircleCI, AppVeyor, Azure
        Pipelines, or GitHub Actions an upload token is not required. Otherwise,
        you’ll need to set the token below and set it in your CI environment
        variables.
      </div>
      <div className="flex flex-row justify-center text-s mt-4">
        Codecov Token={' '}
        <span className="font-mono bg-ds-gray-secondary text-ds-gray-octonary h-auto xl:h-4">
          {token}
        </span>
        <CopyClipboard string={token} />
      </div>
    </div>
  ) : (
    <div className="text-base">
      If the public project on TravisCI, CircleCI, AppVeyor, Azure Pipelines, or
      GitHub Actions an upload token is not required. Otherwise, you’ll need a
      token to from the authorized member or admin.
    </div>
  )

  return (
    <div className="flex w-4/5 md:w-3/5 lg:w-2/5 flex-col">
      <div className="font-semibold text-3xl my-4">
        Let&apos;s get your repo covered
      </div>

      <div className="border-b border-ds-gray-tertiary pb-8 text-base">
        Codecov requires an upload in your test suite to get started. Using the{' '}
        <A to={{ pageName: 'uploader' }}>Codecov Uploader</A>
        <span className="inline-block">
          <Icon name="external-link" size="sm" />
        </span>{' '}
        and the repository upload token, upload your coverage reports to
        Codecov. See our <A to={{ pageName: 'docs' }}> quick start guide </A>
        <span className="inline-block">
          <Icon name="external-link" size="sm" />
        </span>{' '}
        to learn more.
      </div>

      <div>
        <div className="font-semibold mt-8 text-base">Step 1</div>
        <div className="text-base">
          Run your normal test suite to generate code coverage reports in a
          supported format (often an .xml format).
        </div>

        <div className="font-semibold mt-8 text-base">Step 2</div>
        <div>{privateRepo ? privateRepoScope : PublicRepoScope}</div>

        <div className="font-semibold mt-8 text-base">Step 3</div>
        <div className="text-base">
          Download the <A to={{ pageName: 'uploader' }}>uploader </A>
          <span className="inline-block">
            <Icon name="external-link" size="sm" />
          </span>{' '}
          and share your coverage reports with Codecov, by adding the the
          following commands to your CI pipeline:
        </div>

        <div className="h-36 w-5/5 bg-ds-gray-primary my-4 overflow-scroll">
          <div className="flex flex-row bg-ds-gray-secondary h-8">
            <div className="bg-ds-gray-primary flex justify-center items-center w-1/6">
              Linux
            </div>
            <div className="flex items-center justify-center w-1/5">
              Alpine Linux
            </div>
            <div className="flex items-center justify-center w-1/6">mac OS</div>
            <div className="flex items-center justify-center w-1/6">
              Windows
            </div>
          </div>
          <div className="mt-4 pl-4">
            curl -Os https://uploader.codecov.io/latest/linux/codecov
            <br />
            <br />
            chmod +x codecov
            <br />
            ./codecov -t
          </div>
        </div>

        <div className="text-base">
          It is highly recommended to{' '}
          <A to={{ pageName: 'integrityCheck' }}>
            integrity check the uploader
          </A>
          <span className="inline-block">
            <Icon name="external-link" size="sm" />
          </span>
          .
        </div>

        <div className="font-semibold mt-8 text-base">
          {' '}
          🎉 Confirming completion
        </div>
        <div className="text-base border-b border-ds-gray-tertiary pb-8">
          These steps should be added to the CI configuration. Codecov jobs
          occur after the test runner ran and output coverage report. Once
          uploader runs it will return a link where you can view your reports on
          Codecov.
        </div>
      </div>
      <div>
        <div className="font-semibold mt-8 text-base">
          Interested in a setup demo?{' '}
          <span className="font-normal text-base">
            Check out this walkthrough:
          </span>
        </div>
        <div className="mt-4">Video here</div>
      </div>
    </div>
  )
}

Overview.propTypes = {
  data: PropTypes.object,
}

export default Overview
