import { cookiePolicy } from "@canonical/cookie-policy";
import "./sentry";
import "./polyfills";
import "./tooltip-icon-modal";
import initCloseButton from "../libs/notification-close";

cookiePolicy();
initCloseButton();
