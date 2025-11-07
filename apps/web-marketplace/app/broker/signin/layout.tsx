// This layout ensures the sign-in page is completely excluded from the broker dashboard layout
export default function BrokerSignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


