uberload
========

1. For each React component, set a static "loader" function that returns a promise, which is resolved when the component's data is loaded.

2. Invoke `uberload` with the root component and name of that loader function.

3. `uberload` tries to render and invoke the loader function of all rendered components until all loader functions are invoked.


Example
-------

### app.jsx

```js
App = React.createClass({
  displayName: 'App',

  statics: {
    load (param) {
      // Assume we fetch and populates contentStore with data from server...
      //
      return new Promise((resolve) => {
        contentStore.push('1','2','3');

        resolve();
      });
    }
  },

  render() {
    var contents = contentStore.map((contentId) => <Content id={contentId} key={contentId}/>)

    return (
      <main>
        {contents}
      </main>
    )
  }
});

Content = React.createClass({
  displayName: 'Content',

  statics: {
    load (param) {
      var props = param.props;
      // Assume we fetch and populates contentStore with data from server...
      //
      return new Promise((resolve) => {
        itemStore[props.id] = {
          name: `Content id=${props.id}`
        };

        resolve();
      });
    }
  },

  render() {
    var data = itemStore[this.props.id],
        content = data ? data.name : 'Loading...';

    return (
      <div>
        {content}
      </div>
    )
  }
});
```

### index.js

```js
var React = require('react'),
    App = require('./app.jsx').App,
    uberload = require('./uberload');

// Catch all unhandled promise rejections and print error.
// Ref: https://iojs.org/api/process.html#process_event_unhandledrejection
//
process.on('unhandledRejection', function(reason, promise) {
  if (reason.stack) {
    // Error object, has stack info
    console.error('[Unhandled Rejection]', reason.stack);
  } else {
    console.error('[Unhandled Rejection] Reason:', reason);
  }
  console.error('[Unhandled Rejection] Promise:', promise);
});


var app = React.createElement(App);

uberload({
  React,
  rootComponent: app,
  fnName: 'load'
}).then(() => {
  console.log('App uberloaded:', React.renderToStaticMarkup(app));
});
```

### Execution result of index.js

```bash
$ babel-node index.js
=> App uberloaded: <main><div>Content id=1</div><div>Content id=2</div><div>Content id=3</div></main>
```
