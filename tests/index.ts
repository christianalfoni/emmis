import { ProxyChain, IProxyChain } from '../src/index';
import { expect } from 'chai';
import 'mocha';

describe('ProxyChain', () => {
	it('should run', () => {
		expect(() => ProxyChain(() => { })).to.not.throw();
	});
	it('should return promise when run', () => {
		const chain = ProxyChain(() => { });
		const doThis = chain();
		expect(doThis()).to.be.instanceof(Promise);
	});
	it('should proxy any method', () => {
		interface AppChain extends IProxyChain {
			set: () => AppChain;
			foo: () => AppChain;
			bar: () => AppChain;
		}
		const chain = ProxyChain<AppChain>(() => { });

		expect(() => chain<AppChain>().set()).to.not.throw();
		expect(() => chain<AppChain>().foo()).to.not.throw();
		expect(() => chain<AppChain>().bar()).to.not.throw();
	});
	it('should return passed payload', () => {
		interface AppChain<P = {}> extends IProxyChain<P> {
			set: () => AppChain;
		}
		const chain = ProxyChain<AppChain>();
		const doThis = chain<AppChain<string>>().set();

		return doThis('foo').then((value) => expect(value).to.be.equal('foo'));
	});
	it('should allow overriding payload', () => {
		interface ProxyChain<O, I = O> extends IProxyChain<O, I> {
			map: <P>(cb: (p: O) => P) => ProxyChain<I, P>;
		}
		const chain = ProxyChain<ProxyChain<any, any>>((payload, operator) => {
			switch (operator.type) {
				case 'map':
					return operator.args[0](payload);
			}

			return payload;
		});
		const doThis = chain<ProxyChain<string>>().map((p) => p.toUpperCase());

		return doThis('foo').then((value) => expect(value).to.be.equal('FOO'));
	});
	it('should handle promise results', () => {
		interface ProxyChain<Current, Initial = Current> extends IProxyChain<Current, Initial> {
			map: <Output>(cb: (p: Current) => Output) => ProxyChain<Output, Initial>;
		}
		const chain = ProxyChain<ProxyChain<any, any>>((payload, operator) => {
			switch (operator.type) {
				case 'map':
					return Promise.resolve(operator.args[0](payload));
			}

			return payload;
		});
		const doThis = chain<ProxyChain<string>>().map((p) => p.toUpperCase()).map((p) => p.split(''));

		return doThis('foo').then((value) => expect(value).to.be.deep.equal(['F', 'O', 'O']));
	});
	it('should handle using new chain as callback', () => {
		interface ProxyChain<Current, Initial = Current> extends IProxyChain<Current, Initial> {
			when: <K extends { true: ProxyChain<Current>; false: ProxyChain<Current> }, P extends keyof K>(
				path: () => P,
				paths: K
			) => K[P];
			map: <P>(cb: (p: Current) => P) => ProxyChain<P, Initial>;
		}
		const chain = ProxyChain<ProxyChain<any, any>>((payload, operator) => {
			switch (operator.type) {
				case 'when':
					return operator.args[1][operator.args[0](payload)](payload);
				case 'map':
					return operator.args[0](payload);
			}

			return payload;
		});
		const doThis = chain<ProxyChain<string>>()
			.when(() => 'true', {
				true: chain<ProxyChain<string>>().map(p => p.toUpperCase()),
				false: chain<ProxyChain<string>>()
			})
			.map((p) => p.split(''));

		return doThis('foo').then((value) => expect(value).to.be.deep.equal(['F', 'O', 'O']));
	});
	it('should receive context of chain', () => {
		interface AppChain extends IProxyChain {
			set: () => AppChain;
		}
		const chain = ProxyChain<AppChain>((payload, operator) => {
			expect(operator.context).to.be.equal('foo')
		});

		const doThis = chain<AppChain>().set()

		doThis.call('foo')
	});
});
