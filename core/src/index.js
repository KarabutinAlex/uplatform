"use strict";

function cachedResolver(resolver) {
    let value = null;
    return () => value || (value = resolver());
}

function createApplication() {
    const modules = { };
    const methods = {
        module(id, resolver, { cached = true } = {}) {
            if (cached) {
                resolver = cachedResolver(resolver);
            }

            modules[id] = resolver;
        },
    };

    return new Proxy({ }, {
        get(_, property) {
            if (Reflect.has(methods, property)) {
                return methods[property];
            }

            if (Reflect.has(modules, property)) {
                return modules[property]();
            }

            return null;
        },
    });
}

const up = createApplication();

module.exports = { up };
