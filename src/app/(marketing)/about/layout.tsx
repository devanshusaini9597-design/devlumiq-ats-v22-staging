import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us - Devlumiq ATS | Our Mission & Team',
  description:
    'Learn about Devlumiq ATS mission to simplify recruitment. Meet our team and discover why 500+ companies trust us.'
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
