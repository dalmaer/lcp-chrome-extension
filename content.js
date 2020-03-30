// Create a variable to hold the latest LCP value (since it can change).
let lcp;

// Create the PerformanceObserver instance.
const po = new PerformanceObserver(entryList => {
  const entries = entryList.getEntries();
  const lastEntry = entries[entries.length - 1];

  // Update `lcp` to the latest value, using `renderTime` if it's available,
  // otherwise using `loadTime`. (Note: `renderTime` may not be available if
  // the element is an image and it's loaded cross-origin without the
  // `Timing-Allow-Origin` header.)
  lcp = lastEntry.renderTime || lastEntry.loadTime;

  // Send the LCP to the background page
  console.log("LCP:", Math.floor(lcp), "ms");
  chrome.runtime.sendMessage({ result: Math.floor(lcp) });
});

// Observe entries of type `largest-contentful-paint`, including buffered
// entries, i.e. entries that occurred before calling `observe()`.
po.observe({ type: "largest-contentful-paint", buffered: true });
