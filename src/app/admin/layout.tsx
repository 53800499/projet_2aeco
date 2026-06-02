import AdminShell from "@/components/admin/AdminShell";

export const metadata = {
  title: "Backoffice | 2aeco",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
