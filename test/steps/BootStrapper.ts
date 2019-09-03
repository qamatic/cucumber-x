import {setDefaultTimeout, setWorldConstructor} from "cucumber";
import {TestFacade} from "../../index";

setDefaultTimeout(90 * 1000);
setWorldConstructor(TestFacade);
