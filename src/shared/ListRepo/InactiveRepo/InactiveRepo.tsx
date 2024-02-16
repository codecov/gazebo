import AppLink from 'shared/AppLink'

function InactiveRepo({
  owner,
  isActive,
  repoName,
  isCurrentUserPartOfOrg,
}: {
  owner: string
  isActive: boolean
  repoName?: string
  isCurrentUserPartOfOrg?: boolean
}) {
  if (isActive) return <>Deactivated</>
  if (!isCurrentUserPartOfOrg) return <>Inactive</>

  return (
    // @ts-ignore
    <AppLink
      className="flex items-center rounded bg-ds-blue px-4 py-1 font-semibold text-gray-100"
      pageName="new"
      options={{
        owner,
        repo: repoName,
      }}
    >
      Configure
    </AppLink>
  )
}

export default InactiveRepo
