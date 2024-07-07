"use server";

import { checkAuthAsync } from "@/checkAuth";
import { db } from "@/db";
import { teams } from "@/db/schema";
import { eq, ilike } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const newSchema = z.string().min(1).max(16).trim();

export const createTeamAction = async (formData: FormData) => {
  await checkAuthAsync();
  const name = newSchema.parse(formData.get("name"));

  const existingTeam = await db.query.teams.findFirst({
    where: ilike(teams.name, name),
  });

  if (existingTeam) throw new Error("Team exists");

  await db.insert(teams).values({
    name,
  });

  redirect("/teams");
};

const deleteSchema = z.string().regex(/\d/).transform(Number);

export const deleteTeamAction = async (formData: FormData) => {
  await checkAuthAsync();
  const id = deleteSchema.parse(formData.get("id"));

  await db.delete(teams).where(eq(teams.id, id));
  revalidatePath("/teams");
};
