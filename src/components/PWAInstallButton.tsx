import React, { useState } from 'react';
import { Download, Share, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Suppress button if app is already running in standalone PWA mode
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition-all active:scale-95 cursor-pointer border border-neutral-300/60"
        title="Install Flow as App"
      >
        <Download className="w-3.5 h-3.5 text-neutral-700" />
        <span>Install</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported on WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition-all active:scale-95 cursor-pointer border border-neutral-300/60"
          title="Install Flow on iOS"
        >
          <Download className="w-3.5 h-3.5 text-neutral-700" />
          <span>Install</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-neutral-200 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-neutral-900">Install Flow on iPhone / iPad</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col gap-3 text-xs text-neutral-600">
                <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-2xl border border-neutral-200/60">
                  <div className="p-2 bg-white rounded-xl shadow-xs text-neutral-800 shrink-0">
                    <Share className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-neutral-900 block">Step 1: Tap Share</span>
                    In Safari toolbar at the bottom of the screen, tap the Share icon.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-2xl border border-neutral-200/60">
                  <div className="p-2 bg-white rounded-xl shadow-xs text-neutral-800 shrink-0">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-neutral-900 block">Step 2: Add to Home Screen</span>
                    Scroll down in the share menu and select <strong>Add to Home Screen</strong>.
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
