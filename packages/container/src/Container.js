const { UnknownMemberError } = require('./UnknownMemberError');
const { UnsupportedServiceProviderError } = require('./UnsupportedServiceProviderError');

class Container {

    constructor() {
        this.definions = new Map();
        this.instances = new Map();
        this.factories = new Map();
        this.proxy = this.createProxy(this);

        return this.proxy;
    }

    createProxy(target) {
        return new Proxy(target, {
            set: (_, property, value) => {
                target.set(property, value);
                return true;
            },

            get: (_, property) => {
                if (typeof property === 'symbol' && String(property) === 'Symbol(util.inspect.custom)') {
                    return () => ({
                        definions: this.definions,
                        factories: this.factories,
                        instances: this.instances,
                    });
                }

                if (target[property] || property instanceof Symbol) {
                    return target[property];
                }

                return target.get(property);
            },
        });
    }

    set(member, definion) {
        this.definions.set(member, definion);
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

    register(serviceProvider) {
        if (serviceProvider && serviceProvider.register instanceof Function) {
            serviceProvider.register(this);
            return;
        }

        if (serviceProvider instanceof Function) {
            serviceProvider(this);
            return;
        }

        throw new UnsupportedServiceProviderError();
    }

    get(member) {
        if (this.instances.has(member)) {
            return this.instances.get(member);
        }

        if (this.factories.has(member)) {
            const factory = this.factories.get(member);
            return factory(this.proxy);
        }

        if (this.definions.has(member)) {
            const definion = this.definions.get(member);

            if (definion instanceof Function) {
                const instance = definion(this.proxy);
                this.instances.set(member, instance);
                return instance;
            }

            return definion;
        }

        throw new UnknownMemberError(member);
    }
}

module.exports = {
    Container,
};
