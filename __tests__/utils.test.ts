import { parseTags, isUrl, parseParameters } from '../src/utils'

jest.mock('@actions/core')

describe('Determine a valid url', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('returns true on a valid url', async () => {
    const truthy = isUrl(
      'https://s3.amazonaws.com/templates/myTemplate.template?versionId=123ab1cdeKdOW5IH4GAcYbEngcpTJTDW'
    )
    expect(truthy).toBeTruthy()
  })

  test('returns false on path', async () => {
    const falsy = isUrl('./template.json')
    expect(falsy).toBeFalsy()
  })
})

describe('Parse Tags', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('returns undefined on non valid JSON', async () => {
    const json = parseTags('')
    expect(json).toBeUndefined()
  })

  test('returns valid Array on valid JSON', async () => {
    const json = parseTags(JSON.stringify([{ Key: 'Test', Value: 'Value' }]))
    expect(json).toEqual([{ Key: 'Test', Value: 'Value' }])
  })
})

describe('Parse Parameters', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('returns parameters list from string', async () => {
    const json = parseParameters(
      `
      MyParam1: myValue1
      MyParam2: myValue2
      `,
      ''
    )
    expect(json).toEqual([
      {
        ParameterKey: 'MyParam1',
        ParameterValue: 'myValue1'
      },
      {
        ParameterKey: 'MyParam2',
        ParameterValue: 'myValue2'
      }
    ])
  })

  test('returns parameters list from string', async () => {
    const json = parseParameters(
      `
      MyParam1: myValue1
      MyParam2:
        - myValue2
        - myValue3
      `,
      ''
    )
    expect(json).toEqual([
      {
        ParameterKey: 'MyParam1',
        ParameterValue: 'myValue1'
      },
      {
        ParameterKey: 'MyParam2',
        ParameterValue: 'myValue2,myValue3'
      }
    ])
  })

  test('returns parameters list from file', async () => {
    const json = parseParameters('', '../__tests__/params.test.json')
    expect(json).toEqual([
      {
        ParameterKey: 'MyParam1',
        ParameterValue: 'myValue1'
      },
      {
        ParameterKey: 'MyParam2',
        ParameterValue: 'myValue2'
      }
    ])
  })

  test('throws error if file is not found', async () => {
    expect(() =>
      parseParameters('', '__tests__/params-invalid.tezt.json')
    ).toThrow()
  })

  test('throws error if json in file cannot be parsed', async () => {
    expect(() =>
      parseParameters('', '__tests__/params-invalid.test.json')
    ).toThrow()
  })
})
