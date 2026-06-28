"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { checkInByQrCode } from "@/lib/actions/gym";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMemberName } from "@/lib/utils";
import { CheckCircle, XCircle } from "lucide-react";

export default function CheckInPage() {
  const [result, setResult] = useState<{ success: boolean; message: string; name?: string } | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(
      async (decodedText) => {
        try {
          const qrCode = decodedText.includes("/check-in/")
            ? decodedText.split("/check-in/").pop()!
            : decodedText;

          const member = await checkInByQrCode(qrCode);
          setResult({
            success: true,
            message: "Checked in successfully!",
            name: getMemberName(member),
          });
        } catch (err) {
          setResult({
            success: false,
            message: err instanceof Error ? err.message : "Check-in failed",
          });
        }
      },
      () => {}
    );

    scannerRef.current = scanner;
    return () => {
      scanner.clear().catch(() => {});
    };
  }, []);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-zinc-100">QR Check-In</h1>
        <p className="text-zinc-400">Scan a member&apos;s QR code to check them in</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div id="qr-reader" className="overflow-hidden rounded-lg" />
        </CardContent>
      </Card>

      {result && (
        <Card className={result.success ? "border-emerald-800" : "border-red-800"}>
          <CardContent className="flex items-center gap-4 p-6">
            {result.success ? (
              <CheckCircle className="h-8 w-8 text-emerald-400" />
            ) : (
              <XCircle className="h-8 w-8 text-red-400" />
            )}
            <div>
              {result.name && <p className="font-semibold text-zinc-100">{result.name}</p>}
              <p className={result.success ? "text-emerald-400" : "text-red-400"}>{result.message}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
