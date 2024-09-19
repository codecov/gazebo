import { useState } from 'react'

import A from 'ui/A'
import { Card } from 'ui/Card'
import { RadioTileGroup } from 'ui/RadioTileGroup'

import TokenlessModal from './TokenRequiredModal'

const AUTHENTICATION_OPTIONS = {
  NotRequired: 'not-required',
  Required: 'required',
} as const

function TokenlessSection() {
  const [showModal, setShowModal] = useState(false)
  const [tokenRequired, setTokenRequired] = useState(false) // TODO: get from API

  const handleValueChange = (value: string) => {
    if (value === AUTHENTICATION_OPTIONS.Required) {
      setShowModal(true)
    } else {
      setTokenRequired(false)
    }
  }

  return (
    <Card>
      <Card.Header>
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">Token authentication</h2>
          <A
            to={{
              pageName: 'aboutCodeCoverage', // TODO: replace with actual pageName
            }}
            hook="tokenless-docs"
            isExternal={true}
          >
            <span className="text-ds-primary">learn more</span>
          </A>
        </div>
      </Card.Header>
      <Card.Content>
        <p className="mb-3">Select an authentication option</p>
        <RadioTileGroup
          defaultValue={
            tokenRequired
              ? AUTHENTICATION_OPTIONS.Required
              : AUTHENTICATION_OPTIONS.NotRequired
          }
          value={
            tokenRequired
              ? AUTHENTICATION_OPTIONS.Required
              : AUTHENTICATION_OPTIONS.NotRequired
          }
          name="token-authentication"
          onValueChange={handleValueChange}
        >
          <RadioTileGroup.Item
            value={AUTHENTICATION_OPTIONS.NotRequired}
            data-testid="token-not-required-radio"
          >
            <RadioTileGroup.Label>Not required</RadioTileGroup.Label>
            <RadioTileGroup.Description>
              When a token is not required, your team can upload coverage
              reports without one. Existing tokens will still work, and no
              action is needed for past uploads. Designed for public open-source
              projects.
            </RadioTileGroup.Description>
          </RadioTileGroup.Item>
          <RadioTileGroup.Item
            value={AUTHENTICATION_OPTIONS.Required}
            data-testid="token-required-radio"
          >
            <RadioTileGroup.Label>Required</RadioTileGroup.Label>
            <RadioTileGroup.Description>
              When a token is required, your team must use a global or
              repo-specific token for uploads. Designed for private repositories
              and closed-source projects.
            </RadioTileGroup.Description>
          </RadioTileGroup.Item>
        </RadioTileGroup>
        {showModal && (
          <TokenlessModal
            closeModal={() => setShowModal(false)}
            setTokenRequired={setTokenRequired}
            isLoading={false} // TODO: get from API
          />
        )}
      </Card.Content>
    </Card>
  )
}

export default TokenlessSection
