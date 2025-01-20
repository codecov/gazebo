import cs from 'classnames'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useIntersection } from 'react-use'
import useClickAway from 'react-use/lib/useClickAway'

import config, { DEFAULT_GH_APP } from 'config'

import { useUpdateDefaultOrganization } from 'services/defaultOrganization'
import { eventTracker } from 'services/events/events'
import { useOwner } from 'services/user'
import { Provider } from 'shared/api/helpers'
import { providerToName } from 'shared/utils/provider'
import A from 'ui/A'
import Avatar from 'ui/Avatar'
import Button from 'ui/Button'
import Icon from 'ui/Icon'
import Spinner from 'ui/Spinner'

interface LoadMoreTriggerProps {
  onLoadMore?: () => void
  intersectionRef: React.Ref<HTMLSpanElement>
}

function LoadMoreTrigger({
  intersectionRef,
  onLoadMore,
}: LoadMoreTriggerProps) {
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

interface ContextItemProps {
  context: Context
  defaultOrgUsername: string | null
  setToggle: (arg: boolean) => void
  owner?: string | null
}

function ContextItem({
  context,
  defaultOrgUsername,
  setToggle,
  owner,
}: ContextItemProps) {
  const { owner: contextOwner, pageName } = context
  const orgUsername = contextOwner?.username
  const { mutate } = useUpdateDefaultOrganization()

  return (
    <li
      className="cursor-pointer select-none py-2 text-gray-900 hover:bg-ds-gray-secondary"
      id="listbox-option-0"
    >
      <Button
        disabled={false}
        hook="context-switcher-toggle"
        to={{ pageName: pageName, options: { owner: orgUsername } }}
        variant="listbox"
        onClick={() => {
          setToggle(false)
          if (defaultOrgUsername === orgUsername) return

          mutate({ username: orgUsername ?? null })
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

function useCloseOnLooseFocus({
  setToggle,
}: {
  setToggle: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const ref = useRef(null)
  useClickAway(ref, () =>
    setToggle((toggle: boolean) => (!toggle ? toggle : false))
  )

  return ref
}

function useLoadMore({ onLoadMore }: { onLoadMore: (() => void) | undefined }) {
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

const Loader = ({ isLoading }: { isLoading: boolean }) => {
  if (!isLoading) return null
  return (
    <span className="flex justify-center pb-2 pt-1">
      <Spinner />
    </span>
  )
}

interface Context {
  owner: {
    avatarUrl: string
    username: string | null
  } | null
  pageName: string
}

export interface Props {
  buttonVariant?: 'default' | 'outlined'
  contexts: Context[]
  currentUser: {
    defaultOrgUsername: string | null
  }
  activeContext: ReturnType<typeof useOwner>['data']
  onLoadMore?: () => void
  isLoading: boolean
}

interface URLParams {
  provider: Provider
  owner: string
}

function ContextSwitcher({
  buttonVariant = 'default',
  contexts,
  currentUser,
  isLoading,
  onLoadMore,
  activeContext,
}: Props) {
  const { provider, owner } = useParams<URLParams>()
  const [toggle, setToggle] = useState<boolean>(false)
  const wrapperRef = useCloseOnLooseFocus({ setToggle })
  const intersectionRef = useLoadMore({ onLoadMore })
  const defaultOrgUsername = currentUser?.defaultOrgUsername

  const isGh = providerToName(provider) === 'GitHub'
  const isSelfHosted = config.IS_SELF_HOSTED
  const isCustomGitHubApp = config.GH_APP !== DEFAULT_GH_APP

  // self-hosted cannot use default "codecov" app (must set up custom one)
  const shouldShowGitHubInstallLink =
    isGh && (isSelfHosted ? isCustomGitHubApp : true)

  return (
    <div id="context-switcher" className="relative text-sm" ref={wrapperRef}>
      <button
        type="button"
        className={cs(
          '"relative flex gap-1 items-center text-xl font-semibold w-full rounded-md py-1.5 text-left text-gray-900 focus:outline-none"',
          buttonVariant === 'outlined' &&
            'ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 shadow-sm'
        )}
        id="listbox-label"
        aria-haspopup="listbox"
        aria-expanded={toggle}
        onClick={() => setToggle((toggle) => !toggle)}
      >
        <Avatar user={activeContext} />
        <p className="ml-1">{activeContext?.username ?? owner}</p>
        <span
          aria-hidden="true"
          className={cs('transition-transform', {
            'rotate-180': toggle,
            'rotate-0': !toggle,
          })}
        >
          <Icon variant="solid" name="chevronDown" />
        </span>
      </button>
      <ul
        className={cs(
          'absolute z-10 max-h-64 w-screen max-w-[500px] overflow-y-auto rounded-md bg-ds-background shadow-md ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-ds-container dark:shadow-lg dark:ring-1 dark:ring-ds-gray-tertiary',
          { hidden: !toggle }
        )}
        tabIndex={-1}
        role="listbox"
        aria-labelledby="listbox-label"
      >
        {shouldShowGitHubInstallLink ? (
          <li className="flex justify-between border-b border-ds-border-line px-4 py-3">
            <A
              to={{ pageName: 'codecovAppInstallation' }}
              onClick={() =>
                eventTracker().track({
                  type: 'Button Clicked',
                  properties: {
                    buttonType: 'Install GitHub App',
                    buttonLocation: 'Org selector',
                  },
                })
              }
              isExternal
              hook="context-switcher-gh-install-link"
            >
              <Icon name="plusCircle" />
              Install Codecov GitHub app
            </A>
          </li>
        ) : null}
        {contexts.map((context) => (
          <ContextItem
            defaultOrgUsername={defaultOrgUsername}
            context={context}
            key={context?.owner?.username}
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

export default ContextSwitcher
