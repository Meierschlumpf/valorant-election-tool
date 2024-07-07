import Link from "next/link";
import { db } from "../../../db";
import { deleteTeamAction } from "./new/action";
import { checkAuthAsync } from "@/checkAuth";

export default async function Teams() {
  await checkAuthAsync();
  const teams = await db.query.teams.findMany();

  return (
    <div className="flex flex-col gap-4 max-w-[768px] mx-auto my-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl">Teams</h1>
        <Link href="/teams/new" className="underline">
          Neues Team
        </Link>
      </div>

      <table>
        <thead>
          <tr>
            <th className="text-start">Name</th>
            <th className="text-start">Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => (
            <tr key={team.id}>
              <td>{team.name}</td>
              <td>
                <div className="flex gap-4">
                  <Link href={`/compositions/new?teamA=${team.id}`} className="underline">
                    Neue Komposition
                  </Link>
                  <form action={deleteTeamAction}>
                    <input name="id" type="hidden" value={team.id} />
                    <button type="submit" className="underline">
                      Entfernen
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
