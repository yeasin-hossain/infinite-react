---
title: Common Issues
description: Avoid common pitfalls and issues when using the component. Learn how to use it properly to perform smooth and avoid jank.
author: [admin]
---

As people have started using `<InfiniteTable />` we've noticed a few issues keep popping up.

While we're trying to refine our API to be easier to use and understand, developers using the component still need to be aware of some design decisions and conventions used in the component.

<!-- ## Issue: Using hooks directly in render functions

Columns in `<InfiniteTable />` have a <PropLink name="columns.render">render</PropLink> function, which should be a plain function, not a React component. When you directly specify a React component as a column `render` function you are breaking the [rules of React hooks](https://reactjs.org/docs/hooks-rules.html#only-call-hooks-from-react-functions).

So instead of doing


```ts  {11}
function Cmp({value}) {
  const onClick = useCallback(() => {
    // your logic
  }, [])
  return <div onClick={onClick}>{value}</div>;
}

const columns = {
  name: {
    field:'name',
    render: Cmp // do not do this
  }
}
```

You have to do


```ts  {11}
function Cmp({value}) {
  const onClick = useCallback(() => {
    // your logic
  }, [])
  return <div onClick={onClick}>{value}</div>;
}

const columns = {
  name: {
    field:'name',
    render: ({value}) => <Cmp value={value} />
  }
}
```

<PropLink name="columns.render" />, <PropLink name="columns.renderValue" /> and other render functions in columns need to be plain functions (they still can return `JSX`) and not React components. For most common cases a plain function is all you need - but rendering a component inside the function is also possible - in which case, you can use React hooks in that component. -->

## Issue: Performance degradation because props are new on every render

Passing new props on every render to the `<InfiniteTable />` component or to the `<DataSource />` component can be a performance bottleneck:

```ts
<DataSource
  // dont do this
  groupBy={[{ field: 'country' }]}
/>
```

Instead pass the **same** reference when things do change - stored in state or any other place:

```ts
const [groupBy, setGroupBy] = useState([{ field: 'country' }]);

<DataSource groupBy={groupBy} onGroupByChange={setGroupBy} />;
```

<Note>

When in dev mode, you can set `localStorage.debug = "*"` in your localstorage to see potential issues logged to the console. 

For example, you might see:

`InfiniteTable:rerender Triggered by new values for the following props +1s columns`

</Note>

## Issue: State inside custom components rendered in cells is lost while scrolling

When using custom rendering or custom components for columns, make sure all your rendering logic is [controlled](https://reactjs.org/docs/forms.html#controlled-components) and that it doesn't have any local or transient state.

This is important because `InfiniteTable` makes heavey use of virtualization, in both _column cells and column headers_, so **custom components can and will be unmounted and re-mounted multiple times**, during the virtualization process (triggered by user scrolling, sorting, filtering and a few other interactions).