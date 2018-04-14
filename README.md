# proxychain
Create a chaining API for your application

Writing readable code requires a lot of discipline or helpful tools. This is such a helpful tool. With a chaining API you are forced into a declarative pattern for your application logic and that will improve the readability of your code. **Proxychain** is a tiny library, less than 50 lines of Typescript code. It allows you to express and run logic in your application that has not even been defined yet.

## API

```js
import { ProxyChain } from 'proxychain'

const chain = ProxyChain()

const appLoaded = chain()
  .state(state => state.isLoading = true)
  .http('get', '/user', {
    success: chain().state((state, user) => state.user = user),
    error: chain().state((state, error) => state.error = error)
  })
  .state(state => state.isLoading = false)
```

You can call **appLoaded** if you want to, though nothing will really happen. We have to define a reducer function for our chains and implement how these chain operators should be managed.

```js
import { ProxyChain } from 'proxychain'
import myStateStore from './myStateStore'

const chain = ProxyChain((payload, operator) => {
  return payload
})
```

The chain reducer is responsible for firing side effects and updating the payload of the chain. By default it should always return the current payload. Let us now add our first operator:

```js
import { ProxyChain } from 'proxychain'
import myStateStore from './myStateStore'

const chain = ProxyChain((payload, operator) => {
  switch(operator.type) {
    case 'state':
      const stateCallback = operator.args[0]
      stateCallback(myStateStore, payload)
  }
  return payload
})
```

Whenever a state operator runs we will grab the callback and call it with our state store and the current payload of the chain. That is it... now any usage of **state** in your chains will allow you to do a state change.

Lets us add our http operator.

```js
import { ProxyChain } from 'proxychain'
import myStateStore from './myStateStore'
import axios from 'axios'

const chain = ProxyChain((payload, operator) => {
  switch(operator.type) {
    case 'state': ...
    case 'http':
      const method = operator.args[0]
      const url = operator.args[1]
      const paths = operator.args[2]

      return axios[method](url).then((response) => paths.success(response)).catch((error) => paths.error(error))

  }
  return payload
})
```

As you can see, we are calling **success** or **error** depending on the success of the request. These are also chains that will be merged into the existing execution. That means that last operator will not run until http is done.

We can now improve the declarativeness of our code even more:

```js
import { ProxyChain } from 'proxychain'

const chain = ProxyChain()

const setLoading = isLoading => state => state.isLoading = isLoading
const setUser = user => state => state.user = user
const setError = error => state => state.error = error

const success = chain().state(setUser)
const error = chain().state(setError)

const appLoaded = chain()
  .state(setLoading(true))
  .http('get', '/user', { success, error })
  .state(setLoading(false))
```

As you can see, chaining allows us to split up our code a lot more. Focus on what is actually happening when we express logic and then create reusable parts of our code. Proxychain takes this even further as you can just write out thea chain you want and then implement it as a second step.