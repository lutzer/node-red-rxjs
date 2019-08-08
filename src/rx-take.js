const { take, tap } = require('rxjs/operators');
const { NodeRedObservable } = require('./common.js');

module.exports = function (RED) {
	function RxNode (config) {
		RED.nodes.createNode(this, config);

        var node = this;
        var globalContext = node.context().global;

        function showState(state) {
            switch (state) {
                case "no-pipe":
                    node.status({ fill: "red", shape: "ring", text: "missing pipe"});
                    break;
                case "piped":
                    node.status({ fill: "green", shape: "dot", text: "piped"});
                    break;
            }
        }

        showState("no-pipe");

        var observableWrapper = new NodeRedObservable(node);

        node.on('input', function (msg) {
			if (msg.topic === 'pipe') {
                var $observable = globalContext.get(msg.payload.observable)
                observableWrapper.register(
                    $observable.pipe(
                        take(config.count),
                        tap( (msg) => node.send([null, msg]))
                    )
                )
                showState("piped");
                node.send([observableWrapper.pipeMessage, null]);
            }
        });

		node.on('close', function () {
			observableWrapper.remove();
		});
	}
	RED.nodes.registerType("rx take", RxNode);
};
