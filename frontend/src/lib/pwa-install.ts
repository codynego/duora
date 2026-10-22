export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

let installEvent: BeforeInstallPromptEvent | null = null;
let initialized = false;
const listeners = new Set<(event: BeforeInstallPromptEvent | null) => void>();

export function initPwaInstall() {
  if (typeof window === 'undefined' || initialized) return;
  initialized = true;
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    installEvent = event as BeforeInstallPromptEvent;
    listeners.forEach((listener) => listener(installEvent));
  });
}

export function getInstallPrompt() {
  return installEvent;
}

export function subscribeToInstallPrompt(listener: (event: BeforeInstallPromptEvent | null) => void) {
  listeners.add(listener);
  listener(installEvent);
  return () => {
    listeners.delete(listener);
  };
}

export async function promptInstall() {
  if (!installEvent) return false;
  await installEvent.prompt();
  const choice = await installEvent.userChoice;
  installEvent = null;
  listeners.forEach((listener) => listener(null));
  return choice.outcome === 'accepted';
}
