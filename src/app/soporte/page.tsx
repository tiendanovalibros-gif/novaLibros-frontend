import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import MisChats from "@/sections/soporte/mis-chats";

export const dynamic = "force-dynamic";

export default function SoportePage() {
  const token = cookies().get("auth_token")?.value;
  if (!token) redirect("/login");
  return <MisChats />;
}
