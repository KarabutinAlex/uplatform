declare namespace UPlatform {

    type ModuleFactory<T> = () => T;

    interface Application {
        module<T>(id: string, factory: ModuleFactory<T>): void;
        [moduleId: string]: any;
    }
}

export const up: UPlatform.Application;
