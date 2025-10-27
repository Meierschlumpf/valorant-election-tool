import { ValorantMap, valorantMaps } from "@/app/maps";
import { Dispatch, SetStateAction, useState } from "react";
import { Vote, Role, Section } from "./types";
import { MapCard } from "./map-card";
import PartySocket from "partysocket";
import SuperJSON from "superjson";
import { useSearchParams } from "next/navigation";
import { z } from "zod";
import { voteMessageSchema } from "../../../partykit/messages";
import { Group, Modal, Stack } from "@mantine/core";
import "@mantine/core/styles.css";

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

const modalRecord: Record<
  "ban" | "selection",
  { title: string; content: (map: string) => JSX.Element; button: string }
> = {
  ban: {
    title: "Map bannen?",
    content: (map: string) => (
      <p>
        Bist du sicher, dass du die Map <strong>{capitalize(map)}</strong>{" "}
        bannen möchtest?
      </p>
    ),
    button: "Bannen",
  },
  selection: {
    title: "Map auswählen?",
    content: (map: string) => (
      <p>
        Bist du sicher, dass du die Map <strong>{capitalize(map)}</strong>{" "}
        auswählen möchtest?
      </p>
    ),
    button: "Auswählen",
  },
};

const capitalize = (s: string) => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const MapList = ({
  selections,
  voteState,
  section,
  next,
  roles,
  firstTeam,
  secondTeam,
  type,
  compositionId,
  socket,
  isMyTurn,
}: MapListProps) => {
  const [votes, setVotes] = voteState;
  const [modalProps, setModalProps] = useState<{
    type: "ban" | "selection";
    map: ValorantMap;
    onConfirm: () => Promise<void>;
  } | null>(null);
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

        setModalProps({
          type: vote.kind,
          map: map,
          onConfirm() {
            return new Promise((resolve) => {
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
              resolve();
            });
          },
        });
      },
      map,
      disabled: votes.some((vote) => vote.map === map && vote.kind === "ban"),
      cursor: isMyTurn ? undefined : ("default" as const),
      selected: votes.some(
        (vote) => vote.map === map && vote.kind === "selection"
      ),
      voter: votes.find((vote) => vote.map === map)?.by,
      selectionIndex: selections.findIndex((vote) => vote.map === map),
      firstTeam,
      secondTeam,
      mapRole: roles.find((role) => role.map === map),
      preview: type === "preview",
    };
  };

  return (
    <>
      {modalProps !== null && (
        <Modal
          title={modalRecord[modalProps.type].title}
          opened
          onClose={() => setModalProps(null)}
        >
          <Stack>
            {modalRecord[modalProps.type].content(modalProps.map)}
            <Group justify="space-between">
              <button
                className="bg-gray-600 px-4 py-1 rounded-xl flex flex-col justify-center items-center"
                onClick={() => setModalProps(null)}
              >
                <p className="text-base font-bold uppercase">Abbrechen</p>
              </button>
              <button
                className={`${
                  modalProps.type === "ban" ? "bg-red-600" : "bg-green-600"
                } px-4 py-1 rounded-xl flex flex-col justify-center items-center`}
                onClick={async () => {
                  await modalProps.onConfirm();
                  setModalProps(null);
                }}
              >
                <p className="text-base font-bold uppercase">
                  {modalRecord[modalProps.type].button}
                </p>
              </button>
            </Group>
          </Stack>
        </Modal>
      )}
      <div className="hidden md:flex justify-center flex-col items-center gap-4">
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
      <div className="flex md:hidden justify-center flex-wrap items-center gap-4 px-8 md:px-0 mb-8 md:mb-0">
        {valorantMaps.map((map) => (
          <MapCard key={map} {...createMapCardPropsFor(map)} />
        ))}
      </div>
    </>
  );
};

const generateVoteFromSectionAndMapSelection = (
  map: (typeof valorantMaps)[number],
  section: Section
): Vote | undefined => {
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
