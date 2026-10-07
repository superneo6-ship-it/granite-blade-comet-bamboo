import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Html5Qrcode } from "html5-qrcode";
import { Flashlight, FlashlightOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const READER_ID = "alejka-reader";

type Props = {
  open: boolean;
  onClose: () => void;
  onDetect: (code: string) => void;
};

export function ScannerOverlay({ open, onClose, onDetect }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [torchAvailable, setTorchAvailable] = useState(false);
  const onDetectRef = useRef(onDetect);
  const locked = useRef(false);
  onDetectRef.current = onDetect;

  useEffect(() => {
    if (!open) return;
    locked.current = false;
    let cancelled = false;
    let scanner: Html5Qrcode | null = null;

    const start = async () => {
      setError(null);
      setTorchOn(false);
      setTorchAvailable(false);
      try {
        const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import(
          "html5-qrcode"
        );
        if (cancelled) return;
        const instance = new Html5Qrcode(READER_ID, {
          verbose: false,
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.ITF,
            Html5QrcodeSupportedFormats.QR_CODE,
          ],
          useBarCodeDetectorIfSupported: true,
        });
        scanner = instance;
        await instance.start(
          { facingMode: "environment" },
          {
            fps: 12,
            aspectRatio: 1.777,
            disableFlip: true,
          },
          (decoded) => {
            const code = decoded.trim();
            if (!code || locked.current) return;
            locked.current = true;
            onDetectRef.current(code);
          },
          () => {
            /* frame miss */
          },
        );
        if (cancelled) return;
        try {
          const caps = instance.getRunningTrackCapabilities() as MediaTrackCapabilities & {
            torch?: boolean;
          };
          setTorchAvailable(Boolean(caps.torch));
        } catch {
          setTorchAvailable(false);
        }
      } catch (err) {
        if (cancelled) return;
        const name = err instanceof Error ? err.name : "";
        if (name === "NotAllowedError") {
          setError(
            "Brak zgody na aparat. Wpisz kod ręcznie albo zezwól na kamerę w ustawieniach przeglądarki.",
          );
        } else if (name === "NotFoundError") {
          setError("Nie znaleziono kamery. Wpisz kod ręcznie.");
        } else {
          setError(
            "Nie udało się uruchomić skanera. Na telefonie otwórz aplikację i zezwól na aparat — albo wpisz kod.",
          );
        }
      }
    };

    void start();

    return () => {
      cancelled = true;
      const current = scanner;
      if (!current) return;
      const halt = current.isScanning
        ? current.stop().then(() => current.clear())
        : Promise.resolve(current.clear());
      halt.catch(() => {
        try {
          current.clear();
        } catch {
          /* already gone */
        }
      });
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  const toggleTorch = async () => {
    const video = document.querySelector(
      `#${READER_ID} video`,
    ) as HTMLVideoElement | null;
    const stream = video?.srcObject;
    if (!(stream instanceof MediaStream)) return;
    const track = stream.getVideoTracks()[0];
    if (!track) return;
    const next = !torchOn;
    try {
      await track.applyConstraints({
        advanced: [{ torch: next } as unknown as MediaTrackConstraintSet],
      });
      setTorchOn(next);
    } catch {
      setTorchAvailable(false);
    }
  };

  return createPortal(
    <div className="scan-overlay" role="dialog" aria-modal="true" aria-label="Skaner kodu kreskowego">
      <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <p className="font-display text-xl tracking-tight">Skanowanie</p>
        <Button variant="secondary" size="icon" onClick={onClose} aria-label="Zamknij skaner">
          <X />
        </Button>
      </div>
      <div className="scan-stage">
        <div id={READER_ID} className="h-full w-full" />
        {!error ? (
          <div className="viewfinder">
            <div className="viewfinder-frame">
              <div className="laser" />
            </div>
          </div>
        ) : null}
        {error ? (
          <div className="absolute inset-0 flex items-end bg-background/80 p-5">
            <p className="max-w-prose text-sm leading-normal text-foreground">
              {error}
            </p>
          </div>
        ) : null}
      </div>
      <div className="flex items-center justify-between gap-3 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
        <p className="text-sm text-muted-foreground">
          Skieruj aparat na kod kreskowy
        </p>
        {torchAvailable ? (
          <Button
            variant="outline"
            size="icon"
            onClick={() => void toggleTorch()}
            aria-label={torchOn ? "Wyłącz latarkę" : "Włącz latarkę"}
          >
            {torchOn ? <FlashlightOff /> : <Flashlight />}
          </Button>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
