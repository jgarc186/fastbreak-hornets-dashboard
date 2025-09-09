import { auth0 } from "@/lib/auth0";
import DashboardContent from "@/components/DashboardContent";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth0.getSession();

  if (!session) {
    redirect("/");
  }

  return <DashboardContent user={session.user} />;
}