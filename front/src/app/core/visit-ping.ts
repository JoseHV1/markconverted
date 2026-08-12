/**
 * Fire-and-forget visit ping, relayed to Discord by pixlite's backend
 * (shared notification relay for the whole personal-projects group — see
 * pixlite/back/src/notifications). Runs once per page load.
 */
export function sendVisitPing(): void {
  fetch('https://api.pixlite.jose-hernandez.dev/visit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      site: 'markconverted',
      url: window.location.href,
    }),
  }).catch(() => {});
}
