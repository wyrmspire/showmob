import React from "react";
import { artifactPath } from "../screen";

export function artifactHref(slug: string, blockId?: string): string {
  return artifactPath(slug, blockId);
}

export function ArtifactLink({
  slug,
  open,
  className,
  children,
}: {
  slug: string;
  open: (slug: string) => void;
  className?: string;
  children: React.ReactNode;
}) {
  const follow = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) return;
    event.preventDefault();
    open(slug);
  };
  return (
    <a className={className} href={artifactHref(slug)} onClick={follow}>
      {children}
    </a>
  );
}
