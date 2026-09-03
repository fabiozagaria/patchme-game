import { toast, type ExternalToast } from "sonner";

const VISIBLE_DURATION_MS = 5000;

type QueuedNotification = {
  title: string;
  options?: Omit<ExternalToast, "duration" | "onAutoClose" | "onDismiss">;
};

const pending: QueuedNotification[] = [];
let active = false;

function showNextNotification() {
  if (active) return;
  const next = pending.shift();
  if (!next) return;

  active = true;
  let completed = false;
  const complete = () => {
    if (completed) return;
    completed = true;
    active = false;
    window.setTimeout(showNextNotification, 150);
  };

  toast.success(next.title, {
    ...next.options,
    duration: VISIBLE_DURATION_MS,
    onAutoClose: complete,
    onDismiss: complete,
  });
}

/**
 * Mostra una notifica positiva per volta. Il timer parte soltanto quando
 * la notifica arriva davvero in primo piano, così nessun messaggio scade in coda.
 */
export function enqueueSuccessNotification(title: string, options?: QueuedNotification["options"]) {
  pending.push({ title, options });
  showNextNotification();
}
