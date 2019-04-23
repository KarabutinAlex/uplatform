declare namespace UPlatform {
    type ModuleFactory<T> = () => T;

    class Application {
        module<T>(id: string, factory: ModuleFactory<T>): void;
        [moduleId: string]: any;
        static create(): Application;
    }
}

export const up: UPlatform.Application;
