import { cn, getInitials } from "@/lib/utils";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import Image from "next/image";

export function Avatar({
  src,
  firstName,
  lastName,
  className,
  size = "md",
}: {
  src?: string | null;
  firstName: string;
  lastName: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-16 w-16 text-lg" };

  return (
    <AvatarPrimitive.Root
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full bg-zinc-800 border border-zinc-700",
        sizes[size],
        className
      )}
    >
      {src ? (
        <Image src={src} alt="" fill className="object-cover" />
      ) : (
        <AvatarPrimitive.Fallback className="flex h-full w-full items-center justify-center font-semibold text-red-400">
          {getInitials(firstName, lastName)}
        </AvatarPrimitive.Fallback>
      )}
    </AvatarPrimitive.Root>
  );
}
