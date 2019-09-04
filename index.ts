import {log} from "util";


const matchPattern = require('lodash-match-pattern');

export interface ILogger {
    warning(...args: any): void;

    error(...args: any): void;

    info(...args: any): void;

    debug(...args: any): void;
}

export interface IContainer {
    inject(key: string, value: any): void;

    resolve(key: string): any;

    getBean<T>(beanName: string, instanceName?: string | null, ...args: any): T;

    logger(): ILogger;
}

export interface ITestFacade {
    logger(): ILogger;

    report(...args: any): void;

    container(): IContainer;

    assertJson(expected: string, actual: object): void;

    fixtures(): IFixtures;
}

export interface IFixtures {

    setup(): void;

    createFixture(beanName: string, instanceName?: string | null, ...args: any[]): any;

}

export class Service {

    private container?: IContainer | null;

    constructor() {

    }

    public getContainer(): IContainer {
        if (this.container === null) {
            throw new Error("container is null");
        }
        return <IContainer>this.container;
    }

    get logger(): ILogger {
        return this.getContainer().logger();
    }

    setup() {
        //override this method in your subclass
        //do not throw exception here
    }
}

export class ConsoleLogger implements ILogger {
    private errorEnabled : string = process.env.ERROR_ENABLED || 'y';
    private infoEnabled : string = process.env.INFO_ENABLED || 'y';
    private warningEnabled : string = process.env.WARNING_ENABLED || 'y';
    private debugEnabled : string = process.env.DEBUG_ENABLED || 'n';

    error(...args: any): void {
        if (this.errorEnabled && this.errorEnabled.match(/^y/i)) {
            console.log('\x1b[31m', 'ERROR: ', ...args, '\x1b[0m');
        }
    }

    info(...args: any): void {
        if (this.infoEnabled && this.infoEnabled.match(/^y/i)) {
            console.log('INFO: ', ...args, '\x1b[0m');
        }
    }

    warning(...args: any): void {
        if (this.warningEnabled && this.warningEnabled.match(/^y/i)) {
            console.log('\x1b[33m', 'WARNING: ', ...args, '\x1b[0m');
        }
    }

    debug(...args: any): void {
        if (this.debugEnabled && this.debugEnabled.match(/^y/i)){
            console.log('\x1b[34m', 'DEBUG: ', ...args, '\x1b[0m');
        }
    }

}

export class Fixture extends Service {

    private fixtures?: IFixtures;


    public setFixtures(value: IFixtures) {
        this.fixtures = value;
    }

    public getFixtures(): IFixtures {
        if (this.fixtures === undefined) {
            throw new Error("object is null, tips: use TestFacade.fixtures().createFixture ")
        }
        return <IFixtures>this.fixtures;
    }
}


export class Container implements IContainer {
    private readonly properties = new Map();

    inject(key: string, value: any): any {
        this.properties.set(key, value);
        return value;
    }

    resolve(key: string, ignoreIfNotFound: boolean = false): any {
        const oAny = this.properties.get(key);
        if ((!ignoreIfNotFound) && (oAny === undefined)) {
            throw new Error(`container does not have any injection type or object by name ${key}`);
        }
        return oAny;
    }

    private createInstance<T extends Object>(type: (new (...args: any[]) => T), ...args: any[]): T {
        let o = new type(...args);
        this.prepareBean(o);
        if (o instanceof Fixture) {
            o.setup();
        }
        return o;
    }

    private prepareBean(target: any) {
        //any use in checking property existence in JS!?
        Reflect.set(target, "logger", this.logger());
        Reflect.set(target, "container", this);
    }

    getBean<T>(beanName: string, instanceName?: string | null, ...args: any): T {
        if (!beanName.startsWith('Type.')) {
            throw new Error('getBean can not be used for non-type injections. tips: just prefix your bean name with "Type." in order to use this function')
        }
        if (instanceName != null) {
            let o = this.resolve(instanceName, true);
            if (!o) {
                o = this.createInstance(this.resolve(beanName), ...args);
                this.inject(instanceName, o);
            }
            return o;
        }
        return this.createInstance(this.resolve(beanName), ...args);
    }

    logger(): ILogger {
        return this.resolve(CxConstants.LOGGER);
    }
}


export class TestFacade implements ITestFacade {

    private readonly _container: IContainer = new Container();
    private _fixtures?: IFixtures;
    private init: { attach: Function; parameters: { [p: string]: any } };

    constructor(init: { attach: Function, parameters: { [key: string]: any } }) {
        this.init = init;
        this.container().inject(CxConstants.LOGGER, new ConsoleLogger());
    }

    report(...args: any): void {
        this.init.attach(...args);
    }

    container(): IContainer {
        return this._container;
    }

    fixtures(): IFixtures {
        if (this._fixtures === undefined) {
            this._fixtures = <IFixtures>this.container().getBean(CxConstants.FIXTURES);
        }
        return this._fixtures;
    }

    assertJson(expected: string, actual: object): void {
        let expectedObj = JSON.parse(expected);
        let matchResult = matchPattern(actual, expectedObj);
        if (matchResult) {
            matchResult = matchResult.replace(new RegExp('didn\'t match target', 'gi'), 'but expected');
            this.logger().error(matchResult);
            this.report(matchResult);
        }
    }

    logger(): ILogger {
        return <ILogger>this.container().resolve(CxConstants.LOGGER);
    };

}


export class CxConstants {
    public static readonly LOGGER = 'Type.ILogger';
    public static readonly FIXTURES = 'Type.IFixtures';
}
