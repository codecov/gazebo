import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'

import { useMyContexts } from 'services/user'
import ContextSwitcher from 'ui/ContextSwitcher'

import UpdateDefaultOrgModal from './UpdateDefaultOrgModal'

function MyContextSwitcher({ activeContext, pageName, allOrgsPageName }) {
  const { provider } = useParams()
  const {
    data: myContexts,
    hasNextPage,
    fetchNextPage,
    isLoading,
  } = useMyContexts({ provider })

  if (!myContexts || !myContexts?.currentUser) return null

  const { currentUser, myOrganizations } = myContexts

  const contexts = [
    {
      owner: currentUser,
      pageName,
    },
    ...myOrganizations.map((context) => ({
      owner: context,
      pageName,
    })),
  ]

  return (
    <div className="max-w-[350px]">
      <ContextSwitcher
        activeContext={activeContext}
        contexts={contexts}
        currentUser={currentUser}
        isLoading={isLoading}
        onLoadMore={() => hasNextPage && fetchNextPage()}
        allOrgsPageName={allOrgsPageName}
        ModalControl={({ onClick }) => (
          <button
            className="flex-none text-ds-blue hover:underline"
            onClick={onClick}
          >
            Edit default
          </button>
        )}
        ModalComponent={({ closeFn, showComponent }) => {
          return (
            <UpdateDefaultOrgModal
              closeModal={closeFn}
              isOpen={showComponent}
            />
          )
        }}
      />
    </div>
  )
}

MyContextSwitcher.propTypes = {
  /*
   ** The active user
   */
  activeContext: PropTypes.string,
  /*
   ** The page name where each context will point to
   */
  pageName: PropTypes.string.isRequired,
  allOrgsPageName: PropTypes.string,
}

export default MyContextSwitcher
