import { checkAuthAsync } from "@/checkAuth";
import { db } from "@/db";
import { compositions } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { TeamLinkInput } from "./team-link-input";

interface Props {
  params: {
    id: string;
  };
}

export default async function CompositionDetails({ params }: Props) {
  await checkAuthAsync();

  const id = z.string().regex(/\d+/).transform(Number).parse(params.id);

  const composition = await db.query.compositions.findFirst({
    where: eq(compositions.id, id),
    with: {
      team1: true,
      team2: true,
    },
  });

  if (!composition) notFound();

  return (
    <div className="flex flex-col gap-4 max-w-[768px] mx-auto my-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl">
          Komposition {composition.team1.name} vs. {composition.team2.name}
        </h1>
      </div>

      <h2 className="text-xl">Map Bans:</h2>
      <Link href={`/maps/ban/${composition.id}/stream`} className="underline">
        Zur Streamvorschau
      </Link>

      <TeamLinkInput team={composition.team1.name} token={composition.tokenTeam1} compositionId={composition.id} />

      <TeamLinkInput team={composition.team2.name} token={composition.tokenTeam2} compositionId={composition.id} />
    </div>
  );
}
