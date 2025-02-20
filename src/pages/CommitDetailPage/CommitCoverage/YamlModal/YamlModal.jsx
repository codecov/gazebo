import PropTypes from 'prop-types'
import { Suspense } from 'react'

import YamlErrorBanner from 'pages/CommitDetailPage/CommitCoverage/YamlErrorBanner'
import { useCommitErrors } from 'services/commitErrors'
import A from 'ui/A'
import Modal from 'ui/Modal'
import Spinner from 'ui/Spinner'

import YAMLViewer from './YAMLViewer'

function YamlModal({ showYAMLModal, setShowYAMLModal }) {
  const { data } = useCommitErrors()

  const invalidYaml = data?.yamlErrors?.find(
    (err) => err?.errorCode === 'invalid_yaml'
  )

  return (
    <Modal
      isOpen={showYAMLModal}
      onClose={() => setShowYAMLModal(false)}
      title="Yaml"
      body={
        <Suspense
          fallback={
            <div className="mx-auto w-fit">
              <Spinner size={40} />
            </div>
          }
        >
          <div className="flex flex-col gap-3">
            {invalidYaml && <YamlErrorBanner shouldLinkToModal={false} />}
            <YAMLViewer />
          </div>
        </Suspense>
      }
      footer={
        <span className="w-full text-left text-sm">
          Includes default YAML, global YAML, and repo{' '}
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
