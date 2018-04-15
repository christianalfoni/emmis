# How it works

**Emmis** is based on proxies. That means when you do:

``` js
const doThis = chain().log()

doThis()
```

The **chain** actually returns a [proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) that intercepts all calls to the operators. Instead of running the method it creates a task to be executed. This task looks like:

```js
{
  type: 'log',
  args: []
}
```

When you actually execute the chain, *doThis()*, it will reduce over these tasks with the passed in payload and manage usage of promises. This simple idea allows you to create a lot of different operators.