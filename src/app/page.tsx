import { redirect } from "next/navigation";

export default function Home() {
  // Always redirect to login initially
  // the client-side useAuth hook will handle rerouting if authenticated
  redirect("/auth/login");
}
