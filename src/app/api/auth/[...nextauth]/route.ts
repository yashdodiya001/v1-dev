import { handlers } from "@/auth"; // Referring to the auth.ts we just created
export const { GET, POST } = handlers;

export async function generateStaticParams() {
  return [{ id: "1" }, { id: "2" }];
}
