---
home: true
actionText: Get Started →
actionLink: /guide/
features:
- title: Super tiny
  details: Only 40 lines of code gives you a ton of flexibility
- title: Flexible
  details: Convert any application logic into a chain
- title: Debuggable
  details: See flow of execution with all the details
footer: MIT Licensed | Copyright © 2018-present Christian Alfoni
---

# Why?

When we write application logic we import different dependencies into the files that expresses this logic. For example:

```js
import axios from 'axios'
import { withBaseUrl, encodeQuery, withDefaultHeaders } from './utils'
import { error } from './services'

export const getUser = (queryParams) => {
  const url = withBaseUrl('/user')
  const query = encodeQuery(queryParams)

  return axios.get(url, {
    headers: withDefaultHeaders()
  })
    .then((response) => {
      return response.data
    })
    .catch((responseError) => {
      error.track(responseError)
    })
}
```

With **Emmis** this type of code can be cleaned up like this:

```js
import chain from './chain'

export const getUser = chain()
  .http('get', '/user', {
    success: chain()
      .map(response => response.data),
    error: chain()
      .trackError()
  })
```

It allows you to move all side effect utilities and helpers you use in your code behind a chaining API. Chaining APIs encourages functional code and generally makes your code more declarative. In addition to this you can express complex asynchronous flows as well.