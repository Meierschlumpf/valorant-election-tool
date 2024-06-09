"use client";

import { MapList } from "@/components/ban/map-list";
import { RoleSelection } from "@/components/ban/role-selection";
import { Role, Section, Vote } from "@/components/ban/types";
import { byFirstColor, bySecondColor } from "@/constants";
import { Composition } from "@/data/getComposition";
import { getCurrentSectionIndex, mapTypeSections } from "@/sections";
import { useSearchParams } from "next/navigation";
import usePartySocket from "partysocket/react";
import { useState } from "react";
import SuperJSON from "superjson";
import { z } from "zod";
import { fromServerMessageSchema, roleMessageSchema } from "../../../../../../partykit/messages";

interface MapSelectionProps {
  composition: Composition;
  type: "team1" | "team2" | "preview";
}

export const MapSelection = ({ type, composition }: MapSelectionProps) => {
  const [sectionIndex, setSectionIndex] = useState(getCurrentSectionIndex(composition));
  const section = mapTypeSections[composition.type][sectionIndex]!;
  const searchParams = useSearchParams();
  const isMyTurn = (type === "team1" && section.includes("first")) || (type === "team2" && section.includes("second"));
  const next = () =>
    setSectionIndex((i) => {
      if (mapTypeSections[composition.type].length - 1 === i) return i;
      return i + 1;
    });

  const [votes, setVotes] = useState<Vote[]>(composition.mapStates);
  const [roles, setRoles] = useState<Role[]>(
    composition.mapStates
      .filter((mapState) => mapState.attackerId !== null && mapState.kind === "selection")
      .map((mapState) => ({
        role: (mapState.by === "first" && mapState.attackerId === composition.team1Id) || (mapState.by === "second" && mapState.attackerId === composition.team2Id) ? "attack" : "defense",
        map: mapState.map,
        by: mapState.by,
      }))
  );

  const handleRoleMessage = (role: Role) => {
    setRoles((roles) => {
      // Ignore when role for map already defined (for example we sent the request ourself)
      if (roles.some((r) => r.map === role.map)) return roles;
      return [...roles, role];
    });
    next();
  };

  const handleVoteMessage = (vote: Vote) => {
    setVotes((votes) => {
      if (votes.some((v) => v.map === vote.map)) return votes;

      return votes.concat(vote);
    });

    if (vote.by !== "computer") {
      next();
    }
  };

  const socket = usePartySocket({
    host: process.env.NEXT_PUBLIC_PARTYKIT_HOST,
    room: `composition-${composition.id}`,
    onMessage(event) {
      const result = fromServerMessageSchema.safeParse(SuperJSON.parse(event.data));
      if (!result.success) return;

      switch (result.data.type) {
        case "role":
          handleRoleMessage(result.data.data);
          break;
        case "vote":
          handleVoteMessage(result.data.data);
          break;
      }
    },
  });

  const selections = votes.filter((vote) => vote.kind === "selection");
  const lastVote = votes.at(-1);
  const showRoleSelection = (section === "select-role-first" && type === "team1") || (section === "select-role-second" && type === "team2");

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-white text-5xl font-medium">{title(section)}</h1>
        <p className="text-white text-xl">{subtitle(section, composition.team1.name, composition.team2.name)}</p>
      </div>

      {type === "preview" || !showRoleSelection ? (
        <MapList
          compositionId={composition.id}
          firstTeam={composition.team1.name}
          secondTeam={composition.team2.name}
          socket={socket}
          voteState={[votes, setVotes]}
          selections={selections}
          section={section}
          next={next}
          roles={roles}
          type={type}
          isMyTurn={isMyTurn}
        />
      ) : null}
      {type !== "preview" && lastVote && showRoleSelection ? (
        <RoleSelection
          map={lastVote.map}
          onSelection={(role) => {
            const token = searchParams.get("token");
            if (!token) return;

            if (!isMyTurn) return;

            const newRole = {
              role,
              map: lastVote.map,
              by: lastVote.by === "first" ? ("second" as const) : ("first" as const), // Revert as the oposite time has voted for the map
            };

            socket.send(
              SuperJSON.stringify({
                type: "role",
                token,
                compositionId: composition.id,
                data: newRole,
              } satisfies z.infer<typeof roleMessageSchema>)
            );

            setRoles((roles) => {
              return [...roles, newRole];
            });
            next();
          }}
        />
      ) : null}
    </div>
  );
};

const title = (section: Section) => {
  switch (section) {
    case "ban-first":
      return "BANNEN";
    case "ban-second":
      return "BANNEN";
    case "select-first":
      return "AUSWÄHLEN";
    case "select-second":
      return "AUSWÄHLEN";
    case "select-role-first":
      return "AUSWÄHLEN";
    case "select-role-second":
      return "AUSWÄHLEN";
    case "ready":
      return "AUSGEWÄHLT";
  }
};

const subtitle = (section: Section, firstTeam: string, secondTeam: string) => {
  switch (section) {
    case "ban-first":
      return (
        <>
          TEAM <span style={{ color: byFirstColor }}>{firstTeam}</span> BANNT EINE MAP
        </>
      );
    case "ban-second":
      return (
        <>
          TEAM <span style={{ color: bySecondColor }}>{secondTeam}</span> BANNT EINE MAP
        </>
      );
    case "select-first":
      return (
        <>
          TEAM <span style={{ color: byFirstColor }}>{firstTeam}</span> WÄHLT EINE MAP
        </>
      );
    case "select-second":
      return (
        <>
          TEAM <span style={{ color: bySecondColor }}>{secondTeam}</span> WÄHLT EINE MAP
        </>
      );

    case "select-role-first":
      return (
        <>
          TEAM <span style={{ color: byFirstColor }}>{firstTeam}</span> WÄHLT DIE ROLLE
        </>
      );
    case "select-role-second":
      return (
        <>
          TEAM <span style={{ color: bySecondColor }}>{secondTeam}</span> WÄHLT DIE ROLLE
        </>
      );
    case "ready":
      return "DIE ZU SPIELENDEN MAPS STEHEN FEST";
  }
};
