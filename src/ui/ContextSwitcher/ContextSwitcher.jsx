import cs from 'classnames'
import PropTypes from 'prop-types'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useIntersection } from 'react-use'
import useClickAway from 'react-use/lib/useClickAway'

import { providerToName } from 'shared/utils/provider'
import A from 'ui/A'
import Avatar from 'ui/Avatar'
import Icon from 'ui/Icon'
import Spinner from 'ui/Spinner'

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

function ModalSection({ ModalControl, ModalComponent }) {
  const [showComponent, setShowComponent] = useState(false)
  if (ModalControl && ModalComponent) {
    return (
      <>
        <ModalControl onClick={() => setShowComponent(true)} />
        {showComponent && (
          <ModalComponent closeFn={() => setShowComponent(false)} />
        )}
      </>
    )
  }

  return null
}

ModalSection.propTypes = {
  ModalComponent: PropTypes.func,
  ModalControl: PropTypes.func,
}

function ContextItem({ context, currentContext, currentUser }) {
  const { owner, pageName } = context
  const isActiveContext = context === currentContext
  return (
    <li
      className="grid cursor-pointer select-none py-2 pl-3 pr-9 text-gray-900"
      id="listbox-option-0"
    >
      <A
        to={{ pageName: pageName, options: { owner: owner?.username } }}
        key={owner.username}
        variant="black"
      >
        <Avatar user={owner} bordered />
        <div className={cs('mx-1', { 'font-semibold': isActiveContext })}>
          {owner?.username}
        </div>
        {owner?.username === currentUser?.defaultOrgUsername && (
          <span className="font-medium text-ds-gray-quaternary">Default</span>
        )}
      </A>
    </li>
  )
}
ContextItem.propTypes = {
  context: PropTypes.shape({
    owner: PropTypes.shape({ username: PropTypes.string }),
    pageName: PropTypes.string,
  }),
  currentContext: PropTypes.shape({
    owner: PropTypes.shape({ username: PropTypes.string }),
  }),
  currentUser: PropTypes.shape({
    defaultOrgUsername: PropTypes.string,
  }),
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
    if (intersection?.isIntersecting && onLoadMore) {
      onLoadMore()
    }
  }, [intersection?.isIntersecting, onLoadMore])

  return ref
}

function ContextSwitcher({
  buttonVariant = 'default',
  activeContext,
  contexts,
  currentUser,
  isLoading,
  onLoadMore,
  ModalControl,
  ModalComponent,
  allOrgsPageName,
}) {
  const [toggle, setToggle] = useState(false)
  const wrapperRef = useCloseOnLooseFocus({ setToggle })
  const intersectionRef = useLoadMore({ onLoadMore })
  const currentContext = getCurrentContext({ activeContext, contexts })
  const { provider } = useParams()

  const isGh = providerToName(provider) === 'Github'

  return (
    <div id="context-switcher" className="relative text-sm" ref={wrapperRef}>
      <button
        type="button"
        className={cs(
          '"relative flex gap-1 items-center text-base font-bold w-full rounded-md bg-white py-1.5 text-left text-gray-900 focus:outline-none"',
          {
            [buttonVariant.outlined]:
              'ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 shadow-sm',
          }
        )}
        aria-haspopup="listbox"
        aria-expanded={toggle}
        onClick={() => setToggle((toggle) => !toggle)}
      >
        {currentContext ? (
          <>
            <Avatar user={currentContext.owner} bordered />
            <p className="ml-1">{currentContext.owner.username}</p>
          </>
        ) : (
          <>
            <Icon name="home" />
            <p className="ml-1">All my orgs and repos</p>
          </>
        )}
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
          'absolute z-10 max-h-64 w-full overflow-auto rounded-md bg-white shadow-md ring-1 ring-black ring-opacity-5 focus:outline-none',
          { hidden: !toggle }
        )}
        tabIndex="-1"
        role="listbox"
        aria-labelledby="listbox-label"
        aria-activedescendant="listbox-option-3"
      >
        <li className="flex justify-between border-b border-ds-gray-secondary px-4 py-3 text-xs font-semibold">
          <span>Switch context</span>
          <ModalSection
            ModalControl={ModalControl}
            ModalComponent={ModalComponent}
          />
        </li>
        <li
          className="relative grid cursor-pointer select-none py-3 pl-4 pr-9 text-xs text-gray-900"
          id="listbox-option-0"
        >
          <A to={{ pageName: allOrgsPageName ?? 'provider' }} variant="black">
            <Icon name="home" />
            <div className={cs('mx-1', { 'font-semibold': !activeContext })}>
              All orgs and repos
            </div>
          </A>
        </li>
        {contexts.map((context, index) => (
          <ContextItem
            context={context}
            key={index}
            currentUser={currentUser}
            currentContext={currentContext}
          />
        ))}
        {isLoading && (
          <span className="flex justify-center pb-2 pt-1">
            <Spinner />
          </span>
        )}
        <LoadMoreTrigger
          intersectionRef={intersectionRef}
          onLoadMore={onLoadMore}
        />
        {isGh && (
          <li className="flex max-h-64 flex-col gap-1 overflow-y-auto border-t border-ds-gray-secondary px-4 py-3 text-xs text-ds-gray-quinary">
            <span className="font-semibold">Don&apos;t see your org?</span>
            <A to={{ pageName: 'userAppManagePage' }}>
              {' '}
              Manage access restrictions
            </A>
          </li>
        )}
      </ul>
    </div>
  )
}

ContextSwitcher.propTypes = {
  buttonVariant: PropTypes.oneOf(['default', 'outlined']),
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
  }),
  onLoadMore: PropTypes.func,
  isLoading: PropTypes.bool,
  ModalComponent: PropTypes.func,
  ModalControl: PropTypes.func,
  allOrgsPageName: PropTypes.string,
}

export default ContextSwitcher
