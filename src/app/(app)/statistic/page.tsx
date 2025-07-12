
'use client';
// This is a placeholder page that redirects to the new /analytics page
// which is styled as the "Statistic" page from the designs.
import { redirect } from 'next/navigation';

export default function StatisticRedirectPage() {
    redirect('/analytics');
    return null;
}
