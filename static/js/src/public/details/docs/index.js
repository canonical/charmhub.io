import { initSideNav } from "../../docs/docs-side-navigation";
import { initMermaid } from "../../docs/mermaid";
import declareGlobal from "../../../libs/declare";

export { initSideNav, initMermaid };

declareGlobal("charmhub.details.docs", { initSideNav, initMermaid });
