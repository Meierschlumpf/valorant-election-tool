import Link from "next/link";
import { db } from "../../db";
import { deleteCompositionAction } from "./new/action";
import { checkAuthAsync } from "@/checkAuth";

export default async function Compositions() {
  await checkAuthAsync();
  const compositions = await db.query.compositions.findMany({
    with: {
      team1: true,
      team2: true,
    },
    columns: {
      tokenTeam1: false,
      tokenTeam2: false,
    },
  });

  return (
    <div className="flex flex-col gap-4 max-w-[768px] mx-auto my-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl">Kompositionen</h1>
        <Link href="/teams" className="underline">
          Alle Teams
        </Link>
      </div>

      <table>
        <thead>
          <tr>
            <th className="text-start">Name</th>
            <th className="text-start">Teams</th>
            <th className="text-start">Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {compositions.map((composition) => (
            <tr key={composition.id}>
              <td>{composition.name}</td>
              <td>
                <div className="flex gap-1">
                  <span>{composition.team1.name}</span>
                  <span>vs.</span>
                  <span>{composition.team2.name}</span>
                </div>
              </td>
              <td>
                <div className="flex gap-4">
                  <form action={deleteCompositionAction}>
                    <input name="id" type="hidden" value={composition.id} />
                    <button type="submit" className="underline">
                      Entfernen
                    </button>
                  </form>
                  <Link href={`/compositions/${composition.id}`} className="underline">
                    Details
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
