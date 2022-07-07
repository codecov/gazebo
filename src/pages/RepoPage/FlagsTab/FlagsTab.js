import { Suspense } from 'react'
import { Route } from 'react-router-dom'

import Spinner from 'ui/Spinner'

function FlagsTab() {
  const Loader = (
    <div className="flex items-center justify-center py-16">
      <Spinner />
    </div>
  )
  return (
    <div className="flex flex-col gap-4 mx-4 md:mx-0">
      <h1>Flags Header Component</h1>
      <div className="flex flex-1 flex-col gap-4 border-t border-solid border-ds-gray-secondary">
        <Route path="/:provider/:owner/:repo/flags" exact>
          <Suspense fallback={Loader}>
            {/*Flags table*/}
            <h1>Flags table</h1>
          </Suspense>
        </Route>
      </div>
    </div>
  )
}

export default FlagsTab
