import cs from 'classnames'
import { type MouseEvent, useState } from 'react'

import config from 'config'

import CopyClipboard from 'ui/CopyClipboard'

import {
  aplineLinuxSystemInstructions,
  linuxSystemInstructions,
  macOSSystemInstructions,
  selfHostedSystemInstructions,
  windowsSystemInstructions,
} from './instructions'

const systemsEnum = Object.freeze({
  LINUX: 'Linux',
  ALPINE: 'Alpine Linux',
  MACOS: 'macOS',
  WINDOWS: 'Windows',
})

const systemsMapper = Object.freeze({
  Linux: linuxSystemInstructions,
  'Alpine Linux': aplineLinuxSystemInstructions,
  macOS: macOSSystemInstructions,
  Windows: windowsSystemInstructions,
})

const systems = [
  systemsEnum.LINUX,
  systemsEnum.ALPINE,
  systemsEnum.MACOS,
  systemsEnum.WINDOWS,
]

export function InstructionBox() {
  const [curSystem, setCurSystem] = useState<string>(systemsEnum.LINUX)

  const handleInstructionClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const name = e.currentTarget.name
    setCurSystem(name)
  }

  const systemContent = config.IS_SELF_HOSTED
    ? selfHostedSystemInstructions
    : systemsMapper[curSystem as keyof typeof systemsMapper]

  return (
    <div
      className="w-auto rounded bg-ds-gray-primary"
      data-testid="instruction-box"
    >
      <div className="flex h-auto flex-row overflow-auto bg-ds-gray-secondary">
        {systems.map((system, idx) => (
          <button
            className={cs('self-center py-2 px-4 outline-none', {
              'bg-gray-100': system === curSystem,
              'bg-gray-200 hover:bg-gray-300': system !== curSystem,
            })}
            onClick={handleInstructionClick}
            name={system}
            key={idx}
          >
            {system}
          </button>
        ))}
      </div>
      <div className="flex flex-row overflow-auto p-4">
        <pre>{systemContent}</pre>
        <span className="md:ml-auto">
          <CopyClipboard string={systemContent} />
        </span>
      </div>
    </div>
  )
}
