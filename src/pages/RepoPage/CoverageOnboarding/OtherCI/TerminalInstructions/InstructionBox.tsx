import cs from 'classnames'
import { type MouseEvent, useState } from 'react'

import { CopyClipboard } from 'ui/CopyClipboard'

import {
  alpineLinuxArm64Instructions,
  alpineLinuxSystemInstructions,
  linuxArm64SystemInstructions,
  linuxSystemInstructions,
  macOSSystemInstructions,
  windowsSystemInstructions,
} from './instructions'

const systemsEnum = Object.freeze({
  LINUX: 'Linux',
  ALPINE: 'Alpine Linux',
  MACOS: 'macOS',
  WINDOWS: 'Windows',
  LINUXARM64: 'Linux Arm64',
  ALPINELINUXARM64: 'Alpine Linux Arm64',
})

const systemsMapper = Object.freeze({
  Linux: linuxSystemInstructions,
  'Alpine Linux': alpineLinuxSystemInstructions,
  macOS: macOSSystemInstructions,
  Windows: windowsSystemInstructions,
  'Linux Arm64': linuxArm64SystemInstructions,
  'Alpine Linux Arm64': alpineLinuxArm64Instructions,
})

const systems = [
  systemsEnum.LINUX,
  systemsEnum.ALPINE,
  systemsEnum.MACOS,
  systemsEnum.WINDOWS,
  systemsEnum.LINUXARM64,
  systemsEnum.ALPINELINUXARM64,
]

export function InstructionBox() {
  const [currSystem, setCurrSystem] = useState<string>(systemsEnum.LINUX)

  const handleInstructionClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const name = e.currentTarget.name
    setCurrSystem(name)
  }

  const systemContent = systemsMapper[currSystem as keyof typeof systemsMapper]

  return (
    <div
      className="w-auto rounded border border-ds-border-line bg-ds-gray-primary"
      data-testid="instruction-box"
    >
      <div className="flex w-full flex-row overflow-auto rounded-t bg-ds-sub-background">
        {systems.map((system, idx) => (
          <button
            className={cs('self-center py-2 px-4 outline-none', {
              'bg-ds-gray-primary': system === currSystem,
              'bg-ds-sub-background hover:bg-ds-sub-hover-background':
                system !== currSystem,
            })}
            onClick={handleInstructionClick}
            name={system}
            key={idx}
          >
            {system}
          </button>
        ))}
      </div>
      <div className="flex justify-end">
        <div className="overflow-auto p-4">
          <pre>{systemContent}</pre>
        </div>
        <div className="absolute m-4">
          <CopyClipboard
            value={systemContent}
            label="Copy commands to download and verify the Codecov CLI for your system"
          />
        </div>
      </div>
    </div>
  )
}
