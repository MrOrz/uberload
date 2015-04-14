var React = require('react'),
    debug = require('debug')('uberload:exampleApp'),

    contentStore = [],
    itemStore = {},

    App, Content;

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

exports.App = App;
