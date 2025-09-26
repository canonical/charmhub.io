import { cookiePolicy } from "@canonical/cookie-policy";
import "./polyfills";
import "./navigation";
import "./tooltip-icon-modal";
import initCloseButton from "../libs/notification-close";

cookiePolicy();
initCloseButton();
