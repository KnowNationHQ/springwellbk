"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

export function UserAvatar({
  imageId,
  firstName,
  lastName,
  size = 28,
}: {
  imageId?: string | null;
  firstName: string;
  lastName: string;
  size?: number;
}) {
  const imageUrl = useQuery(
    api.auth.getImageUrl,
    imageId ? { imageId } : "skip"
  );

  const initials =
    `${firstName?.charAt(0) ?? ""}${lastName?.charAt(0) ?? ""}`.toUpperCase() ||
    "?";

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={`${firstName} ${lastName}`}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: "#426FB6",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.4,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}
