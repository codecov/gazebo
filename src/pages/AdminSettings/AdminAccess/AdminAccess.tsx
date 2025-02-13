import { Suspense } from 'react'

import A from 'ui/A'
import Spinner from 'ui/Spinner'

import AdminAccessTable from './AdminAccessTable'

const Loader = () => (
  <div className="flex justify-center py-8">
    <Spinner />
  </div>
)

function AdminAccess() {
  return (
    <>
      <div className="pb-4">
        <h2 className="text-2xl font-semibold">Administrator Access</h2>
        <p>
          Admins are permitted to add other admins, change user activation
          status, and modify the organization&apos;s plan.
        </p>
      </div>
      <hr />
      <p className="py-4 text-xs">
        Admins can be edited in the{' '}
        {/* @ts-expect-error - A hasn't been typed yet */}
        <A
          hook="docs"
          href="https://docs.codecov.com/v5.0/docs/configuration"
          isExternal
        >
          install.yml
        </A>{' '}
        {/* @ts-expect-error - A hasn't been typed yet */}
        <A
          hook="docs"
          href="https://docs.codecov.com/v5.0/docs/configuration#install-wide-admins"
          isExternal
        >
          learn more
        </A>
      </p>
      <Suspense fallback={<Loader />}>
        <AdminAccessTable />
      </Suspense>
    </>
  )
}

export default AdminAccess
