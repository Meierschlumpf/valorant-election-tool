"use server";

import { checkAuthAsync } from "@/checkAuth";
import { db } from "@/db";
import { compositions } from "@/db/schema";
import { eq, ilike } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const idSchema = z.string().regex(/\d/).transform(Number);
const nameSchema = z.string().min(3).max(32).trim();

export const createCompositionAction = async (formData: FormData) => {
  await checkAuthAsync();
  const name = nameSchema.parse(formData.get("name"));
  const teamA = idSchema.parse(formData.get("teamA"));
  const teamB = idSchema.parse(formData.get("teamB"));
  const type = z.enum(["normal", "final"]).parse(formData.get("type"));

  const existing = await db.query.compositions.findFirst({
    where: ilike(compositions.name, name),
  });

  if (existing) {
    throw new Error("Name already used");
  }

  await db.insert(compositions).values({
    name,
    team1Id: teamA,
    team2Id: teamB,
    type,
  });

  redirect("/compositions");
};

const deleteSchema = z.string().regex(/\d/).transform(Number);

export const deleteCompositionAction = async (formData: FormData) => {
  await checkAuthAsync();
  const id = deleteSchema.parse(formData.get("id"));

  await db.delete(compositions).where(eq(compositions.id, id));
  revalidatePath("/compositions");
};
