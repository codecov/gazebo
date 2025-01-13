// Add new events to the union type here.
// Please keep the values of `type` very generic as we have a limited number of
// them. Instead, add more detail in `properties` where possible.
// Adding event types this way provides type safety for names and event
// properties.
// E.g., every 'Button Clicked' event must have the buttonType property.

export type Event =
  | {
      type: 'Button Clicked'
      properties: {
        buttonType: 'Install Github App' | 'Configure Repo'
        buttonLocation?: string
      }
    }
  | {
      type: 'Page Viewed'
      properties: {
        pageName: 'OwnerPage'
      }
    }
