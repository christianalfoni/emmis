export interface IProxyChain<O = {}, I = {}> {
	(payload?: I): Promise<O>;
}

export interface IOperator<Operators> {
	type: keyof Operators;
	context: any;
	args: any[];
	debug(details: {}): void
}

export function ProxyChain<Operators extends IProxyChain>(
	reducer?: (payload: any, operator: IOperator<Operators>) => any
) {
	return function createProxy<P extends IProxyChain>(name?: string): P {
		const tasks = [];
		const handler = function (payload?) {
			const debugInfo = []
			const nextPayload = tasks.reduce((currentPayload, task, index) => {
				const populatedTask = {
					...task, context: this, debug(details) {
						debugInfo[index].details = details
					}
				}
				debugInfo.push({
					type: populatedTask.type,
					details: null
				})
				if (currentPayload instanceof Promise) {
					return currentPayload.then(
						(promisedPayload) => (reducer ? reducer(promisedPayload, populatedTask) : promisedPayload)
					);
				}

				return reducer ? reducer(currentPayload, populatedTask) : currentPayload;
			}, payload);

			return nextPayload instanceof Promise ? nextPayload : Promise.resolve(nextPayload)
				.then((returnValue) => {
					if (!name) {
						return returnValue
					}
					console.groupCollapsed('### ' + name + ' ###')
					debugInfo.forEach(info => {
						console.log(info.type, info.details)
					})
					console.groupEnd()
					return returnValue
				})
		};
		const proxy = new Proxy(handler, {
			get(_, property) {
				return (...args) => {
					tasks.push({
						type: property,
						args
					});
					return proxy;
				};
			}
		});

		return proxy as P;
	};
}
