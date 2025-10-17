import { cookiePolicy } from "@canonical/cookie-policy";
import "./polyfills";
import "./tooltip-icon-modal";
// To be re-imported once the changes from global-nav have been undone (WD-29514)
// import "./navigation";

cookiePolicy();
