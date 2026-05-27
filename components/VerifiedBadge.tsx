import { CheckBadgeIcon } from "@heroicons/react/24/solid";

interface VerifiedBadgeProps {
  className?: string;
}

export default function VerifiedBadge({ className = "w-5 h-5 text-blue-500" }: VerifiedBadgeProps) {
  return (
    <CheckBadgeIcon
      className={className}
      title="Verified Identity"
    />
  );
}
