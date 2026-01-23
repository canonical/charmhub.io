import { initPackages, handleBundleIcons, loadBundleIcons } from "./packages";
import { initTopics } from "./topics";
import declareGlobal from "../../libs/declare";

export { initPackages, initTopics, handleBundleIcons, loadBundleIcons };

declareGlobal("charmhub.store", {
  initPackages,
  initTopics,
  handleBundleIcons,
  loadBundleIcons,
});
