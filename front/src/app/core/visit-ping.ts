/**
 * Fire-and-forget visit ping, relayed to Discord by pixlite's backend
 * (shared notification relay for the whole personal-projects group — see
 * pixlite/back/src/notifications). Runs once per page load.
 */
function isRealDomain(): boolean {
  const host = window.location.hostname;
  return host === 'jose-hernandez.dev' || host.endsWith('.jose-hernandez.dev');
}

export function sendVisitPing(): void {
  if (!isRealDomain()) return;

  fetch('https://api.pixlite.jose-hernandez.dev/visit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      site: 'markconverted',
      url: window.location.href,
    }),
  }).catch(() => {});
}
