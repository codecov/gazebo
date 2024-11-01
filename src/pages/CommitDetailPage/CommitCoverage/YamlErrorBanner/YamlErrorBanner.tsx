import { useState } from 'react'

import YamlModal from 'pages/CommitDetailPage/CommitCoverage/YamlModal'
import A from 'ui/A'
import { Alert } from 'ui/Alert'

function YamlErrorBanner({
  shouldLinkToModal = false,
}: {
  shouldLinkToModal?: boolean
}) {
  const [showYamlModal, setShowYamlModal] = useState(false)

  return (
    <>
      <Alert variant="warning">
        <Alert.Title>
          <div className="font-semibold">
            {shouldLinkToModal ? (
              <span>
                {/* @ts-ignore ignore until we convert A to ts */}
                <A
                  onClick={() => setShowYamlModal(true)}
                  hook="open yaml modal"
                  isExternal={true}
                >
                  YAML
                </A>
                &nbsp;&nbsp;is invalid
              </span>
            ) : (
              <span>YAML is invalid</span>
            )}
          </div>
        </Alert.Title>
        <Alert.Description>
          Coverage data is unable to be displayed, as the yaml appears to be
          invalid. The&nbsp;
          {/* @ts-ignore ignore until we convert A to ts */}
          <A to={{ pageName: 'yamlValidatorDocs' }}>yaml validator</A> can help
          determine its validation.
        </Alert.Description>
      </Alert>
      {shouldLinkToModal ? (
        <YamlModal
          showYAMLModal={showYamlModal}
          setShowYAMLModal={setShowYamlModal}
        />
      ) : null}
    </>
  )
}

export default YamlErrorBanner
