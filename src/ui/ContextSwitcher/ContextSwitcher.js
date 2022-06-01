import { Menu, MenuButton, MenuLink, MenuList } from '@reach/menu-button'
import cs from 'classnames'
import PropTypes from 'prop-types'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import AppLink from 'shared/AppLink'
import { providerToName } from 'shared/utils/provider'
import A from 'ui/A'
import Avatar from 'ui/Avatar'
import Icon from 'ui/Icon'

import './ContextSwitcher.css'
import DefaultOrganizationSelector from './DefaultOrganizationSelector'

const styles = {
  button: 'flex items-center text-xl font-semibold',
  image: 'w-6 h-6 rounded-full',
  switchContext:
    'px-4 py-2 border-b border-ds-gray-secondary font-semibold flex justify-between',
}

function getCurrentContext({ activeContext, contexts }) {
  return contexts.find((context) => {
    return context.owner.username.toLowerCase() === activeContext?.toLowerCase()
  })
}

function ContextSwitcher({ activeContext, contexts }) {
  const currentContext = getCurrentContext({ activeContext, contexts })
  const { provider } = useParams()
  const isGh = providerToName(provider) === 'Github'
  const [showDefaultOrgSelector, setShowDefaultOrgSelector] = useState(false)

  function renderContext(context) {
    const { owner, pageName } = context
    const isActiveContext = context === currentContext
    return (
      <MenuLink
        as={AppLink}
        pageName={pageName}
        options={{ owner: owner.username }}
        key={owner.username}
      >
        <Avatar user={owner} bordered />
        <div className={cs('mx-2', { 'font-semibold': isActiveContext })}>
          {owner.username}
        </div>
      </MenuLink>
    )
  }

  return (
    <>
      <Menu id="context-switcher" data-testid="context-menu-popover">
        <MenuButton className={styles.button}>
          {currentContext ? (
            <>
              <Avatar user={currentContext.owner} bordered />
              <div className="ml-2 mr-1">{currentContext.owner.username}</div>
            </>
          ) : (
            <>
              <Icon name="home" />
              <div className="ml-2 mr-1">All my orgs and repos</div>
            </>
          )}
          <span aria-hidden="true">
            <Icon variant="solid" name="chevron-down" />
          </span>
        </MenuButton>
        <MenuList>
          <div className={styles.switchContext}>
            Switch context{' '}
            <button
              className="text-ds-blue-darker"
              onClick={() => setShowDefaultOrgSelector(true)}
            >
              edit default
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto">
            <MenuLink as={AppLink} pageName="provider">
              <Icon name="home" />
              <div className={cs('mx-2', { 'font-semibold': !activeContext })}>
                All orgs and repos
              </div>
            </MenuLink>
            {contexts.map(renderContext)}
          </div>
          {isGh && (
            <div className="max-h-64 overflow-y-auto text-ds-gray-quinary text-xsm px-4 py-2 border-t border-ds-gray-secondary">
              <span className="font-semibold">Don&apos;t see your org?</span>
              <br />
              <A to={{ pageName: 'userAppManagePage' }}>
                {' '}
                Manage access restrictions
              </A>
            </div>
          )}
        </MenuList>
      </Menu>
      {showDefaultOrgSelector && (
        <DefaultOrganizationSelector
          onClose={() => {
            setShowDefaultOrgSelector(false)
          }}
        />
      )}
    </>
  )
}

ContextSwitcher.propTypes = {
  activeContext: PropTypes.string,
  contexts: PropTypes.arrayOf(
    PropTypes.shape({
      owner: PropTypes.shape({
        avatarUrl: PropTypes.string.isRequired,
        username: PropTypes.string.isRequired,
      }),
      pageName: PropTypes.string.isRequired,
    })
  ).isRequired,
}

export default ContextSwitcher
