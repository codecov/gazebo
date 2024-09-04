/* eslint-disable camelcase */
import * as Popover from '@radix-ui/react-popover'
import { format } from 'date-fns'
import { type DateRange, DayPicker } from 'react-day-picker'

import Icon from 'ui/Icon/Icon'

interface DateRangePickerProps {
  startDate?: Date
  endDate?: Date
  onChange: (args: DateRange | undefined) => void
}

export default function DateRangePicker({
  startDate,
  endDate,
  onChange,
}: DateRangePickerProps) {
  const date = {
    from: startDate,
    to: endDate,
  }

  return (
    <div>
      <Popover.Root>
        <Popover.Trigger asChild>
          <button className="flex h-8 w-52 items-center justify-between whitespace-nowrap rounded-md border border-ds-gray-tertiary bg-ds-container px-3 text-center focus:outline-1 disabled:border-ds-gray-tertiary disabled:bg-ds-gray-primary disabled:text-ds-gray-quaternary">
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'LLL dd, y')} -{' '}
                  {format(date.to, 'LLL dd, y')}
                </>
              ) : (
                format(date.from, 'LLL dd, y')
              )
            ) : (
              <span>Pick a date</span>
            )}
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            align="start"
            className="w-auto rounded-md border border-ds-gray-tertiary bg-ds-container px-1 py-0 dark:text-white"
          >
            <div className="flex flex-row-reverse">
              <Popover.Close className="p-1">
                <Icon name="x" size="sm" />
              </Popover.Close>
            </div>
            <DayPicker
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={onChange}
              numberOfMonths={2}
              toDate={new Date()}
              showOutsideDays={true}
              classNames={{
                months:
                  'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                month: 'space-y-4',
                caption: 'flex justify-center relative items-center',
                caption_label: 'text-sm font-medium',
                nav: 'space-x-1 flex items-center',
                nav_button:
                  'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
                nav_button_previous: 'absolute left-1 hover:cursor-pointer',
                nav_button_next: 'absolute right-1 hover:cursor-pointer',
                table: 'w-full border-collapse space-y-1',
                head_row: 'flex',
                head_cell:
                  'text-gray-tertiary rounded-md w-8 font-normal text-[0.8rem]',
                row: 'flex w-full mt-0.5',
                cell: 'text-center text-sm p-0 relative [&:has([aria-selected])]:bg-ds-pink-secondary first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
                day: 'h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-ds-pink-secondary hover:text-white',
                day_selected:
                  'bg-ds-pink-default text-white hover:bg-ds-pink-secondary hover:text-white focus:bg-ds-pink-default focus:white',
                day_today: 'bg-ds-pink-tertiary text-white',
                day_outside: 'text-ds-secondary-text opacity-50',
                day_disabled: 'text-ds-secondary-text opacity-50',
                day_range_middle:
                  'aria-selected:bg-ds-pink-secondary aria-selected:text-white aria-selected:hover:bg-ds-pink-default',
                day_hidden: 'invisible',
              }}
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  )
}
