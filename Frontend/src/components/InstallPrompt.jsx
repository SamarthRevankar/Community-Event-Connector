import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm mx-auto px-4 animate-slide-up">
      <div className="bg-slate-900 text-white rounded-2xl shadow-2xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 via-rose-400 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <Download className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">Add to Home Screen</p>
          <p className="text-xs text-slate-400">Install for the best experience</p>
        </div>
        <button
          onClick={handleInstall}
          className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-semibold rounded-lg transition-colors flex-shrink-0"
        >
          Install
        </button>
        <button onClick={handleDismiss} className="p-1 text-slate-400 hover:text-white transition-colors flex-shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
