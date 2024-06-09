import { ValorantMap, valorantMaps } from "@/app/maps";
import { Dispatch, SetStateAction } from "react";
import { Vote, Role, Section } from "./types";
import { MapCard } from "./map-card";
import PartySocket from "partysocket";
import SuperJSON from "superjson";
import { useSearchParams } from "next/navigation";
import { z } from "zod";
import { voteMessageSchema } from "../../../partykit/messages";

interface MapListProps {
  voteState: [Vote[], Dispatch<SetStateAction<Vote[]>>];
  selections: Vote[];
  section: Section;
  next: () => void;
  roles: Role[];
  firstTeam: string;
  secondTeam: string;
  type: "team1" | "team2" | "preview";
  compositionId: number;
  socket: PartySocket;
  isMyTurn: boolean;
}

export const MapList = ({ selections, voteState, section, next, roles, firstTeam, secondTeam, type, compositionId, socket, isMyTurn }: MapListProps) => {
  const [votes, setVotes] = voteState;
  const searchParams = useSearchParams();

  const createMapCardPropsFor = (map: ValorantMap) => {
    return {
      onClick: () => {
        const token = searchParams.get("token");
        if (!token) return;
        if (type === "preview") return;
        if (!isMyTurn) return;
        const vote = generateVoteFromSectionAndMapSelection(map, section);
        if (!vote) return;

        socket.send(
          SuperJSON.stringify({
            compositionId,
            token,
            type: "vote",
            data: vote,
          } satisfies z.infer<typeof voteMessageSchema>)
        );
        setVotes((votes) => {
          return votes.concat(vote);
        });
        next();
      },
      map,
      disabled: votes.some((vote) => vote.map === map && vote.kind === "ban"),
      cursor: isMyTurn ? undefined : ("default" as const),
      selected: votes.some((vote) => vote.map === map && vote.kind === "selection"),
      voter: votes.find((vote) => vote.map === map)?.by,
      selectionIndex: selections.findIndex((vote) => vote.map === map),
      firstTeam,
      secondTeam,
      mapRole: roles.find((role) => role.map === map),
      preview: type === "preview",
    };
  };

  return (
    <div className="flex justify-center flex-col items-center gap-4">
      <div className="w-5/6 flex justify-center">
        <div className="w-3/4 flex gap-4  flex-nowrap">
          {valorantMaps.slice(0, 3).map((map) => (
            <MapCard key={map} {...createMapCardPropsFor(map)} />
          ))}
        </div>
      </div>

      <div className="flex gap-4 w-5/6 flex-nowrap">
        {valorantMaps.slice(3).map((map) => (
          <MapCard key={map} {...createMapCardPropsFor(map)} />
        ))}
      </div>
    </div>
  );
};

const generateVoteFromSectionAndMapSelection = (map: (typeof valorantMaps)[number], section: Section): Vote | undefined => {
  switch (section) {
    case "ban-first":
      return {
        map,
        by: "first",
        kind: "ban",
      };
    case "ban-second":
      return {
        map,
        by: "second",
        kind: "ban",
      };
    case "select-first":
      return {
        map,
        by: "first",
        kind: "selection",
      };
    case "select-second":
      return {
        map,
        by: "second",
        kind: "selection",
      };
  }
};
