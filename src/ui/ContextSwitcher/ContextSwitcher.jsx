import cs from 'classnames'
import PropTypes from 'prop-types'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useIntersection } from 'react-use'
import useClickAway from 'react-use/lib/useClickAway'

import { useUpdateDefaultOrganization } from 'services/defaultOrganization'
import { providerToName } from 'shared/utils/provider'
import A from 'ui/A'
import Avatar from 'ui/Avatar'
import Button from 'ui/Button'
import Icon from 'ui/Icon'
import Spinner from 'ui/Spinner'

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

function ContextItem({ context, defaultOrgUsername, setToggle, owner }) {
  const { owner: contextOwner, pageName } = context
  const orgUsername = contextOwner?.username
  const { mutate } = useUpdateDefaultOrganization()

  return (
    <li
      className="cursor-pointer select-none py-2 text-gray-900 hover:bg-ds-gray-secondary"
      id="listbox-option-0"
    >
      <Button
        to={{ pageName: pageName, options: { owner: orgUsername } }}
        variant="listbox"
        onClick={() => {
          setToggle(false)
          if (defaultOrgUsername === orgUsername) return

          mutate({ username: orgUsername })
        }}
      >
        <Avatar user={contextOwner} />
        <div className={cs('mx-1', { 'font-semibold': owner === orgUsername })}>
          {orgUsername}
        </div>
      </Button>
    </li>
  )
}
ContextItem.propTypes = {
  context: PropTypes.shape({
    owner: PropTypes.shape({ username: PropTypes.string }),
    pageName: PropTypes.string,
  }),
  defaultOrgUsername: PropTypes.string,
  setToggle: PropTypes.func.isRequired,
  owner: PropTypes.string,
}

function useCloseOnLooseFocus({ setToggle }) {
  const ref = useRef(null)
  useClickAway(ref, () => setToggle((toggle) => (!toggle ? toggle : false)))

  return ref
}

function useLoadMore({ onLoadMore }) {
  const ref = useRef(null)
  const intersection = useIntersection(ref, {
    root: null,
    rootMargin: '0px',
    threshold: 0,
  })

  useEffect(() => {
    let unMounted = false
    if (intersection?.isIntersecting && onLoadMore) {
      if (unMounted) return
      onLoadMore()
    }

    return () => {
      unMounted = true
    }
  }, [intersection?.isIntersecting, onLoadMore])

  return ref
}

const Loader = ({ isLoading }) => {
  if (!isLoading) return null
  return (
    <span className="flex justify-center pb-2 pt-1">
      <Spinner />
    </span>
  )
}

Loader.propTypes = {
  isLoading: PropTypes.bool.isRequired,
}

function ContextSwitcher({
  buttonVariant = 'default',
  contexts,
  currentUser,
  isLoading,
  onLoadMore,
  activeContext,
}) {
  const { provider } = useParams()
  const [toggle, setToggle] = useState(false)
  const wrapperRef = useCloseOnLooseFocus({ setToggle })
  const intersectionRef = useLoadMore({ onLoadMore })
  const defaultOrgUsername = currentUser?.defaultOrgUsername

  const isGh = providerToName(provider) === 'Github'

  return (
    <div id="context-switcher" className="relative text-sm" ref={wrapperRef}>
      <button
        type="button"
        className={cs(
          '"relative flex gap-1 items-center text-xl font-semibold w-full rounded-md py-1.5 text-left text-gray-900 focus:outline-none"',
          {
            [buttonVariant.outlined]:
              'ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 shadow-sm',
          }
        )}
        id="listbox-label"
        aria-haspopup="listbox"
        aria-expanded={toggle}
        onClick={() => setToggle((toggle) => !toggle)}
      >
        <Avatar user={activeContext} />
        <p className="ml-1">{activeContext?.username}</p>
        <span
          aria-hidden="true"
          className={cs('transition-transform', {
            'rotate-180': toggle,
            'rotate-0': !toggle,
          })}
        >
          <Icon variant="solid" name="chevron-down" />
        </span>
      </button>
      <ul
        className={cs(
          'absolute z-10 max-h-64 w-screen max-w-[500px] overflow-y-auto rounded-md bg-ds-background shadow-md ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-ds-container dark:shadow-lg dark:ring-1 dark:ring-ds-gray-tertiary',
          { hidden: !toggle }
        )}
        tabIndex="-1"
        role="listbox"
        aria-labelledby="listbox-label"
      >
        {isGh ? (
          <li className="flex justify-between border-b border-ds-border-line px-4 py-3">
            <A to={{ pageName: 'codecovAppInstallation' }}>
              <Icon name="plus-circle" />
              Install Codecov GitHub app
            </A>
          </li>
        ) : (
          <li className="flex justify-between border-b border-ds-border-line px-4 py-3 text-xs font-semibold">
            <span>Switch context</span>
          </li>
        )}
        {contexts.map((context) => (
          <ContextItem
            defaultOrgUsername={defaultOrgUsername}
            context={context}
            key={context?.owner?.username}
            currentContext={activeContext}
            setToggle={setToggle}
            owner={activeContext?.username}
          />
        ))}
        <Loader isLoading={isLoading} />
        <LoadMoreTrigger
          intersectionRef={intersectionRef}
          onLoadMore={onLoadMore}
        />
      </ul>
    </div>
  )
}

ContextSwitcher.propTypes = {
  buttonVariant: PropTypes.oneOf(['default', 'outlined']),
  contexts: PropTypes.arrayOf(
    PropTypes.shape({
      owner: PropTypes.shape({
        avatarUrl: PropTypes.string.isRequired,
        username: PropTypes.string,
      }),
      pageName: PropTypes.string.isRequired,
    })
  ).isRequired,
  currentUser: PropTypes.shape({
    defaultOrgUsername: PropTypes.string,
  }),
  activeContext: PropTypes.shape({
    avatarUrl: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
  }),
  onLoadMore: PropTypes.func,
  isLoading: PropTypes.bool,
}

export default ContextSwitcher
