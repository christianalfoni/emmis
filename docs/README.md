---
home: true
actionText: Get Started →
actionLink: /guide/
footer: MIT Licensed | Copyright © 2018-present Christian Alfoni
---

[[TOC]]

### Example: Redux

``` js
const loadApplication = chain()
  .dispatch(APP_LOADING)
  .http('get', '/user', {
    success: chain()
      .dispatch(APP_LOADED_SUCCESS),
    error: chain()
      .dispatch(APP_LOADED_ERROR)
  })
```

### Example: React

``` js
class MyComponent extends React.Component {
  componentDidMount = chain()
    .setState({ isLoading: true })
    .http('get', '/user', {
      success: chain()
        .setState(user => ({ user, isLoading: false })),
      error: chain()
        .setState(error => ({ error, isLoading: false })),
    })
}
```