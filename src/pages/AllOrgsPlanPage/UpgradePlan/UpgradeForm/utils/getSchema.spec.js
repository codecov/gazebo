import { getSchema } from './getSchema'

describe('getSchema', () => {
  it('passes parsing when all conditions are met', () => {
    const accountDetails = {
      activatedUserCount: 2,
    }
    const schema = getSchema({ accountDetails, minSeats: 5 })

    const response = schema.safeParse({ seats: 10 })
    expect(response.success).toEqual(true)
    expect(response.error).toBeUndefined()
  })

  it('fails to parse when seats is not a number', () => {
    const accountDetails = {
      activatedUserCount: 2,
    }
    const schema = getSchema({ accountDetails, minSeats: 5 })

    const response = schema.safeParse({ seats: 'ahh' })
    expect(response.success).toEqual(false)

    const [issue] = response.error.issues
    expect(issue).toEqual(
      expect.objectContaining({
        message: 'Seats is required to be a number',
      })
    )
  })

  it('fails to parse when the seats are below the minimum', () => {
    const accountDetails = {
      activatedUserCount: 2,
    }
    const schema = getSchema({ accountDetails, minSeats: 5 })

    const response = schema.safeParse({ seats: 3 })
    expect(response.success).toEqual(false)

    const [issue] = response.error.issues
    expect(issue).toEqual(
      expect.objectContaining({
        message: 'You cannot purchase a per user plan for less than 5 users',
      })
    )
  })

  it('fails to parse when seats are below activated seats', () => {
    const accountDetails = {
      activatedUserCount: 5,
    }
    const schema = getSchema({ accountDetails, minSeats: 1 })

    const response = schema.safeParse({ seats: 3 })
    expect(response.success).toBe(false)

    const [issue] = response.error.issues
    expect(issue).toEqual(
      expect.objectContaining({
        message: 'Must deactivate more users before downgrading plans',
      })
    )
  })
})
