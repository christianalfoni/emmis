export interface IProxyChain<O = {}, I = {}> {
	(payload?: I): Promise<O>;
}

export interface IOperator<Operators> {
	type: keyof Operators;
	args: any[];
}

export function ProxyChain<Operators extends IProxyChain>(
	reducer?: (payload: any, operator: IOperator<Operators>) => any
) {
	return function createProxy<P extends IProxyChain>(): P {
		const tasks = [];
		const handler = (payload?) => {
			const nextPayload = tasks.reduce((currentPayload, task) => {
				if (currentPayload instanceof Promise) {
					return currentPayload.then(
						(promisedPayload) => (reducer ? reducer(promisedPayload, task) : promisedPayload)
					);
				}

				return reducer ? reducer(currentPayload, task) : currentPayload;
			}, payload);

			return nextPayload instanceof Promise ? nextPayload : Promise.resolve(nextPayload);
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
