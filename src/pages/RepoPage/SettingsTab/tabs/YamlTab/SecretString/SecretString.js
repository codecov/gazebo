import { useState } from 'react'

import Button from 'ui/Button'
import SettingsDescriptor from 'ui/SettingsDescriptor'

import CopySecretStringModal from './CopySecretStringModal'
import GenerateSecretStringModal from './GenerateSecretStringModal'
import useGenerateSecretString from './useGenerateSecretSring'

function SecretString() {
  const { generateSecretString, data, isLoading } = useGenerateSecretString()

  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [showCopyModal, setShowCopyModal] = useState(false)

  const value = data?.value

  return (
    <SettingsDescriptor
      title="Secret string"
      content={
        <div className="flex flex-col gap-4">
          <p>
            Secret strings are encrypted values used instead of plain text data
            that may be sensitive to eyes. The resulting string can be made
            public and used in your codecov yaml.
          </p>
          <div>
            <Button
              hook="show-modal"
              onClick={() => setShowGenerateModal(true)}
              disabled={isLoading}
            >
              Create New Secret String
            </Button>
            {showGenerateModal && (
              <GenerateSecretStringModal
                closeModal={() => setShowGenerateModal(false)}
                generateSecretString={generateSecretString}
                isLoading={isLoading}
                showCopyModal={() => setShowCopyModal(true)}
              />
            )}
            {showCopyModal && (
              <CopySecretStringModal
                closeModal={() => setShowCopyModal(false)}
                isLoading={isLoading}
                value={value}
              />
            )}
          </div>
        </div>
      }
    />
  )
}

export default SecretString
