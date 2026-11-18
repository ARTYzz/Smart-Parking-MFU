"use client";
import { useState } from "react";
import { UserRound } from "lucide-react";
import type { AppUser } from "@/lib/services/contracts";

export function UserAvatar({ user }: { user: AppUser | null }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const url = user?.avatarUrl;
  if (url && url !== failedUrl) {
    // Google hosts the account photo; no image optimization proxy is required.
    // eslint-disable-next-line @next/next/no-img-element
    return <img key={url} src={url} alt="" referrerPolicy="no-referrer" className="h-full w-full rounded-full object-cover" onError={() => setFailedUrl(url)} />;
  }
  return <span aria-hidden="true">{user ? Array.from(user.name.trim())[0]?.toUpperCase() || "U" : <UserRound className="h-5 w-5" />}</span>;
}
