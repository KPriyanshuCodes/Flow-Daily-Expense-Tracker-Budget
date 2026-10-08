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
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAFAF8] hover:bg-[#F2F2EF] text-[#1A1A1A] text-xs font-semibold transition-all active:scale-95 cursor-pointer border border-[#E5E5E2]"
        title="Install Flow as App"
      >
        <Download className="w-3.5 h-3.5 text-[#C47A2C]" />
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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAFAF8] hover:bg-[#F2F2EF] text-[#1A1A1A] text-xs font-semibold transition-all active:scale-95 cursor-pointer border border-[#E5E5E2]"
          title="Install Flow on iOS"
        >
          <Download className="w-3.5 h-3.5 text-[#C47A2C]" />
          <span>Install</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-3xl bg-[#FFFFFF] p-6 shadow-2xl border border-[#EAEAEA] flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#1A1A1A]">Install Flow on iPhone / iPad</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-full text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-[#F0F0ED] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col gap-3 text-xs text-[#8A8A8A]">
                <div className="flex items-start gap-3 p-3 bg-[#FAFAF8] rounded-2xl border border-[#E5E5E2]">
                  <div className="p-2 bg-[#FFFFFF] rounded-xl shadow-xs text-[#C47A2C] shrink-0 border border-[#E5E5E2]">
                    <Share className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-[#1A1A1A] block">Step 1: Tap Share</span>
                    In Safari toolbar at the bottom of the screen, tap the Share icon.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-[#FAFAF8] rounded-2xl border border-[#E5E5E2]">
                  <div className="p-2 bg-[#FFFFFF] rounded-xl shadow-xs text-[#C47A2C] shrink-0 border border-[#E5E5E2]">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-[#1A1A1A] block">Step 2: Add to Home Screen</span>
                    Scroll down in the share menu and select <strong className="text-[#1A1A1A]">Add to Home Screen</strong>.
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-[#C47A2C] hover:bg-[#B36E25] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
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
