import { StoreEventType, StoreEvent, Store } from '../src/store';
import * as expect from 'expect';
import expectJsx from 'expect-jsx';

const initialState: StoreState = Object.freeze({
	nullObj: null,
	counter: 0,
	foo: 'foo',
	numericArray: [1, 2, 3],
	objectsArray: [{
		a: 1,
		b: 2,
		c: 3
	},
	{
		a: 3,
		b: 2,
		c: {
			a: 1,
			b: [1, 2, 3]
		},
		d: [
			{ id: 1, name: 'test 1', enabled: true },
			{ id: 2, name: 'test 2', enabled: false }
		]
	}],
	settings: {
		foo: {
			bar: 1
		},
		baz: 2
	}
});

const store: Store<StoreState> = new Store<StoreState>(initialState, {
	live: true,
});

class Actions {
	public static increaseCounter(): void {
		store.setState({
			counter: store.state.counter + 1,
		});
	}

	public static toggleFooBar(): void {
		let newState: Partial<StoreState> = {
			foo: (store.state.foo === 'foo') ? 'bar' : 'foo'
		};

		store.setState(newState);
	}

	public static reset(): void {
		store.resetState();
	}

	public static setSettings(bar: number, baz: number): void {
		store.setState({
			settings: {
				foo: {
					bar: bar
				},
				baz: baz
			}
		});
	}

	public static setNull(obj: null) {
		store.setState({
			nullObj: obj
		});
	}
}

interface StoreState {
	nullObj: null
	counter: number
	foo: string
	numericArray: number[],
	objectsArray: Object[],
	settings: {
		foo: {
			bar: number
		},
		baz: number
	}
}

expect.extend(expectJsx);

