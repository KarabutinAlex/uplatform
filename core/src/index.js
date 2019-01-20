"use strict";

function cachedResolver(resolver) {
    let value = null;
    return () => value || (value = resolver());
}

class UnknownModule extends Error {

    constructor(message, moduleId) {
        super(message);
        this.name = 'UnknownModule';
        this.moduleId = moduleId;
    }
}

class Application {
    constructor() {
        this.modules = new Map();
    }

    module(moduleId, resolver, { cached = true } = {}) {
        if (cached) {
            resolver = cachedResolver(resolver);
        }

        this.modules.set(moduleId, resolver);
    }

    static create() {
        return new Proxy(
            new Application(),
            {
                has(application, property) {
                    if (Reflect.has(application, property)) return true;
                    if (application.modules.has(property)) return true;
                    return false;
                },

                get(application, property) {
                    if (Reflect.has(application, property)) {
                        return application[property].bind(application);
                    }

                    if (application.modules.has(property)) {
                        return application.modules.get(property)();
                    }

                    throw new UnknownModule(`Module "${property}" is not registered.`);
                },
            },
        );
    }
}

const up = Application.create();

module.exports = {
    Application,
    UnknownModule,
    up,
};
