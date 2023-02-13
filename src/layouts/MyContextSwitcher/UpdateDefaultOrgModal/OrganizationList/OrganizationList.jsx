import cs from 'classnames'
import PropTypes from 'prop-types'
import { useCallback, useEffect, useRef } from 'react'
import { useIntersection } from 'react-use'

import Avatar from 'ui/Avatar'

import { useOrganizations } from './hooks'

function LoadMoreTrigger({ intersectionRef, onLoadMore }) {
  if (!onLoadMore) {
    return null
  }

  return (
    <span
      ref={intersectionRef}
      className="relative top-[-65px] invisible block leading-[0]"
    >
      Loading more organizations...
    </span>
  )
}

LoadMoreTrigger.propTypes = {
  onLoadMore: PropTypes.func,
  intersectionRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
}

function OrganizationList({ selectedOrgUsername, setSelectedOrgUsername }) {
  const data = useOrganizations()
  const organizations = data?.organizations
  const currentUser = data?.currentUser

  const intersectionRef = useRef(null)
  const intersection = useIntersection(intersectionRef, {
    root: null,
    rootMargin: '0px',
    threshold: 0,
  })

  const onLoadMore = useCallback(
    () => data?.hasNextPage && data?.fetchNextPage(),
    [data]
  )

  useEffect(() => {
    if (intersection?.isIntersecting && onLoadMore) {
      onLoadMore()
    }
  }, [intersection?.isIntersecting, onLoadMore])

  return (
    <>
      <ul className="text-ds-gray-octonary divide-y border border-ds-gray-secondary">
        {organizations?.map((organization) => {
          const currentOrgUsername = organization?.username
          return (
            <li
              key={currentOrgUsername}
              className={cs(
                'flex p-4 hover:bg-ds-gray-primary transition duration-150 cursor-pointer',
                {
                  'hover:bg-ds-blue-selected bg-ds-blue-selected':
                    currentOrgUsername === selectedOrgUsername,
                }
              )}
              onClick={() => setSelectedOrgUsername(currentOrgUsername)}
            >
              <button className="flex items-center gap-3">
                <Avatar user={organization} bordered />
                <span>{currentOrgUsername}</span>
                {currentOrgUsername === currentUser?.defaultOrgUsername && (
                  <span className="text-ds-gray-quaternary font-medium">
                    Current default org
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
      <LoadMoreTrigger
        intersectionRef={intersectionRef}
        onLoadMore={onLoadMore}
      />
    </>
  )
}

OrganizationList.propTypes = {
  selectedOrgUsername: PropTypes.string.isRequired,
  setSelectedOrgUsername: PropTypes.func.isRequired,
}

export default OrganizationList
