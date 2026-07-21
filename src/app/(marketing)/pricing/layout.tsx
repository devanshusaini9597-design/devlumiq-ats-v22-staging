import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing - Devlumiq ATS | License Options',
  description:
    'Choose a license type that fits your team: Regular or Extended. Includes a 14-day trial.',
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
