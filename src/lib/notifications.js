export function notify({ message, title = "Mi Combi", tone = "info" }) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent("mi-combi-notify", {
      detail: {
        id: crypto.randomUUID(),
        message,
        title,
        tone,
      },
    })
  );
}
