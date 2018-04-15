# Operators

**Emmis** does not ship with any operators. On this page you rather get examples of how to build your custom operators. This gives you insight into the flexbility of the API and inspiration to create your own operators.

## log
Logs out current payload with a label.

**example**
```js
const doThis = chain()
  .log('payload') // "payload foo"

doThis('foo')
```

**reducer**
```js
function (payload, operator) {
  switch (operator.type) {
    case 'log':
      console.log(operator.args[0], payload)
      break;
  }
  return payload
}
```

**typing**
```typescript
interface Chain<Input, Initial = Input> extends IProxyChain<Input, Initial> {
  log: (message: string) => Chain<Input, Initial>
}
```

## delay
Delays further execution by *x* number of milliseconds.

**example**
```js
const doThis = chain()
  .delay(1000) // delayes further execution by 1 second

doThis('foo')
```

**reducer**
```js
function (payload, operator) {
  switch (operator.type) {
    case 'delay':
      return new Promise(resolve =>
        setTimeout(() => resolve(payload), operator.args[0])
      )
  }
  return payload
}
```

**typing**
```typescript
interface Chain<Input, Initial = Input> extends IProxyChain<Input, Initial> {
  delay: (ms: number) => Chain<Input, Initial>
}
```

## map
Transforms the payload into a new payload.

**example**
```js
const toUpper = string => string.toUpperCase()

const doThis = chain()
  .map(toUpper) // "FOO"

doThis('foo')
```

**reducer**
```js
function (payload, operator) {
  switch (operator.type) {
    case 'map':
      return operator.args[0](payload)
  }
  return payload
}
```

**typing**
```typescript
interface Chain<Input, Initial = Input> extends IProxyChain<Input, Initial> {
  map: <Output>(cb: (payload: Input) => Output) => Chain<Output, Initial>
}
```

## http
Does http requests.

**example**
```js
const doThis = chain()
  .http('get', '/user', {
    success: chain(),
    error: chain()
  })

doThis('foo')
```

**reducer**
```js
function (payload, operator) {
  switch (operator.type) {
    case 'http':
      const method = operator.args[0]
      const url = operator.args[1]
      const paths = operator.args[2]
      return axios[method](url)
        .then((response) => paths.success(response.data))
        .catch(error => paths.error(error))
  }
  return payload
}
```

**typing**
```typescript
interface Chain<Input, Initial = Input> extends IProxyChain<Input, Initial> {
  http: <Data>(method: string, url: string, paths: {
    success: Chain<Data, Input>,
    error: Chain<Error, Input>
  }) => Chain<Data, Initial> | Chain<Error, Initial>
}
```

## filter
Only continues execution if the predicate is met.

**example**
```js
const minLength = length => string => string.length >= length

const doThis = chain()
  .filter(minLength(3), chain()
    .log()
  )

doThis('foo')
```

**reducer**
```js
function (payload, operator) {
  switch (operator.type) {
    case 'filter':
      const shouldContinue = operator.args[0](payload)
      return shouldContinue ? operator.args[1](payload) : payload
  }
}
```

**typing**

Note that this typing requires the filtered chain to return the same type as the flter input.

```typescript
interface Chain<Input, Initial = Input> extends IProxyChain<Input, Initial> {
  filter: <Output>(
    cb: (payload: Input) => boolean,
    continueChain: Chain<Input, Input>
  ) => Chain<Input, Initial>
}
```