import { FeedbackCenter_Modus } from "./Enums";
import { Constants } from "./Constants";
import { Factory } from "./Factory";
import { FeedbackCenter } from "./FeedbackCenter";
import * as Helper from "./helper/Helper";
import { IConfig } from "./Interfaces";
import { Modal } from "./Modal";
import * as Preparer from "./Preparer";

export function activate(configuration?: IConfig): void {

  if (!configuration) {
    alert("Feedback module error: configuration object is missing!");
    return;
  }
  if (!configuration.projectCode) {
    alert("Feedback module error: project code is missing!");
    return;
  }
  if (!configuration.modus) {
    alert("Feedback module error: modus is missing!");
    return;
  }
  switch (configuration.modus) {
    case FeedbackCenter_Modus.UseExistingHTMLElement:
    case FeedbackCenter_Modus.UsePredefined:
    case FeedbackCenter_Modus.UseQueryParam:
      break;
    default:
      alert("Feedback module error: modus must be 'UseExistingHTMLElement', 'UsePredefined' or 'UseQueryParam' !");
      return;
  }
  if (configuration.modus === FeedbackCenter_Modus.UseExistingHTMLElement && !configuration.targetElement) {
    alert("Feedback module error: modus is UseExistingHTMLElement, but no targetElement specified!");
    return;
  }
  if (configuration.modus === FeedbackCenter_Modus.UseQueryParam
    && !Helper.getParameterByName(window.location.href, Constants.QUERYPARAM_SHOWFEEDBACKCENTER)) {
    // Query-Param-Modus activated, but no param -> FeedbackCenter is not required
    return;
  }

  Preparer.injectUAParserJS();

  if (configuration && configuration.locationOfCSSFile) {
    Preparer.injectCSS(configuration.locationOfCSSFile);
  }

  new FeedbackCenter(new Factory(), configuration).inject();
  new Modal().inject();
}
