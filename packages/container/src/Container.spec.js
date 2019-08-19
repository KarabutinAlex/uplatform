const { assert } = require('chai');
const { Container } = require('./Container');
const { UnknownMemberError } = require('./UnknownMemberError');
const { UnsupportedServiceProviderError } = require('./UnsupportedServiceProviderError');

describe('Container', () => {
  let container = null;

  beforeEach(() => {
    container = new Container();
  });

  it('provides a scalar property', () => {
    container.bind('property1', 'value1');

    const value1 = container.get('property1');

    assert.equal(value1, 'value1');
  });

  it('provides a scalar property (short syntax)', () => {
    container.bind('property1', 'value1');

    assert.equal(container.property1, 'value1');
  });

  it('provides a defined service', () => {
    container.bind('service1', () => ({ name: 'MyService1' }));

    const instance1 = container.get('service1');

    assert.isObject(instance1);
    assert.equal(instance1.name, 'MyService1');
  });

  it('provides a defined service (short syntax)', () => {
    container.bind('service1', () => ({ name: 'MyService1' }));

    const instance1 = container.service1;

    assert.isObject(instance1);
    assert.equal(instance1.name, 'MyService1');
  });

  it('provides a service that is defined with a service provider', () => {
    const serviceProvider1 = (c) => {
      c.bind('service1', () => ({ name: 'MyService1' }));
    };

    container.use(serviceProvider1);

    const instance1 = container.service1;

    assert.isObject(instance1);
    assert.equal(instance1.name, 'MyService1');
  });

  it('throws an error if a service provider is not a function', () => {
    assert.throws(
      () => container.use('some_unexpected_value'),
      UnsupportedServiceProviderError,
      /Service provider must be either an object with a method "register" or a function\./,
    );
  });

  it('provides the same instance of a service by default', () => {
    let instanceId = 0;

    container.bind('service1', () => {
      instanceId += 1;
      return {
        id: instanceId,
      };
    });

    const instance1 = container.service1;
    const instance2 = container.service1;

    assert.isObject(instance1);
    assert.equal(instance1.id, 1);
    assert.equal(instance2.id, 1);
  });

  it('provides an instance of a service using factories default', () => {
    let instanceId = 0;

    container.factory(
      'service1',
      () => {
        instanceId += 1;
        return {
          id: instanceId,
        };
      },
    );

    const instance1 = container.service1;
    const instance2 = container.service1;

    assert.isObject(instance1);
    assert.equal(instance1.id, 1);
    assert.equal(instance2.id, 2);
  });

  it('throws an error if unknown member is requested', () => {
    assert.throws(
      () => container.service1,
      UnknownMemberError,
      /Member "service1" is not defined\./,
    );
  });

  it('extends a service that is defined default way', () => {
    container.bind('service1', () => ({ plugins: [] }));
    container.extend('service1', (service1) => {
      service1.plugins.push('plugin1');
      return service1;
    });

    const { service1 } = container;

    assert.isObject(service1);
    assert.isArray(service1.plugins);
    assert.deepEqual(
      service1.plugins,
      ['plugin1'],
    );
  });

  it('extends a service that is defined via factory way', () => {
    container.factory('service1', () => ({ plugins: [] }));
    container.extend('service1', (service1) => {
      service1.plugins.push('plugin1');
      return service1;
    });

    const { service1 } = container;

    assert.isObject(service1);
    assert.isArray(service1.plugins);
    assert.deepEqual(
      service1.plugins,
      ['plugin1'],
    );
  });

  it('throws an error on extending an unknown service', () => {
    assert.throws(
      () => container.extend('service1', service1 => service1),
      UnknownMemberError,
      /Member "service1" is not defined\./,
    );
  });
});
