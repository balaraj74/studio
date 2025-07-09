"use client";

import { ReactNode } from 'react';

export default function AuthGuard({ children }: { children: ReactNode }) {
  // Authentication has been removed, so this component just passes children through.
  return <>{children}</>;
}
