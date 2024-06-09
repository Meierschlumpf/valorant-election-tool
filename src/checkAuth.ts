import { notFound } from "next/navigation";
import { auth } from "./auth";

export const checkAuthAsync = async () => {
  const session = await auth();
  if (!session || session.user?.email !== process.env.ADMIN_EMAIL) {
    return notFound();
  }
};
