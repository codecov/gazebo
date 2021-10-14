import A from 'ui/A'
import CopyClipboard from 'ui/CopyClipboard/CopyClipboard'
import PropTypes from 'prop-types'

function Overview({ data }) {
  if (!data || !data?.repo?.uploadToken) {
    return null
  }

  const { uploadToken: token, private: privateRepo } = data?.repo
  const { isPartOfOrg } = data

  const privateRepoScope = (
    <div>
      <div>
        Copy the below token and set it in your CI environment variables.
      </div>
      <div className="flex flex-row justify-center text-xs mt-4">
        Codecov Token={' '}
        <span className="font-mono bg-ds-gray-secondary text-ds-gray-octonary h-4">
          {token}
        </span>
        <CopyClipboard string={token} />
      </div>
    </div>
  )

  const PublicRepoScope = isPartOfOrg ? (
    <div>
      <div>
        If the public project is on TravisCI, CircleCI, AppVeyor, Azure
        Pipelines, or GitHub Actions an upload token is not required. Otherwise,
        you’ll need to set the token below and set it in your CI environment
        variables.
      </div>
      <div className="flex flex-row justify-center text-xs mt-4">
        Codecov Token={' '}
        <span className="font-mono bg-ds-gray-secondary text-ds-gray-octonary h-4">
          {token}
        </span>
        <CopyClipboard string={token} />
      </div>
    </div>
  ) : (
    <div>
      If the public project on TravisCI, CircleCI, AppVeyor, Azure Pipelines, or
      GitHub Actions an upload token is not required. Otherwise, you’ll need a
      token to from the authorized member or admin.
    </div>
  )

  return (
    <div className="flex w-3/5 flex-col">
      <div className="font-semibold text-3xl my-4">
        Let&apos;s get your repo covered
      </div>
      <div className="border-b border-ds-gray-tertiary pb-8">
        Codecov requires an upload in your test suite to get started. Using the{' '}
        <A to={{ pageName: 'uploader' }}>Codecov Uploader</A> and the repository
        upload token, upload your coverage reports to Codecov. See our{' '}
        <A to={{ pageName: 'docs' }}> quick start guide </A> to learn more.
      </div>
      <div>
        <div className="font-semibold mt-8">Step 1</div>
        <div>
          Run your normal test suite to generate code coverage reports in a
          supported format (often an .xml format).
        </div>
        <div className="font-semibold mt-8">Step 2</div>
        <div>{privateRepo ? privateRepoScope : PublicRepoScope}</div>
        <div className="font-semibold mt-4">Step 3</div>
        <div>
          Download the <A to={{ pageName: 'uploader' }}>uploader </A> and share
          your coverage reports with Codecov, by adding the the following
          commands to your CI pipeline:
        </div>
        <div>
          It is highly recommended to{' '}
          <A to={{ pageName: 'integrityCheck' }}>
            integrity check the uploader{' '}
          </A>{' '}
          .
        </div>
      </div>
    </div>
  )
}

Overview.propTypes = {
  data: PropTypes.object,
}

export default Overview