describe('testStoreState', () => {
	it('check store id', (done) => {
		store.resetState();

		for (let i = 0; i < 4; i++) {
			Actions.increaseCounter();
		}

		expect(store.id).toEqual('-1a3306b2');
		done();
	});

	it('counter should be 4', (done) => {
		store.resetState();

		for (let i = 0; i < 4; i++) {
			Actions.increaseCounter();
		}

		expect(store.state.counter).toEqual(4);
		done();
	});

	it('foo should be bar', (done) => {
		store.resetState();
		Actions.toggleFooBar();

		expect(store.state.foo).toEqual('bar');
		done();
	});

	it('foo should be resetted to foo', (done) => {
		store.resetState();
		Actions.toggleFooBar();
		store.resetState();

		expect(store.state.foo).toEqual('foo');
		done();
	});

	it('counter should be resetted to 0', (done) => {
		store.resetState();

		for (let i = 0; i < 4; i++) {
			Actions.increaseCounter();
		}

		store.resetState();

		expect(store.state.counter).toEqual(0);
		done();
	});

	it('bar should be setted to 100', (done) => {
		store.resetState();
		Actions.setSettings(100, 200);

		expect(store.state.settings.foo.bar).toEqual(100);
		done();
	});

	it('baz should be setted to 200', (done) => {
		store.resetState();
		Actions.setSettings(100, 200);

		expect(store.state.settings.baz).toEqual(200);
		done();
	});

	it('bar should be resetted to 1', (done) => {
		store.resetState();
		Actions.setSettings(100, 200);
		store.resetState();

		expect(store.state.settings.foo.bar).toEqual(1);
		done();
	});

	it('nullObj should be null', (done) => {

		store.setState({
			nullObj: undefined,
		});

		store.resetState();
		Actions.setNull(null);

		expect(store.state.nullObj).toEqual(null);
		done();
	});

	it('store init test', (done) => {
		store.resetState();

		const result: string = JSON.stringify(store.state);
		const etalon: string = JSON.stringify(initialState);

		expect(result).toEqual(etalon);
		done();
	});

	it('update numeric collection', (done) => {
		store.resetState();

		const newNumericArray = [3, 2];

		store.setState({
			numericArray: newNumericArray
		});

		const result: string = JSON.stringify(store.state.numericArray);
		const etalon: string = JSON.stringify(newNumericArray);

		expect(result).toEqual(etalon);
		done();
	});

	it('update objects collection', (done) => {
		store.resetState();

		const newObjectsArray: Object[] = [{
			x: 1,
			y: 2,
			z: 3
		},
		{
			x: 3,
			y: 2,
			z: {
				a: 1,
				b: [true, false, null]
			}
		}];

		store.setState({
			objectsArray: newObjectsArray
		});

		const result: string = JSON.stringify(store.state.objectsArray);
		const etalon: string = JSON.stringify(newObjectsArray);

		expect(result).toEqual(etalon);
		done();
	});

	it('mutable test', (done) => {
		store.resetState();

		let objectsArrayFromStore: Object[] = store.state.objectsArray;

		objectsArrayFromStore = [{
			id: 0,
			foo: 1,
			bar: {
				baz: 123
			}
		}, [], [], [], {
			id: 1
		}];

		const result: string = JSON.stringify(store.state.objectsArray);
		const etalon: string = JSON.stringify(store.getInitialState().objectsArray);

		expect(result).toEqual(etalon);
		done();
	});

	it('deep array object', (done) => {
		store.resetState();

		const objectsArray: Object[] = store.state.objectsArray.concat();

		objectsArray[1] = [];

		store.setState({
			objectsArray: objectsArray
		});

		const result: string = JSON.stringify([]);
		const etalon: string = JSON.stringify(store.state.objectsArray[1]);

		expect(result).toEqual(etalon);
		done();
	});

	it('event driven', (done) => {
		store.resetState();

		let counter: string = null;

		const event: StoreEvent<StoreState> = store.on('update', (storeState: StoreState, prevState: StoreState, type: StoreEventType) => {
			counter = storeState.counter.toString();
		});

		for (let i = 0; i < 4; i++) {
			Actions.increaseCounter();
		}

		event.remove();

		expect(counter).toEqual('4');

		done();
	});

	it('store state replace', (done) => {
		store.resetState();

		for (let i = 0; i < 4; i++) {
			Actions.increaseCounter();
		}

		Actions.setSettings(100, 200);
		Actions.toggleFooBar();

		const result: string = JSON.stringify(store.state);
		const etalon: string = JSON.stringify({
			nullObj: null,
			counter: 4,
			foo: 'bar',
			numericArray: [1, 2, 3],
			objectsArray: [{
				a: 1,
				b: 2,
				c: 3
			},
			{
				a: 3,
				b: 2,
				c: {
					a: 1,
					b: [1, 2, 3]
				},
				d: [
					{ id: 1, name: 'test 1', enabled: true },
					{ id: 2, name: 'test 2', enabled: false }
				]
			}],
			settings: {
				foo: {
					bar: 100
				},
				baz: 200
			}
		});

		expect(result).toEqual(etalon);
		done();
	});

	it('store state reset', (done) => {
		store.setState({
			foo: 'asdasd',
			counter: 12123123,
		});

		store.resetState();

		const result: string = JSON.stringify(store.state);
		const etalon: string = JSON.stringify({
			nullObj: null,
			counter: 0,
			foo: 'foo',
			numericArray: [1, 2, 3],
			objectsArray: [{
				a: 1,
				b: 2,
				c: 3
			},
			{
				a: 3,
				b: 2,
				c: {
					a: 1,
					b: [1, 2, 3]
				},
				d: [
					{ id: 1, name: 'test 1', enabled: true },
					{ id: 2, name: 'test 2', enabled: false }
				]
			}],
			settings: {
				foo: {
					bar: 1
				},
				baz: 2
			}
		});

		expect(result).toEqual(etalon);
		done();
	});

	it('update trigger', (done) => {
		store.resetState();

		let updated: string = 'false';

		store.on('update', (storeState: StoreState) => {
			updated = 'true';
		});

		store.setState({
			counter: 0
		});

		expect(updated).toEqual('false');
		done();
	});

	it('previous state', (done) => {
		store.resetState();

		let prev = '0';

		const event: StoreEvent<StoreState> = store.on('update', (storeState: StoreState, prevState: StoreState, type: StoreEventType) => {
			prev = prevState.counter.toString();
		});

		store.setState({
			counter: 5,
		});

		expect(prev).toEqual('0');
		done();
	});

	it('update event trigger', (done) => {
		store.resetState();

		let eventType = null;

		const event: StoreEvent<StoreState> = store.on('update', (storeState: StoreState, prevState: StoreState, type: StoreEventType) => {
			eventType = type;
		});

		store.setState({
			counter: 100,
		});

		expect(eventType).toEqual('update');
		done();
	});

	it('init event trigger', (done) => {
		store.resetState();

		let eventType = null;

		const event: StoreEvent<StoreState> = store.on('init', (storeState: StoreState, prevState: StoreState, type: StoreEventType) => {
			eventType = type;
		});

		expect(eventType).toEqual('init');
		done();
	});

	it('all event trigger', (done) => {
		store.resetState();

		let eventCount = 0;

		const event: StoreEvent<StoreState> = store.on('all', (storeState: StoreState, prevState: StoreState, type: StoreEventType) => {
			eventCount++;
		});

		store.setState({
			counter: 100,
		});

		expect(eventCount).toEqual(3);
		done();
	});

	it('unnecessary updates', (done) => {
		store.resetState();

		let eventCount = 0;

		const event: StoreEvent<StoreState> = store.on('all', (storeState: StoreState, prevState: StoreState, type: StoreEventType) => {
			if(type !== 'dumpUpdate') {
				eventCount++;
			}
		});

		store.setState({
			counter: 0,
		});

		store.setState({
			counter: 0,
		});

		store.setState({
			counter: 0,
		});

		expect(eventCount).toEqual(1);
		done();
	});

	it('bulk update', (done) => {
		store.resetState();

		let eventCount = 0;

		const event: StoreEvent<StoreState> = store.on('update', (storeState: StoreState, prevState: StoreState, type: StoreEventType) => {
			eventCount++;
		});

		store.setState({
			nullObj: null,
			counter: 0,
			foo: 'foo',
		});

		store.setState({
			numericArray: [1, 2, 3],
		});

		expect(eventCount).toEqual(1);
		done();
	});

	it('deep objects mutation', (done) => {
		store.resetState();

		const newObjArr = store.state.objectsArray.concat();

		newObjArr[0] = {
			test: 1,
		};

		store.setState({
			objectsArray: newObjArr,
		});

		expect(JSON.stringify(store.state.objectsArray[0])).toEqual('{"test":1}');
		done();
	});

	it('deep objects direct assign throws', (done) => {
		store.resetState();

		const newObjArr = store.state.objectsArray;

		expect(() => {
			newObjArr[0] = {
				test: 1,
			};
		}).toThrow();

		done();
	});

	it('deep objects instance mutations', (done) => {
		store.resetState();

		const newObjArr1 = store.state.objectsArray.concat();
		const TheClass = function (a) {
			this.a = a;
			this.setA = function (a) {
				this.a = a;
			}
		};

		newObjArr1[0] = new TheClass(1);
		store.setState({
			objectsArray: newObjArr1,
		});
		expect(store.state.objectsArray[0]['a']).toEqual(1);

		const newObjArr2 = store.state.objectsArray.concat();
		newObjArr2[0]['a'] = 2;
		store.setState({
			objectsArray: newObjArr2,
		});
		expect(store.state.objectsArray[0]['a']).toEqual(2);

		const newObjArr3 = store.state.objectsArray.concat();
		newObjArr3[0]['setA'](3);
		store.setState({
			objectsArray: newObjArr3,
		});
		expect(store.state.objectsArray[0]['a']).toEqual(3);

		done();
	});
});
