(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const connect = require("@vkontakte/vkui-connect");

connect.send("VKWebAppInit", {});

},{"@vkontakte/vkui-connect":2}],2:[function(require,module,exports){
(function(window) {
  var FUNCTION = 'function';
  var UNDEFINED = 'undefined';
  var subscribers = [];
  var isWeb = typeof window !== UNDEFINED && !window.AndroidBridge && !window.webkit;
  var eventType = isWeb ? 'message' : 'VKWebAppEvent';

  if (typeof window !== UNDEFINED) {

    //polyfill
    if (!window.CustomEvent) {
      (function() {
        function CustomEvent(event, params) {
          params = params || {bubbles: false, cancelable: false, detail: undefined};
          var evt = document.createEvent('CustomEvent');
          evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
          return evt;
        };

        CustomEvent.prototype = window.Event.prototype;

        window.CustomEvent = CustomEvent;
      })();
    }

    window.addEventListener(eventType, function() {
      var args = Array.prototype.slice.call(arguments);
      if (isWeb) {
        subscribers.forEach(function(fn) {
          fn({
            detail: args[0].data
          });
        });
      } else {
        subscribers.forEach(function(fn) {
          fn.apply(null, args);
        });
      }
    });
  }

  module.exports = {
    /**
     * Sends a message to native client
     *
     * @example
     * message.send('VKWebAppInit');
     *
     * @param {String} handler Message type
     * @param {Object} params Message data
     * @returns {void}
     */
    send: function send(handler, params) {
      if (!params) {
        params = {};
      }

      var isClient = typeof window !== UNDEFINED;
      var androidBridge = isClient && window.AndroidBridge;
      var iosBridge = isClient && window.webkit && window.webkit.messageHandlers;
      var isDesktop = !androidBridge && !iosBridge;

      if (androidBridge && typeof androidBridge[handler] == FUNCTION) {
        androidBridge[handler](JSON.stringify(params));
      }
      if (iosBridge && iosBridge[handler] && typeof iosBridge[handler].postMessage == FUNCTION) {
        iosBridge[handler].postMessage(params);
      }

      if (isDesktop) {
        parent.postMessage({
          handler: handler,
          params: params,
          type: 'vk-connect'
        }, '*');
      }
    },
    /**
     * Subscribe on VKWebAppEvent
     *
     * @param {Function} fn Event handler
     * @returns {void}
     */
    subscribe: function subscribe(fn) {
      subscribers.push(fn);
    },
    /**
     * Unsubscribe on VKWebAppEvent
     *
     * @param {Function} fn Event handler
     * @returns {void}
     */
    unsubscribe: function unsubscribe(fn) {
      var index = subscribers.indexOf(fn);

      if (index > -1) {
        subscribers.splice(index, 1);
      }
    },

    /**
     * Checks if native client supports nandler
     *
     * @param {String} handler Handler name
     * @returns {boolean}
     */
    supports: function supports(handler) {

      var isClient = typeof window !== UNDEFINED;
      var androidBridge = isClient && window.AndroidBridge;
      var iosBridge = isClient && window.webkit && window.webkit.messageHandlers;
      var desktopEvents = [
        "VKWebAppGetAuthToken",
        "VKWebAppCallAPIMethod",
        "VKWebAppGetGeodata",
        "VKWebAppGetUserInfo",
        "VKWebAppGetPhoneNumber",
        "VKWebAppGetClientVersion",
        "VKWebAppOpenPayForm",
        "VKWebAppShare",
        "VKWebAppAllowNotifications",
        "VKWebAppDenyNotifications",
        "VKWebAppShowWallPostBox",
        "VKWebAppGetEmail",
        "VKWebAppAllowMessagesFromGroup",
        "VKWebAppJoinGroup",
        "VKWebAppOpenApp",
        "VKWebAppSetLocation",
        "VKWebAppScroll",
        "VKWebAppResizeWindow",
      ];

      if (androidBridge && typeof androidBridge[handler] == FUNCTION) return true;

      if (iosBridge && iosBridge[handler] && typeof iosBridge[handler].postMessage == FUNCTION) return true;

      if (!iosBridge && !androidBridge && ~desktopEvents.indexOf(handler)) return true;

      return false;
    }
  };
})(window);

},{}]},{},[1]);
