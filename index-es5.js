'use strict';

var react = require('react');
var reactDom = require('react-dom');

var uniqueSymbolId = Math.round(Math.random() * 1000000);
var Symbol = window.Symbol || (function (key) { return ("__SYMBOL" + uniqueSymbolId + "__" + key); });

var shouldEnter = Symbol('shouldEnter');
var originalRender = Symbol('originalRender');
var rootNode = Symbol('rootNode');

var AjaxComponent = (function (Component$$1) {
    function AjaxComponent(props) {
        Component$$1.call(this, props);
        this.state = { data: null };
        this[originalRender] = this.render;
        this.componentWillReceiveProps(props, { initial: true });
    }

    if ( Component$$1 ) AjaxComponent.__proto__ = Component$$1;
    AjaxComponent.prototype = Object.create( Component$$1 && Component$$1.prototype );
    AjaxComponent.prototype.constructor = AjaxComponent;

    var prototypeAccessors = { rootNode: { configurable: true } };

    AjaxComponent.prototype.componentWillReceiveProps = function componentWillReceiveProps (newProps, ref) {
        var this$1 = this;
        var initial = ref.initial; if ( initial === void 0 ) initial = false;

        if (!initial && !this.shouldFetchData(newProps)) {
            return;
        }

        this.render = this.renderLoader;

        if (this.state.data) {
            this.componentWillUnmount();
            this.setState({ data: null });
        }

        this.resolveData(newProps)
            .then(function (data) {
                this$1[shouldEnter] = true;
                this$1.render = this$1[originalRender];
                this$1.setState({ data: data });
            })
            .catch(function (errors) {
                this$1[shouldEnter] = true;
                this$1.render = this$1.renderError;
                this$1.setState({ errors: errors });
            });
    };

    AjaxComponent.prototype.componentDidUpdate = function componentDidUpdate () {
        var this$1 = this;

        if (this[shouldEnter]) {
            this[shouldEnter] = false;
            var rootNode = this.rootNode;
            rootNode.classList.add(((this.props.classNamePrefix) + "-enter"));
            this.onDataUpdate();
            requestAnimationFrame(function () {
                rootNode.scrollTop;
                rootNode.classList.add(((this$1.props.classNamePrefix) + "-enter-active"));
            });
            setTimeout(function () {
                rootNode.classList.remove(((this$1.props.classNamePrefix) + "-enter"));
                rootNode.classList.remove(((this$1.props.classNamePrefix) + "-enter-active"));
            }, this.props.timeout);
        }
    };

    AjaxComponent.prototype.componentWillUnmount = function componentWillUnmount () {
        var prefix = this.props.classNamePrefix;
        var rootNode = this.rootNode;
        var parentNode = rootNode.parentNode;
        var cloneNode = rootNode.cloneNode(true);
        cloneNode.classList.add((prefix + "-exit"));
        parentNode.insertBefore(cloneNode, rootNode);
        requestAnimationFrame(function () {
            cloneNode.scrollTop;
            cloneNode.classList.add((prefix + "-exit-active"));
        });
        setTimeout(function () {
            if (parentNode && parentNode.parentNode && parentNode.contains(cloneNode)) {
                parentNode.removeChild(cloneNode);
            }
        }, this.props.timeout);
    };

    AjaxComponent.prototype.shouldFetchData = function shouldFetchData () {
        return false;
    };

    AjaxComponent.prototype.resolveData = function resolveData (props) {
        return fetch(this.apiEndpoint(props), {
            method: AjaxComponent.config.apiMethod,
            headers: AjaxComponent.config.apiHeaders,
            body: JSON.stringify(this.apiPayload(props)),
        })
            .then(function (res) { return (
                new Promise(function (resolve, reject) {
                    if (res.status < 400) {
                        resolve(res.json());
                    } else {
                        reject({ errors: true });
                    }
                })
            ); })
            .then(function (json) { return json.data; });
    };

    AjaxComponent.prototype.apiEndpoint = function apiEndpoint () {
        return '/api'
    };

    AjaxComponent.prototype.apiPayload = function apiPayload () {
        return {};
    };

    AjaxComponent.prototype.onDataUpdate = function onDataUpdate () {
    };

    prototypeAccessors.rootNode.get = function () {
        return this[rootNode] || reactDom.findDOMNode(this);
    };

    prototypeAccessors.rootNode.set = function (node) {
        this[rootNode] = node;
    };

    AjaxComponent.prototype.renderError = function renderError () {
        return react.createElement('div', { className: 'error' }, 'There was a problem loading this section.');
    };

    AjaxComponent.prototype.renderLoader = function renderLoader () {
        return null;
    };

    Object.defineProperties( AjaxComponent.prototype, prototypeAccessors );

    return AjaxComponent;
}(react.Component));

AjaxComponent.config = {
    apiMethod: 'POST',
    apiHeaders: {
        'Content-Type': 'application/json',
    },
};

AjaxComponent.defaultProps = {
    timeout: 1000,
    classNamePrefix: 'is',
};

module.exports = AjaxComponent;
