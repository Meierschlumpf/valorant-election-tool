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
            <input id="team-name" name="name" />
          </div>
          <button type="submit" className="underline">
            Create
          </button>
        </div>
      </form>
    </div>
  );
}
