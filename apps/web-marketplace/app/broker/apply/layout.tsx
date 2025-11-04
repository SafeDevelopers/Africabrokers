// This layout overrides the parent broker layout for the apply route
// It allows access without authentication
export default function BrokerApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Render without authentication check - this is a public route
  return <>{children}</>;
}

