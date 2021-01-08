export const FilterEnum = Object.freeze({ none: 0, true: 1, false: 2 })

function filterQuery(key, value) {
  if (value === FilterEnum.none) return { [key]: '' }
  if (value === FilterEnum.true) return { [key]: 'True' } // API only accepts string with capital letter...
  if (value === FilterEnum.false) return { [key]: 'False' } // API only accepts string with capital letter...
  return {}
}

function createQuery(
  prev,
  { search, activated, isAdmin: is_admin, ordering } = {}
) {
  const queryShape = {
    ...prev,
    ...(search && { search }),
    ...(ordering && { ordering: ordering.q }),
    ...filterQuery('activated', activated?.q),
    ...filterQuery('is_admin', is_admin?.q),
  }

  return queryShape
}

export default createQuery
