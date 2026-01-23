import { initTopicFilters } from "./filter";
import declareGlobal from "../../libs/declare";

export { initTopicFilters };

declareGlobal("charmhub.topics", { initTopicFilters });
