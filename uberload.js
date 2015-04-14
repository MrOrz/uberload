var assign = require('object-assign'),
    debug = require('debug')('uberload');

module.exports = function uberload(options) {
  var {
    React,        // uberload does not depend on React currently.
    rootElement,  // Starting element of data-fetching method scanning.
    fnName,       // Name of the data-fetching method.
    params        // Array of parameters to pass to each data-fetching method.
                  // Ex: isomorphic app contexts, etc.
  } = options;

  React = options.React;

  var invokedFnSet = new WeakSet();

  return new Promise((resolveUberload) => {
    var fn;
    if (getFn(rootElement)) {
      // Invoke rootElement, which is already created by React.createElement.
      //
      invokeFn(rootElement).then(loadLoop);
    } else {
      loadLoop();
    }

    function loadLoop() {

      var collected = collectFns();
      debug(`${collected.length} functions collected`);

      if (collected.length === 0) {
        resolveUberload();
        return;
      }

      // Add all collected functions to invokedFnSet
      collected.forEach((item) => {invokedFnSet.add(item.fn)});

      // Invokes all collected data-fetching functions.
      // After all data-fetching is done, continue with this loop.
      //
      Promise.all(collected.map((item) => invokeFn(item.elem))).then(loadLoop);
    }
  });

  // Renders the component and collect all fns that is not in invokedFnSet
  // into an array.
  //
  function collectFns() {

    var originalCreateElement = React.createElement,
        collectedFns = []; // The collected data-fetching functions

    React.createElement = function createdElemWrapper() {

      var reactElement = originalCreateElement.apply(React, arguments),
          fn;

      if ((fn = getFn(reactElement)) && !invokedFnSet.has(fn)) {
        collectedFns.push({
          fn: fn,
          elem: reactElement
        });
      }

      return reactElement;
    };

    // Invoke React.render, which invokes React.createElement
    // based on current store data.
    React.renderToStaticMarkup(rootElement);

    // Restore createElement
    React.createElement = originalCreateElement;

    return collectedFns;
  }

  // Get the data-fetching function for the element.
  // Returns false if the data-fetching function is not found.
  //
  function getFn(elem) {
    return (typeof elem.type) === 'function' &&
           elem.type.prototype[fnName];
  }

  // Invoke the data-fetching function for the element.
  //
  function invokeFn(elem) {
    // Create a ReactComponent instance to get access to the instance methods.
    //
    // These instances may differ between the one in React.render() though,
    // because these instances are not managed by React.
    //
    var instance = new elem.type(elem.props),
        fn = getFn(elem);
    return fn.apply(instance, params);
  }
}
