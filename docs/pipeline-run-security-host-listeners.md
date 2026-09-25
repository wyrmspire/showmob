# Host listeners: first page under the updated setup sheet

Written by Instinct. This preview page follows the third scoped page in [series.json](../runs/local-security-lab/series.json): [planned sheet](../runs/local-security-lab/pages/local-security-lab-host-listeners/page-sheet.json) -> [representation](../runs/local-security-lab/pages/local-security-lab-host-listeners/representation.json) -> [section draft](../runs/local-security-lab/pages/local-security-lab-host-listeners/draft.json) -> [critique](../runs/local-security-lab/pages/local-security-lab-host-listeners/critique.json) -> `app/src/content/local-security-lab-host-listeners.json`. Commits record the order.

`coreModel` changed the sequence: teach bind address before port numbers, contrast loopback, LAN and wildcard on one host, then check transfer on a different port. The page never equates a wildcard bind with proven reach. The illustration is an authored SVG because bind scopes are spatial; it is not a network test.

The critique caught a three-column table whose purpose column disappeared on phones, a long combined command block, and a caption that described arrows the figure did not have. It also clarified that UDP has no LISTEN state and that two worksheet rows start, rather than finish, an inventory. The rendered page was checked at 390px and 1280px; the critique records changes and limits. This page is `preview` until reviewed.

The older all-in-one lab page is still series order 1. This page is order 4 in the app because it follows two new foundation pages at 2 and 3. The scoped order calls it page 3. Changing the old page's place or status is a separate curator decision.
