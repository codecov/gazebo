import { Menu, MenuButton, MenuLink, MenuList } from '@reach/menu-button'
import cs from 'classnames'
import PropTypes from 'prop-types'
import { useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useIntersection } from 'react-use'

import AppLink from 'shared/AppLink'
import { providerToName } from 'shared/utils/provider'
import A from 'ui/A'
import Avatar from 'ui/Avatar'
import Icon from 'ui/Icon'
import Spinner from 'ui/Spinner'

import './ContextSwitcher.css'

const styles = {
  button: 'flex items-center text-xl font-semibold mx-4 sm:mx-0',
  image: 'w-6 h-6 rounded-full',
  switchContext:
    'flex justify-between px-4 py-2 border-b border-ds-gray-secondary font-semibold',
}

function getCurrentContext({ activeContext, contexts }) {
  return contexts.find((context) => {
    return context.owner.username.toLowerCase() === activeContext?.toLowerCase()
  })
}

function LoadMoreTrigger({ intersectionRef, onLoadMore }) {
  if (!onLoadMore) {
    return null
  }

  return (
    <span
      ref={intersectionRef}
      className="invisible relative top-[-65px] block leading-[0]"
    >
      Loading more organizations...
    </span>
  )
}

LoadMoreTrigger.propTypes = {
  onLoadMore: PropTypes.func,
  intersectionRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
}

function ContextSwitcher({
  activeContext,
  contexts,
  currentUser,
  isLoading,
  onLoadMore,
}) {
  const intersectionRef = useRef(null)
  const currentContext = getCurrentContext({ activeContext, contexts })
  const { provider } = useParams()

  const isGh = providerToName(provider) === 'Github'

  const intersection = useIntersection(intersectionRef, {
    root: null,
    rootMargin: '0px',
    threshold: 0,
  })

  useEffect(() => {
    if (intersection?.isIntersecting && onLoadMore) {
      onLoadMore()
    }
  }, [intersection?.isIntersecting, onLoadMore])

  function renderContext(context) {
    const { owner, pageName } = context
    const isActiveContext = context === currentContext
    return (
      <MenuLink
        as={AppLink}
        pageName={pageName}
        options={{ owner: owner?.username }}
        key={owner.username}
      >
        <Avatar user={owner} bordered />
        <div className={cs('mx-2', { 'font-semibold': isActiveContext })}>
          {owner?.username}
        </div>
        {owner?.username === currentUser?.defaultOrgUsername && (
          <span className="font-medium text-ds-gray-quaternary">Default</span>
        )}
      </MenuLink>
    )
  }

  return (
    <Menu id="context-switcher">
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
        <div className={styles.switchContext}>Switch context</div>
        <div className="max-h-64 overflow-y-auto">
          <MenuLink as={AppLink} pageName="provider">
            <Icon name="home" />
            <div className={cs('mx-2', { 'font-semibold': !activeContext })}>
              All orgs and repos
            </div>
          </MenuLink>
          {contexts.map(renderContext)}
          {isLoading && (
            <span className="flex justify-center pt-1 pb-2">
              <Spinner />
            </span>
          )}
          <LoadMoreTrigger
            intersectionRef={intersectionRef}
            onLoadMore={onLoadMore}
          />
        </div>
        {isGh && (
          <div className="max-h-64 overflow-y-auto border-t border-ds-gray-secondary px-4 py-2 text-ds-gray-quinary">
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
  currentUser: PropTypes.shape({
    defaultOrgUsername: PropTypes.string,
  }).isRequired,
  onLoadMore: PropTypes.func,
  isLoading: PropTypes.bool,
}

export default ContextSwitcher
