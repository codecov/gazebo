import isEmpty from 'lodash/isEmpty'
import PropTypes from 'prop-types'

import A from 'ui/A'

function ErroredUploads({ erroredUploads }) {
  return (
    !isEmpty(erroredUploads) && (
      <>
        <p>The following uploads failed to process:</p>
        {Object.entries(erroredUploads)?.map(([provider, uploads]) => {
          return (
            <div key={provider}>
              <p className="font-semibold capitalize">{provider}</p>
              {uploads?.map(({ buildCode, ciUrl, createdAt }) => {
                return (
                  <div key={`${buildCode}-${createdAt}`} className="flex gap-1">
                    <p>{buildCode}</p>
                    {ciUrl && (
                      <A href={ciUrl} hook="ci job" isExternal={true}>
                        view CI build
                      </A>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}
        <p>
          We recommend checking the Codecov step of this commit&apos;s CI Run to
          make sure it uploaded properly and, if needed, run your CI again.
        </p>
      </>
    )
  )
}

ErroredUploads.propTypes = {
  erroredUploads: PropTypes.object.isRequired,
}

export default ErroredUploads
