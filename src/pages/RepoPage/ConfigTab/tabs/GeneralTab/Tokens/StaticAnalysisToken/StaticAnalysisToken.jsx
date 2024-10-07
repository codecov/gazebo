import PropTypes from 'prop-types'
import { useState } from 'react'

import A from 'ui/A'
import Button from 'ui/Button'
import TokenWrapper from 'ui/TokenWrapper'

import RegenerateStaticTokenModal from './RegenerateStaticTokenModal'

function StaticAnalysisToken({ staticAnalysisToken }) {
  const [showModal, setShowModal] = useState(false)

  if (typeof staticAnalysisToken !== 'string') {
    return null
  }

  return (
    <div className="flex flex-col gap-2 border-2 border-ds-gray-primary p-4 sm:flex-row">
      <div className="flex flex-1 flex-col">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Static analysis token</h3>
          <p className="mt-1 flex rounded bg-ds-pink-tertiary px-4 text-sm font-semibold text-white">
            BETA
          </p>
        </div>
        <span>
          Required for static analysis only{' '}
          <A to={{ pageName: 'staticAnalysisDoc' }} isExternal>
            learn more
          </A>
        </span>
        <div className="mt-4">
          <TokenWrapper token={staticAnalysisToken} />
        </div>
      </div>
      <div>
        <Button hook="show-modal" onClick={() => setShowModal(true)}>
          Regenerate
        </Button>
        <RegenerateStaticTokenModal
          showModal={showModal}
          closeModal={() => setShowModal(false)}
        />
      </div>
    </div>
  )
}

StaticAnalysisToken.propTypes = {
  staticAnalysisToken: PropTypes.string,
}

export default StaticAnalysisToken
