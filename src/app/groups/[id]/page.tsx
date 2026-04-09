import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import GroupClient from "./GroupClient";

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { id } = await params;
  return <GroupClient groupId={parseInt(id)} session={session} />;
}
