import { forwardMarketingTag } from './url'

describe('forwardMarketingTag', () => {
  it('returns an object containing the specified utm parameters only', () => {
    const queryParams =
      '?utm_medium=social%20media&utm_source=twitter&utm_campaign=organic_social&utm_department=marketing'
    expect(forwardMarketingTag(queryParams)).toStrictEqual({
      utm_campaign: 'organic_social',
      utm_department: 'marketing',
      utm_medium: 'social media',
      utm_source: 'twitter',
    })
  })

  it('returns an empty object if no utm parameters are present in a query string', () => {
    const queryParams =
      '?ashton=barbarian&laudna=warlock&FCG=cleric&chetney=rogue&orym=fighter&fearne=druid&dorian=bard&imogen=sorcerer'
    expect(forwardMarketingTag(queryParams)).toStrictEqual({})
  })
})
