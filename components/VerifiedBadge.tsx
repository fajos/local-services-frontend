import { CheckBadgeIcon } from "@heroicons/react/24/solid";

interface VerifiedBadgeProps {
  className?: string;
  title?: string;
}

export default function VerifiedBadge({
  className = "w-5 h-5 text-blue-500",
  title = "Verified Identity"
}: VerifiedBadgeProps) {
  return (
    <CheckBadgeIcon
      className={className}
      title={title}
    />
  );
}
