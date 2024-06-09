import { byFirstColor, bySecondColor } from "@/constants";
import { getCompositionAsync } from "@/data/getComposition";
import { notFound } from "next/navigation";
import { z } from "zod";
import { MapSelection } from "../stream/map-selection";
import { Start } from "../stream/start";
import { getTokensAsync } from "@/data/getTokens";

interface Props {
  params: {
    compositionId: string;
  };
  searchParams: {
    token: string;
  };
}

export default async function StreamMapBan({ params, searchParams }: Props) {
  const id = z.string().regex(/\d+/).transform(Number).parse(params.compositionId);
  const composition = await getCompositionAsync(id);
  const tokens = await getTokensAsync(id);

  if (!composition) {
    notFound();
  }

  if (!searchParams.token) {
    notFound();
  }

  if (tokens?.tokenTeam1 !== searchParams.token && tokens?.tokenTeam2 !== searchParams.token) {
    notFound();
  }

  const type = tokens?.tokenTeam1 === searchParams.token ? "team1" : "team2";

  return (
    <div className="w-screen min-h-screen md:h-screen bg-gray-950 flex items-center justify-center select-none">
      <div className="absolute top-2 h-16 flex mx-auto left-0 right-0 w-max max-w-full">
        <div className="text-white w-96 text-lg md:text-3xl flex justify-end items-center p-4 font-medium" style={{ color: byFirstColor }}>
          {composition.team1.name}
        </div>
        <div className="flex justify-center items-center text-sm md:text-2xl text-white w-16">vs.</div>
        <div className=" text-white text-lg md:text-3xl w-96 flex justify-start items-center p-4 font-medium" style={{ color: bySecondColor }}>
          {composition.team2.name}
        </div>
      </div>

      <MapSelection composition={composition} type={type} />
    </div>
  );
}

<Start />;
