import { checkInByQrCode } from "@/lib/actions/gym";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { getMemberName } from "@/lib/utils";

export default async function PublicCheckInPage({ params }: { params: Promise<{ qr: string }> }) {
  const { qr } = await params;

  let member = null;
  let error = null;

  try {
    member = await checkInByQrCode(qr);
  } catch (e) {
    error = e instanceof Error ? e.message : "Check-in failed";
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900/80">
        <CardContent className="p-8 text-center">
          {member ? (
            <>
              <CheckCircle className="mx-auto h-16 w-16 text-emerald-400" />
              <h1 className="mt-4 text-2xl font-bold text-zinc-100">Welcome, {getMemberName(member)}!</h1>
              <p className="mt-2 text-emerald-400">You&apos;re checked in. Have a great workout!</p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-red-400">Check-in Failed</h1>
              <p className="mt-2 text-zinc-400">{error}</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
