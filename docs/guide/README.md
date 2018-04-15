# Introduction

**Emmis** allows you to express any application logic as chains. Native chaining abilities like *map*, *reduce* and *filter* works only on arrays and are meant to transform values. But this way of expressing logic can be very useful when not doing strict value transformation, but running side effects as well. The big benefit is more declarative and testable code.

## Install

```sh
npm install emmis
```

## Example

We want to create a very simple chaining API that just logs out the value passed into it:

```js
const logPayload = chain()
  .log() // "foo"

logPayload('foo')
```

We have to define our proxychain first passing in a reducer. 

```js
import { ProxyChain } from 'emmis'

// We switch on the operator type, identifying the "log" operator.
// Then we execute the logic. The reducer should always return
// current payload or a new payload to the chain
const chainReducer = (payload, operator) => {
  switch (operator.type) {
    case 'log': 
      console.log(payload)
      break;
  }
  return payload
}

const chain = ProxyChain(chainReducer)
```

This is not very exciting, but it shows you the basic construct. A second part to this construct is asynchronicity. You can return a promise in the reducer.

```js
const logPayloadAfterOneSecond = chain()
  .delay(1000)
  .log() // "foo"

logPayloadAfterOneSecond('foo')
```

```js
import { ProxyChain } from 'emmis'

const chainReducer = (payload, operator) => {
  switch (operator.type) {
    case 'log': 
      console.log(payload)
      break;
    case 'delay':
      return new Promise(resolve => 
        setTimeout(() => resolve(payload), operator.args[0])
      )
  }
  return payload
}

const chain = ProxyChain(chainReducer)
```

With the **delay** we return a promise that resolves using a *setTimeout*. The timeout value is grabbed from the first argument passed to the delay operator.

This is all there is to it. Move on to example operators that you can build in your application or come up with your own. Whatever makes sense for the application and libraries you use.