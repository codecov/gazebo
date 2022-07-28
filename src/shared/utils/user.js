// Reusable access control utility for deciding if a user has access to a repo.
export function userHasAccess({ privateRepo, isCurrentUserPartOfOrg }) {
  if (!privateRepo) {
    return true
  }
  if (privateRepo && isCurrentUserPartOfOrg) {
    return true
  }
  return false
}
