import * as aws from 'aws-sdk'
import * as path from 'path'
import { debug } from '@actions/core'
import * as fs from 'fs'
import { Parameter } from 'aws-sdk/clients/cloudformation'
import { load } from 'js-yaml'

const { GITHUB_WORKSPACE = __dirname } = process.env

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
    const value = parameters.get(key)
    const parameterValue = Array.isArray(value)
      ? value.join(',')
      : value?.toString()
    return {
      ParameterKey: key,
      ParameterValue: parameterValue
    }
  })
}

export function parseParameters(
  parameterOverrides: string,
  parametersFile: string
): Parameter[] {
  const parameters = new Map<string, string>()
  if (parametersFile) {
    debug(`Loading parameters from ${parametersFile}`)
    const paramsFilePath = path.isAbsolute(parametersFile)
      ? parametersFile
      : path.join(GITHUB_WORKSPACE, parametersFile)
    const file = JSON.parse(fs.readFileSync(paramsFilePath, 'utf8'))
    Object.entries(file.Parameters).forEach(([key, value]) => {
      parameters.set(key, value as string)
    })
  }
  const params = load(parameterOverrides) as Record<string, string>
  if (!params) return convertParameters(parameters)

  Object.entries(params).forEach(([key, value]) => {
    parameters.set(key, value)
  })
  return convertParameters(parameters)
}
