// @/app/progress/page.tsx
import { ProgressOverview } from "@/components/progress/progress-overview";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Progress - Math Whiz',
  description: 'Track your math quiz performance and review past attempts.',
};

export default function ProgressPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ProgressOverview />
    </div>
  );
}
