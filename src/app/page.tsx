import { auth, signIn, signOut } from "@/auth";

export default async function Home() {
  const session = await auth();

  if (!session) {
    return (
      <form
        action={async () => {
          "use server";
          await signIn("discord");
        }}
      >
        <button type="submit" className="underline">
          Signin with Discord
        </button>
      </form>
    );
  }

  return (
    <form
      action={async () => {
        "use server";
        await signOut();
      }}
    >
      <button type="submit" className="underline">
        Sign Out
      </button>
    </form>
  );
}
