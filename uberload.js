var assign = require('object-assign');

module.exports = function uberload(options){
  var {
    React, rootComponent, fnName, params
  } = options;

  React = options.React;

  var invokedFnSet = new WeakSet();

  return new Promise((resolveUberload) => {
    rootComponent.type[fnName].call(rootComponent.type, params).then(loadLoop);

    function loadLoop() {

      var collected = collectFns();

      if(collected.length === 0) {
        resolveUberload();
        return;
      }

      // Add all collected functions to invokedFnSet
      collected.forEach((item) => {invokedFnSet.add(item.fn)});

      // Invokes all collected fn and then
      //
      Promise.all(collected.map((item) => {

        var paramForLoad = assign({props: item.props}, params)

        return item.fn.call(item.context, paramForLoad)
      })).then(loadLoop);

    }
  });

  // Renders the component and collect all fns that is not in invokedFnSet
  // into an array.
  //
  function collectFns(){

    var originalCreateElement = React.createElement,
        collectedFns = []; // The collected static functions

    React.createElement = function (type, props, ...children) {
      // the element under creation is a React Component
      // that has static method <fnName> implemented.
      //
      if (typeof type === 'function' &&
          typeof type[fnName] === 'function' &&
          !invokedFnSet.has(type[fnName])){

        collectedFns.push({
          fn: type[fnName],
          context: type,
          props
        });

        // console.log('collectedFns added for', type);
      }

      // console.log('[createlement]', typeof type, typeof type[fnName]);

      return originalCreateElement.apply(React, arguments);
    };

    // Invoke React.render, which invokes React.createElement
    // based on current store data.
    React.renderToStaticMarkup(rootComponent);

    // Restore createElement
    React.createElement = originalCreateElement;

    return collectedFns;
  }
}
