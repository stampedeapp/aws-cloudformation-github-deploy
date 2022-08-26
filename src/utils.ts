import * as aws from 'aws-sdk'
import * as fs from 'fs'
import { Parameter } from 'aws-sdk/clients/cloudformation'

export function isUrl(s: string): boolean {
  let url

  try {
    url = new URL(s)
  } catch (_) {
    return false
  }

  return url.protocol === 'https:'
}

export function parseTags(s: string): aws.CloudFormation.Tags | undefined {
  let json

  try {
    json = JSON.parse(s)
  } catch (_) {}

  return json
}

export function parseARNs(s: string): string[] | undefined {
  return s?.length > 0 ? s.split(',') : undefined
}

export function parseString(s: string): string | undefined {
  return s?.length > 0 ? s : undefined
}

export function parseNumber(s: string): number | undefined {
  return parseInt(s) || undefined
}

function convertParameters(parameters: Map<string, string>): Parameter[] {
  return [...parameters.keys()].map(key => {
    return {
      ParameterKey: key,
      ParameterValue: parameters.get(key)
    }
  })
}

export function parseParameters(parameterOverrides: string): Parameter[] {
  try {
    const path = new URL(parameterOverrides)
    const rawParameters = fs.readFileSync(path, 'utf-8')

    const params = JSON.parse(rawParameters)
    if (params.Parameters) {
      return convertParameters(params.Parameters)
    }
    return params
  } catch (err) {
    if (err.code !== 'ERR_INVALID_URL') {
      throw err
    }
  }

  const parameters = new Map<string, string>()
  parameterOverrides.split(',').forEach(parameter => {
    const [key, value] = parameter.trim().split('=')
    let param = parameters.get(key)
    param = !param ? value : [param, value].join(',')
    parameters.set(key, param)
  })
  return convertParameters(parameters)
}
