const _ = require('lodash');
const EventEmitter = require('events');
const { tap } = require('rxjs/operators');

class NodeRedObservable extends EventEmitter {
    constructor(node) {
        super();
        this.globalContext = node.context().global;
        this.observableName = "observable." + node.id;
    }

    register($observable, multipart = 0) {
        const $withTap = $observable.pipe( tap( (val) => {
            this.emit('tap', val);
        }));
        this.globalContext.set(this.observableName, $withTap);
        this.multipart = multipart;


    }

    get pipeMessage() {
        return {
            topic: "pipe",
            payload: {
                observable : this.observableName,
                multipart : this.multipart
            }
        }
    }

    remove() {
        this.removeAllListeners("tap");
        this.globalContext.set(this.observableName, undefined);
    }
}

module.exports = {
    unsubscribe : function(subscription) {
        if (subscription !== undefined) 
            subscription.unsubscribe();

        subscription = undefined;
    },

    evalFunc : function(obj) {
        return Function('"use strict";return (' + obj + ')')();
    },

    convertNodeRedType : function(val, type) {
        switch (type) {
            case 'json':
                try {
                    return JSON.parse(val);
                } catch (err) {
                    return val;
                }
            case 'num':
                return _.toNumber(val);
            case 'str':
                return _.toString(val);
            default:
                return val;
                
        }
    },

    NodeRedObservable : NodeRedObservable,
    ON_LOADED_TIMEOUT : 10
}