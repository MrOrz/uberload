var React = require('react'),

    contentStore = [],
    itemStore = {},

    App, Content;

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
      <div>
        {contents}
      </div>
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

exports.App = App;
