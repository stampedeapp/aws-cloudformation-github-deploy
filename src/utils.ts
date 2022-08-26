import * as aws from 'aws-sdk'
import * as fs from 'fs'
import { Parameter } from 'aws-sdk/clients/cloudformation'
import { load } from 'js-yaml'

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

export function parseParameters(
  parameterOverrides: string,
  parametersFile: string
): Parameter[] {
  const parameters = new Map<string, string>()
  if (parametersFile) {
    const path = new URL(parameterOverrides)
    const parameters = JSON.parse(fs.readFileSync(path, 'utf8'))
    Object.entries(parameters.Parameters).forEach(([key, value]) => {
      parameters.set(key, value)
    })
  }
  const params = load(parameterOverrides) as Record<string, string>
  Object.entries(params).forEach(([key, value]) => {
    parameters.set(key, value)
  })
  return convertParameters(parameters)
}
