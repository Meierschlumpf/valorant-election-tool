import { auth, signIn, signOut } from "@/auth";
import Link from "next/link";
import { PropsWithChildren } from "react";

export default async function Layout({ children }: PropsWithChildren) {
  const session = await auth();

  return (
    <div className="min-h-full">
      <nav className="bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <NavLink href="/teams">Teams</NavLink>
                  <NavLink href="/compositions">Kompositionen</NavLink>
                </div>
              </div>
            </div>
            {session ? (
              <form
                action={async () => {
                  "use server";
                  await signOut();
                }}
              >
                <button type="submit" className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
                  Sign Out
                </button>
              </form>
            ) : (
              <form
                action={async () => {
                  "use server";
                  await signIn("discord");
                }}
              >
                <button type="submit" className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
                  Signin with Discord
                </button>
              </form>
            )}
          </div>
        </div>
      </nav>

      {children}
    </div>
  );
}

const NavLink = ({ href, children }: PropsWithChildren<{ href: string }>) => {
  return (
    <Link href={href} className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
      {children}
    </Link>
  );
};
