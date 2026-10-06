import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="font-display text-7xl font-bold text-brand opacity-20 mb-4 select-none">
        404
      </div>
      <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink mb-3">
        Page not found
      </h2>
      <p className="text-ink-light max-w-sm mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <ButtonLink href="/" variant="primary">
        Return to Home
      </ButtonLink>
    </div>
  );
}
