uberload
========

1. For each React component, define a data-fetching method that returns a promise, which is resolved when the component's data is loaded.

2. Invoke `uberload` with the root component and name of that data-fetching method.

3. `uberload` tries to render and invoke the date-fetching method of all rendered components until all data-fetching methods are invoked.


Example
-------

### app.jsx

```js
App = React.createClass({
  displayName: 'App',

  load() {
    // Assume we fetch and populates contentStore with data from server...
    //
    return new Promise((resolve) => {
      contentStore.push('1', '2', '3');
      debug('Loading app');
      resolve();
    });
  },

  render() {
    var contents = contentStore.map((contentId) =>
      <Content id={contentId} key={contentId}/>
    )

    return (
      <main>
        {contents}
      </main>
    )
  }
});

Content = React.createClass({
  displayName: 'Content',

  load() {
    // Assume we fetch and populates itemStore with data from server...
    //
    return new Promise((resolve) => {
      itemStore[this.props.id] = {
        name: `Content id=${this.props.id}`
      };
      debug('Loading content', this.props);
      resolve();
    });
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
var app = React.createElement(App);

uberload({
  React,
  rootElement: app,
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


Where do the ideas come from
----------------------------

* Overriding `React.createElement`: [react-router](https://github.com/rackt/react-router/)
* Instantiating `ReactComponent` by ourself: [react-vdom](https://github.com/gcanti/react-vdom/) [(Not recommended by Facebook, though)](https://facebook.github.io/react/docs/glossary.html#react-components)

