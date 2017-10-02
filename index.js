import { createElement, Component } from 'react';
import { findDOMNode } from 'react-dom';

const uniqueSymbolId = Math.round(Math.random() * 1000000);
const Symbol = window.Symbol || (key => `__SYMBOL${uniqueSymbolId}__${key}`);

const shouldEnter = Symbol('shouldEnter');
const originalRender = Symbol('originalRender');
const rootNode = Symbol('rootNode');

export default class AjaxComponent extends Component {
    constructor(props) {
        super(props);
        this.state = { data: null };
        this[originalRender] = this.render;
        this.componentWillReceiveProps(props, { initial: true });
    }

    componentWillReceiveProps(newProps, { initial = false }) {
        if (!initial && !this.shouldFetchData(newProps)) {
            return;
        }

        this.render = this.renderLoader;

        if (this.state.data) {
            this.componentWillUnmount();
            this.setState({ data: null });
        }

        this.resolveData(newProps)
            .then(data => {
                this[shouldEnter] = true;
                this.render = this[originalRender];
                this.setState({ data });
            })
            .catch(errors => {
                this[shouldEnter] = true;
                this.render = this.renderError;
                this.setState({ errors });
            });
    }

    componentDidUpdate() {
        if (this[shouldEnter]) {
            this[shouldEnter] = false;
            const rootNode = this.rootNode;
            rootNode.classList.add(`${this.props.classNamePrefix}-enter`);
            this.onDataUpdate();
            requestAnimationFrame(() => {
                rootNode.scrollTop;
                rootNode.classList.add(`${this.props.classNamePrefix}-enter-active`);
            });
            setTimeout(() => {
                rootNode.classList.remove(`${this.props.classNamePrefix}-enter`);
                rootNode.classList.remove(`${this.props.classNamePrefix}-enter-active`);
            }, this.props.timeout);
        }
    }

    componentWillUnmount() {
        const prefix = this.props.classNamePrefix;
        const rootNode = this.rootNode;
        const parentNode = rootNode.parentNode;
        const cloneNode = rootNode.cloneNode(true);
        cloneNode.classList.add(`${prefix}-exit`);
        parentNode.insertBefore(cloneNode, rootNode);
        requestAnimationFrame(() => {
            cloneNode.scrollTop;
            cloneNode.classList.add(`${prefix}-exit-active`);
        });
        setTimeout(() => {
            if (parentNode && parentNode.parentNode && parentNode.contains(cloneNode)) {
                parentNode.removeChild(cloneNode);
            }
        }, this.props.timeout);
    }

    shouldFetchData() {
        return false;
    }

    resolveData(props) {
        return fetch(this.apiEndpoint(props), {
            method: AjaxComponent.config.apiMethod,
            headers: AjaxComponent.config.apiHeaders,
            body: JSON.stringify(this.apiPayload(props)),
        })
            .then(res => (
                new Promise((resolve, reject) => {
                    if (res.status < 400) {
                        resolve(res.json());
                    } else {
                        reject({ errors: true });
                    }
                })
            ))
            .then(json => json.data);
    }

    apiEndpoint() {
        return '/api'
    }

    apiPayload() {
        return {};
    }

    onDataUpdate() {
    }

    get rootNode() {
        return this[rootNode] || findDOMNode(this);
    }

    set rootNode(node) {
        this[rootNode] = node;
    }

    renderError() {
        return createElement('div', { className: 'error' }, 'There was a problem loading this section.');
    }

    renderLoader() {
        return null;
    }
}

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
