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

function ContextItem({
  context,
  currentContext,
  defaultOrgUsername,
  setToggle,
}) {
  const { owner, pageName } = context
  const orgUsername = owner?.username
  const isActiveContext =
    orgUsername?.toLowerCase() ===
    currentContext?.owner?.username?.toLowerCase()
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
        <Avatar user={owner} bordered />
        <div className={cs('mx-1', { 'font-semibold': isActiveContext })}>
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
  currentContext: PropTypes.shape({
    owner: PropTypes.shape({ username: PropTypes.string }),
  }),
  defaultOrgUsername: PropTypes.string,
  setToggle: PropTypes.func.isRequired,
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
  activeContext,
  contexts,
  currentUser,
  isLoading,
  onLoadMore,
  ModalControl,
  ModalComponent,
}) {
  const [toggle, setToggle] = useState(false)
  const wrapperRef = useCloseOnLooseFocus({ setToggle })
  const intersectionRef = useLoadMore({ onLoadMore })
  const currentContext = getCurrentContext({ activeContext, contexts })
  const { provider } = useParams()
  const defaultOrgUsername = currentUser?.defaultOrgUsername

  const isGh = providerToName(provider) === 'Github'

  return (
    <div id="context-switcher" className="relative text-sm" ref={wrapperRef}>
      <button
        type="button"
        className={cs(
          '"relative flex gap-1 items-center text-xl font-semibold w-full rounded-md bg-white py-1.5 text-left text-gray-900 focus:outline-none"',
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
        <Avatar user={currentContext.owner} bordered />
        <p className="ml-1">{currentContext.owner.username}</p>
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
      >
        <li className="flex justify-between border-b border-ds-gray-secondary px-4 py-3 text-xs font-semibold">
          <span>Switch context</span>
          <ModalSection
            ModalControl={ModalControl}
            ModalComponent={ModalComponent}
          />
        </li>
        {contexts.map((context) => (
          <ContextItem
            defaultOrgUsername={defaultOrgUsername}
            context={context}
            key={context?.owner?.username}
            currentContext={currentContext}
            setToggle={setToggle}
          />
        ))}
        <Loader isLoading={isLoading} />
        <LoadMoreTrigger
          intersectionRef={intersectionRef}
          onLoadMore={onLoadMore}
        />
        {isGh && (
          <li className="px-4 py-2 text-ds-blue-darker">
            <A to={{ pageName: 'codecovAppInstallation' }}>
              <Icon name="plus-circle" />
              Add GitHub organization
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
}

export default ContextSwitcher
