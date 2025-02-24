import { browser, Runtime } from 'wxt/browser';

browser.devtools.panels.create('Piwik PRO JSTC Debugger', 'icon/128.png', 'devtools-panel.html');

export type QueryString = {
  name: string;
  value: string;
};

let port: Runtime.Port | undefined;
const queue: unknown[] = [];

browser.runtime.onConnect.addListener((p) => {
  port = p;
  if (queue.length) {
    queue.forEach((item: any) => {
      port?.postMessage({
        type: getEventType(item.request.postData.params),

        //   type: getEventType(request.request.postData.params),
        //   params: request.request.postData.params,
      });
    });
  }
});

browser.devtools.network.onRequestFinished.addListener((request: any) => {
  if (request.request.url.endsWith('ppms.php')) {
    if (port) {
      port.postMessage({
        type: getEventType(request.request.postData.params),
        //   params: request.request.postData.params,
      });
    } else {
      queue.push(request);
    }
  }
});

function getEventType(eventParams: QueryString[]) {
  if (isGoalConversion(eventParams)) return 'Goal Conversion';

  if (isPing(eventParams)) return getPingType(eventParams);

  if (isDownload(eventParams)) return 'Download';

  if (isOutlink(eventParams)) return 'Outlink';

  if (isConsentFormImpression(eventParams)) return 'Consent form impression';

  if (isConsentFormClick(eventParams)) return 'Consent form click';

  if (isConsentDecision(eventParams)) return 'Consent decision';

  if (isSharePoint(eventParams)) return 'SharePoint';

  if (isCustomEvent(eventParams)) return 'Custom event';

  if (isContentInteraction(eventParams)) return 'Content interaction';

  if (isContentImpression(eventParams)) return 'Content impression';

  if (isCartUpdate(eventParams)) return 'Cart update';

  if (isProductDetailView(eventParams)) return 'Product detail view';

  if (isAddToCart(eventParams)) return 'Add to cart';

  if (isRemoveFromCart(eventParams)) return 'Remove from cart';

  if (isOrderCompleted(eventParams)) return 'Order completed';

  if (isInternalSearch(eventParams)) return 'Internal search';

  return 'Page view';
}

function isGoalConversion(eventParams: QueryString[]) {
  const idgoal = eventParams.find((p) => p.name === 'idgoal');
  return idgoal?.value && idgoal.value !== '0';
}

function isPing(eventParams: QueryString[]) {
  return eventParams.some((p) => p.name === 'ping');
}
function getPingType(eventParams: QueryString[]) {
  const param = eventParams.find((p) => p.name === 'ping');
  if (!param) return 'Broken Event';

  const pingLevel = Number.parseInt(param.value);

  if (pingLevel === 1 || pingLevel === 2 || pingLevel === 3) return 'HeartBeat';

  if (pingLevel === 4) return 'Deanonymization';

  if (pingLevel === 5) return 'Page performance metric';

  if (pingLevel === 6) return 'Custom';

  return 'Broken Event';
}

function isDownload(eventParams: QueryString[]) {
  return eventParams.some((p) => p.name === 'download');
}

function isOutlink(eventParams: QueryString[]) {
  return eventParams.some((p) => p.name === 'link');
}

function isConsentFormImpression(eventParams: QueryString[]) {
  const category = eventParams.find((p) => p.name === 'e_c');
  return category?.value === 'consent_form_impression';
}

function isConsentFormClick(eventParams: QueryString[]) {
  const category = eventParams.find((p) => p.name === 'e_c');
  return category?.value === 'consent_form_click';
}

function isConsentDecision(eventParams: QueryString[]) {
  const category = eventParams.find((p) => p.name === 'e_c');
  return category?.value === 'consent_decision';
}

function isSharePoint(eventParams: QueryString[]) {
  const eventCustomVariables = eventParams.find((p) => p.name === 'cvar');
  const sessionCustomVariables = eventParams.find((p) => p.name === '_cvar');
  const category = eventParams.find((p) => p.name === 'e_c');

  let parsedEventCustomVariables;
  let parsedSessionCustomVariables;

  try {
    if (eventCustomVariables) {
      parsedEventCustomVariables = JSON.parse(decodeURIComponent(eventCustomVariables.value));
    }
  } catch (e) {
    console.error('Error parsing event custom variables:', e);
    return false;
  }

  try {
    if (sessionCustomVariables) {
      parsedSessionCustomVariables = JSON.parse(decodeURIComponent(sessionCustomVariables.value));
    }
  } catch (e) {
    console.error('Error parsing session custom variables:', e);
    return false;
  }

  return (
    (parsedEventCustomVariables?.['1']?.[0] === 'ppas.sharepoint.plugin' ||
      parsedSessionCustomVariables?.['1']?.[0] === 'ppas.sharepoint.plugin') &&
    (category?.value === 'download' || category?.value === 'search')
  );
}

function isCustomEvent(eventParams: QueryString[]) {
  const category = eventParams.some((p) => p.name === 'e_c');
  const action = eventParams.some((p) => p.name === 'e_a');
  return category && action;
}

function isContentInteraction(eventParams: QueryString[]) {
  const interaction = eventParams.some((p) => p.name === 'c_i');
  const name = eventParams.some((p) => p.name === 'c_n');
  return interaction && name;
}

function isContentImpression(eventParams: QueryString[]) {
  return eventParams.some((p) => p.name === 'c_n');
}

function isCartUpdate(eventParams: QueryString[]) {
  const idGoal = eventParams.find((p) => p.name === 'idgoal');
  const ecIdPresent = eventParams.some((p) => p.name === 'ec_id');
  const eventType = eventParams.find((p) => p.name === 'e_t');

  return (idGoal?.value === '0' && !ecIdPresent) || eventType?.value === 'cart-update';
}

function isProductDetailView(eventParams: QueryString[]) {
  return eventParams.find((p) => p.name === 'e_t')?.value === 'product-detail-view';
}

function isAddToCart(eventParams: QueryString[]) {
  return eventParams.find((p) => p.name === 'e_t')?.value === 'add-to-cart';
}

function isRemoveFromCart(eventParams: QueryString[]) {
  return eventParams.find((p) => p.name === 'e_t')?.value === 'remove-from-cart';
}

function isOrderCompleted(eventParams: QueryString[]) {
  const idGoal = eventParams.find((p) => p.name === 'idgoal');
  const ecIdPresent = eventParams.some((p) => p.name === 'ec_id');
  const eventType = eventParams.find((p) => p.name === 'e_t');

  return (idGoal?.value === '0' && ecIdPresent) || eventType?.value === 'order';
}

function isInternalSearch(eventParams: QueryString[]) {
  return eventParams.some((p) => p.name === 'search');
}
