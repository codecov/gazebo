import PropTypes from 'prop-types'
import { lazy, Suspense } from 'react'

import A from 'ui/A'
import Modal from 'ui/Modal'
import Spinner from 'ui/Spinner'

const YAMLViewer = lazy(() => import('./YAMLViewer'))

function YamlModal({ showYAMLModal, setShowYAMLModal }) {
  if (!showYAMLModal) {
    return null
  }

  return (
    <Modal
      isOpen={true}
      onClose={() => setShowYAMLModal(false)}
      title="Yaml"
      body={
        <Suspense fallback={<Spinner size={40} />}>
          <YAMLViewer />
        </Suspense>
      }
      footer={
        <span className="text-sm w-full text-left">
          Includes default yaml, global yaml, and repo{' '}
          <A
            href="https://docs.codecov.com/docs/codecov-yaml"
            hook="yaml learn more"
            isExternal={true}
          >
            learn more
          </A>
        </span>
      }
    />
  )
}

YamlModal.propTypes = {
  showYAMLModal: PropTypes.bool.isRequired,
  setShowYAMLModal: PropTypes.func.isRequired,
}

export default YamlModal
