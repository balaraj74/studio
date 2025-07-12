
'use client'
import { redirect } from 'next/navigation'

// The "All Farms" page is now the main dashboard.
// This page will redirect to the dashboard to avoid duplicate content.
export default function AllFarmsRedirectPage() {
  redirect('/dashboard');
  return null;
}
