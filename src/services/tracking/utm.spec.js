import { renderHook } from '@testing-library/react-hooks'
import Cookie from 'js-cookie'
import { useUTM } from './utm'

describe('useUTM', () => {
  let originalLocation

  function setup(search) {
    window.location = {
      search,
    }
    renderHook(() => useUTM())
  }

  beforeEach(() => {
    originalLocation = window.location
    delete window.location
  })

  afterEach(() => {
    window.location = originalLocation
    Cookie.remove('utmParams')
  })

  it("creates a cookie with title 'utmParams' only with utm strings", () => {
    const search =
      '?utm_medium=social%20media&utm_source=twitter&utm_campaign=organic_social&utm_department=marketing'
    setup(search)
    const utmCookie = Cookie.get('utmParams')
    expect(utmCookie).toBeDefined()
    expect(utmCookie).toBe(
      'utm_source=twitter&utm_medium=social%20media&utm_campaign=organic_social&utm_department=marketing'
    )
  })

  it("does not create a cookie if url params don't include utm strings", () => {
    const search =
      '?ashton=barbarian&laudna=warlock&FCG=cleric&chetney=rogue&orym=fighter&fearne=druid&dorian=bard&imogen=sorcerer'
    setup(search)
    const utmCookie = Cookie.get('utmParams')
    expect(utmCookie).toBeUndefined()
  })
})
