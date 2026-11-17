import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { createSessionClient } from "@/lib/supabase/server";
import { loadAdminSnapshot } from "@/lib/data/admin";
import { SimpleAdminDashboard } from "@/components/admin/simple-admin-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage({ params }: PageProps<"/[locale]/admin">) {
  const { locale } = await params;

  // Server-side authorisation: no admin role, no dashboard (RLS also applies).
  const session = await getAdminSession();
  if (!session) redirect(`/${locale}/admin/login`);

  const snapshot = await loadAdminSnapshot(await createSessionClient(), session);

  return (
    <SimpleAdminDashboard
      adminEmail={session.email}
      role={session.role}
      initial={snapshot}
    />
  );
}
