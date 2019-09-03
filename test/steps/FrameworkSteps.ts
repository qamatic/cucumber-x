import {Given, Then, When} from 'cucumber'
import {assert} from 'chai';
import {ITestFacade} from "../../index";

Given(/^a variable set to (\d+)$/, function (value) {
    this.container().inject("counter", value);
    assert.equal(value, this.container().resolve("counter"));
});

When(/^I increment the variable by (\d+)$/, function (value) {
    this.container().inject("counter", this.container().resolve("counter") + value);
});

Then(/^the variable should contain (\d+)$/, function (value) {
    assert.equal(this.container().resolve("counter"), value);
});

Given('the user matches the pattern', function (b) {
    let facade = this as ITestFacade;
    let a = { state : 'PA'}
    console.log(facade.assertJson(b, a));
});

Given('a class with args {string} and {string}', function (p1, p2) {
    let facade = this as ITestFacade;
    facade.container().inject("Type.SunDry", SunDry);
    let sundry = facade.container().getBean<SunDry>("Type.SunDry", null, p1, p2);
   assert.equal(sundry.p1, "string1");
    assert.equal(sundry.p2, "string2");
    facade.logger().info(`p1: ${sundry.p1} p2: ${sundry.p2}`)
});

class SunDry {
    get p1(): string {
        return this._p1;
    }
    get p2(): string {
        return this._p2;
    }
    private readonly _p1: string;
    private readonly _p2: string;
    constructor(p1 : string, p2 : string){
        this._p1 = p1;
        this._p2 = p2;

    }

}
