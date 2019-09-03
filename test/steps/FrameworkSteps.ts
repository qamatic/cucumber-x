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
