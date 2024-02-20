import A from 'ui/A'

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
    <A
      variant="configure"
      isExternal={false}
      hook="configure-link"
      to={{
        pageName: 'new',
        options: {
          owner,
          repo: repoName,
        },
      }}
    >
      Configure
    </A>
  )
}

export default InactiveRepo
