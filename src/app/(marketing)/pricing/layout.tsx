import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing - Devlumiq ATS | Simple, Transparent Pricing',
  description:
    'Choose the perfect plan for your team. Starter at $29/mo, Professional at $79/mo, Enterprise at $199/mo. 14-day free trial.',
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
