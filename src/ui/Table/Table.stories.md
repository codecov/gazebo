<Meta of={TableStories} />

# Table UI developer guide

Table UI is a styles only "component" that provides the design system aspect of the "head" for our headless table library. Tables should be crafted on each page and configured as needed, as such these styles only apply our system's Table rules and is intensionally lite.

### Usage

Nest your table with a `div`, this lets the table start scrolling rather then breaking page layouts when a screen becomes too small for the content and there has been no custom responsiveness added.

```html
<div className="tableui">
  <table>
    ...
  </table>
  <div></div>
</div>
```

You are expected to follow `<table>` best practices when added tables to pages, use of `<caption>`'s, `<tbody>`, `<thead>`, `<tfoot>`, set correct scope attributes,and resolve any warnings in the console. (ex/ no nesting `divs` in `tr`'s)

### How to read the examples

The main thing to pay attention to is the use of `className`s throughout the example and `data-` attributes. Examples use a mix of basic html table renders and leveraging the [Tanstack table library](https://tanstack.com/table/v8/docs/guide/introduction) our codebase actually rely's on for table features.

Examples are written in TypeScript to help with refactoring tasks when going through each page replacing the old Table component.

### Style features provided

Data tags are used to opt into standardized styling/features. You can either statically set these in the table markdown or dynamically set them using JSX. Their use is optional.

1. `data-type="numeric"` Applied to th + tds, for columns who's content are numerical.
2. `data-highlight-row="onHover"` Applied to the root div, highlights table rows
3. `data-sort-direction={<tableSortState>}` Applied to any element, reads state, handles animation and rotating the element.
   - Note: Due to a limitation of postcss Tailwind can't use `@apply` and group hovers together, the example shows how to show the element on hover of the whole `th` rather then only the `Icon` element. This is how I'd recommend handling table header hover.

### Controlling Column Width

Browsers calculate making room for content and breaking correctly quiet well, which is why I would recommend trying to stick to letting table's do their thing rather then overriding their behavior.

```html
<table>
  <colgroup>
    <col className="w-full @sm/table:w-8/12" />
    <col className="@sm/table:w-1/12" />
    <col className="@sm/table:w-1/12" />
    <col className="@sm/table:w-1/12" />
    <col className="@sm/table:w-1/12" />
  </colgroup>
  <thead>
    <tr>
      <th>Filename</th>
      <th>Lines Missed</th>
      <th>HEAD %</th>
      <th>Patch %</th>
      <th>Change</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>/src/components/Select/Select.tsx</td>
      <td>789</td>
      <td>23.5%</td>
      <td>34%</td>
      <td>-2.5%</td>
    </tr>
  </tbody>
</table>
```

#### Manually setting the width's / screwing around with word breaks

This causes cascading "tweaks" throughout the styles and was the source of a lot of pain of the old tables. I will explain how to enable similar styling but I caution against it. Let tables be tables, design programs don't need to worry about changing real estate space.

`<table className="table-fixed">`

`<th className="w-1/3">`

### Responsiveness

With the markup in the hands of the implementor responsive concerns are mostly left to the developer / specific design. On the barest bones if the content of the table is too full, the table should start horizontally scrolling, however on a case by case basis you can improve the table's behavior on small screens.

> Check out the responsive storybook example for a demo styling with container queries.

#### Media Queries (old way)

Use of tailwind responsive utilities is still a valid option. `sm`, `md`, `lg` to modify the paddings, font sizes. You can also use these utilities to hide columns and move data to other columns on small screens.

#### Container Queries (preferred way)

TablueUI has been set up to have it's own [container query namespace](https://github.com/tailwindlabs/tailwindcss-container-queries) called "table", this triggers the size utilities _based on the tables render width_ not the screen width.

### Overriding defaults

If you have a table that needs to be non standard you can override table styles on a case by case basis using important. Ex/ `className="!p-4"`, important's should only be used to override tableui, do not use it if it's not needed. This is a preferable way to style responsiveness as it let's you no longer worry if the page layout is full or split, the "breakpoints" are now based the size of the table not the window.

From the responsive example, two columns are hidden on small screens and their data is moved into the "name" column. To achieve this I check the header/column id and apply `hidden @lg/table:table-cell`. This hides the `th` unless the table render space is greater then `lg`, if so render the `tr` with the default display setting `display: table-cell;`

```jsx
<tr key={headerGroup.id}>
  {headerGroup.headers.map((header) => (
    <th
      key={header.id}
      scope="col"
      className={cs({
        'hidden @lg/table:table-cell':
          header.id === 'title' || header.id === 'email',
      })}
    >
      {flexRender(header.column.columnDef.header, header.getContext())}
    </th>
  ))}
</tr>
```

### Testing

Testing is on each implementation, MSW for your data source and [html roles](https://www.w3.org/TR/html-aria/#docconformance) for selecting cells from the `table` likely work, or you can use data/test ids if needed.

| element     | role         |
| ----------- | ------------ |
| `<table>`   | table        |
| `<tbody>`   | rowgroup     |
| `<tfoot>`   | rowgroup     |
| `<thead>`   | rowgroup     |
| `<tr>`      | row          |
| `<th>`      | columnheader |
| `<td>`      | cell         |
| `<caption>` | N/A          |

- Note some of these roles can change based on context, check the linked docs for details.
