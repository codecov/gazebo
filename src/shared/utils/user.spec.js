import { userHasAccess } from './user'

describe('user', () => {
  describe.each`
    privateRepo | isCurrentUserPartOfOrg | expected
    ${false}    | ${false}               | ${true}
    ${false}    | ${true}                | ${true}
    ${true}     | ${false}               | ${false}
    ${true}     | ${true}                | ${true}
  `('userHasAccess', ({ privateRepo, isCurrentUserPartOfOrg, expected }) => {
    it(`If the current user is part of the org (${isCurrentUserPartOfOrg}) and the repo is private ${privateRepo}`, () => {
      expect(userHasAccess({ privateRepo, isCurrentUserPartOfOrg })).toBe(
        expected
      )
    })
  })
})
