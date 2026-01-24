export async function postJSON(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data?.error || data?.message || "request_failed";
    const details = data?.details ? `: ${data.details}` : "";
    throw new Error(`${msg}${details}`);
  }
  return data;
}
