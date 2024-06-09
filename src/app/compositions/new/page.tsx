import { db } from "@/db";
import { z } from "zod";
import { createCompositionAction } from "./action";
import { checkAuthAsync } from "@/checkAuth";

interface Props {
  searchParams: Partial<{
    teamA: string;
  }>;
}

const teamASchema = z.string().regex(/\d/).transform(Number);

export default async function NewComposition({ searchParams }: Props) {
  await checkAuthAsync();
  if (!searchParams.teamA) return "No team A defined";
  const result = teamASchema.safeParse(searchParams.teamA);

  if (!result.success) {
    return "Invalid team A parameter";
  }

  const teams = await db.query.teams.findMany();

  const team = teams.find((t) => t.id === result.data);
  const otherTeams = teams.filter((t) => t.id !== result.data);

  if (!team) {
    return "Specified team A not found";
  }

  return (
    <div className="flex flex-col gap-4 max-w-[768px] mx-auto my-8">
      <h1 className="text-3xl">Neue Komposition</h1>

      <form action={createCompositionAction}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="name">Name</label>
            <input id="name" name="name" className="border" />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="team-a">Team A</label>
            <select id="team-a" name="teamA" className="border" defaultValue={team.id}>
              <option value={team.id}>{team.name}</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="team-b">Team B</label>
            <select id="team-b" name="teamB" className="border">
              {otherTeams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="composition-type">Typ</label>
            <select id="composition-type" name="type" className="border">
              <option value="normal">Normal</option>
              <option value="final">Finale</option>
            </select>
          </div>

          <div className="flex justify-end">
            <button className="flex justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
              Erstellen
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
