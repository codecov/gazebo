import PropTypes from 'prop-types'
import { lazy, Suspense } from 'react'

import { useCommitErrors } from 'services/commitErrors'
import A from 'ui/A'
import Modal from 'ui/Modal'
import Spinner from 'ui/Spinner'

import YamlErrorBanner from './YamlModalErrorBanner'

const YAMLViewer = lazy(() => import('./YAMLViewer'))

function YamlModal({ showYAMLModal, setShowYAMLModal }) {
  const {
    data: { yamlErrors },
  } = useCommitErrors()
  const invalidYaml = yamlErrors?.find(
    (err) => err?.errorCode === 'invalid_yaml'
  )

  return (
    <Modal
      isOpen={showYAMLModal}
      onClose={() => setShowYAMLModal(false)}
      title="Yaml"
      body={
        <Suspense fallback={<Spinner size={40} />}>
          <div className="flex flex-col gap-3">
            {invalidYaml && <YamlErrorBanner />}
            <YAMLViewer />
          </div>
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
