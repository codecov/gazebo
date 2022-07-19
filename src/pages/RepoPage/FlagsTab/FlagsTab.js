import { Suspense } from 'react'
import { Route } from 'react-router-dom'

import Spinner from 'ui/Spinner'

import FlagsBanner from './FlagsBanner'
import FlagsTable from './subroute/FlagsTable/FlagsTable'

function FlagsTab() {
  const Loader = (
    <div className="flex items-center justify-center py-16">
      <Spinner />
    </div>
  )
  return (
    <div className="flex flex-col gap-4 mx-4 md:mx-0">
      <h1>Flags Header Component</h1>
      <FlagsBanner />
      <div className="flex flex-1 flex-col gap-4 border-t border-solid border-ds-gray-secondary">
        <Route path="/:provider/:owner/:repo/flags" exact>
          <Suspense fallback={Loader}>
            {/* TODO: For whoever makes this table, you should add a "opts: {enabled: flagsMeasurementsBackfilled}"; you can get this from the "useRepoBackfilled" hook*/}
            <FlagsTable />
          </Suspense>
        </Route>
      </div>
    </div>
  )
}

export default FlagsTab
