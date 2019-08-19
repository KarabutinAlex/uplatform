const { UnknownMemberError } = require('./UnknownMemberError');
const { UnsupportedServiceProviderError } = require('./UnsupportedServiceProviderError');

/**
 * Checks if the value has a symbol type.
 *
 * @param {*} value
 * @returns {boolean}
 */
const isSymbol = value => typeof value === 'symbol';

const isInspectSymbol = input => isSymbol(input)
        && String(input) === 'Symbol(util.inspect.custom)';

class Container {
  constructor() {
    this.definions = new Map();
    this.instances = new Map();
    this.factories = new Map();
    this.proxy = this.createProxy(this);

    return Object.freeze(this.proxy);
  }

  /**
   * @private
   * @param {Container} target
   */
  createProxy(target) {
    return new Proxy(target, {
      get: (_, property) => {
        if (isInspectSymbol(property)) {
          return {
            definions: this.definions,
            factories: this.factories,
            instances: this.instances,
          };
        }

        return target[property] || isSymbol(property)
          ? target[property]
          : target.get(property);
      },
    });
  }

  /**
   * Binds a service to the implementation.
   *
   * @param {string} serviceId
   * @param {Function|object} serviceFactory
   * @returns {void}
   */
  bind(serviceId, serviceFactory) {
    this.definions.set(serviceId, serviceFactory);
  }

  factory(member, definion) {
    this.factories.set(member, definion);
  }

  extend(member, extender) {
    if (this.definions.has(member)) {
      const definion = this.definions.get(member);

      this.definions.set(
        member,
        () => extender(
          definion(this.proxy),
          this.proxy,
        ),
      );

      return;
    }

    if (this.factories.has(member)) {
      const factory = this.factories.get(member);

      this.factories.set(
        member,
        () => extender(
          factory(this.proxy),
          this.proxy,
        ),
      );

      return;
    }

    throw new UnknownMemberError(member);
  }

  /**
   * Connect a service provider to the container.
   *
   * @param {Function|object} serviceProvider
   */
  use(serviceProvider) {
    if (serviceProvider instanceof Function) {
      serviceProvider(this);
      return;
    }

    throw new UnsupportedServiceProviderError();
  }

  /**
   * Retrieve an instance of the service.
   *
   * @param {string} serviceId Service ID
   * @returns {object} Service instance.
   * @throws {UnknownMemberError} Thrown if the service is not registered.
   */
  get(serviceId) {
    if (this.instances.has(serviceId)) {
      return this.instances.get(serviceId);
    }

    if (this.factories.has(serviceId)) {
      const factory = this.factories.get(serviceId);
      return factory(this.proxy);
    }

    if (this.definions.has(serviceId)) {
      const definion = this.definions.get(serviceId);

      if (definion instanceof Function) {
        const instance = definion(this.proxy);
        this.instances.set(serviceId, instance);
        return instance;
      }

      return definion;
    }

    throw new UnknownMemberError(serviceId);
  }
}

module.exports = {
  Container,
};
