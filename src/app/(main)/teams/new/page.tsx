import { checkAuthAsync } from "@/checkAuth";
import { createTeamAction } from "./action";

export default async function NewTeam() {
  await checkAuthAsync();

  return (
    <div className="flex flex-col gap-4 max-w-[768px] mx-auto my-8">
      <form action={createTeamAction}>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="team-name">Name</label>
            <input className="border" required minLength={1} id="team-name" name="name" />
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
