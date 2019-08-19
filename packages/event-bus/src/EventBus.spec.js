const { assert } = require('chai');
const { EventBus } = require('./EventBus');

describe('EventBus', () => {
  let eventBusA;
  let eventBusB;

  afterEach(() => {
    if (eventBusA) {
      eventBusA.close();
      eventBusA = null;
    }

    if (eventBusB) {
      eventBusB.close();
      eventBusB = null;
    }
  });

  it('receives a message', async () => {
    eventBusA = new EventBus();
    eventBusB = new EventBus();

    await new Promise(async (resolve, reject) => {
      await eventBusA.subscribe('users.registered', (event) => {
        try {
          assert.deepInclude(event, {
            id: 1,
            name: 'Alex',
          });

          resolve();
        } catch (error) {
          reject(error);
        }
      });

      await eventBusB.publish('users.registered', {
        id: 1,
        name: 'Alex',
      });
    });
  });

  it('replies to a request', async () => {
    eventBusA = new EventBus();
    eventBusB = new EventBus();

    await eventBusA.subscribe(
      'calculator.sum',
      ({ a, b, reply }) => reply({
        sum: a + b,
      }),
    );

    await new Promise(async (resolve, reject) => {
      await eventBusB.request(
        'calculator.sum',
        { a: 12, b: 31 },
        ({ sum }) => {
          try {
            assert.equal(sum, 12 + 31);
            resolve();
          } catch (error) {
            reject(error);
          }
        },
      );
    });
  });
});
