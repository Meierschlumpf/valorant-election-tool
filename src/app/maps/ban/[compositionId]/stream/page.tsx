import { byFirstColor, bySecondColor } from "@/constants";
import { getCompositionAsync } from "@/data/getComposition";
import { notFound } from "next/navigation";
import { z } from "zod";
import { MapSelection } from "./map-selection";
import { Start } from "./start";

interface Props {
  params: {
    compositionId: string;
  };
}

export default async function StreamMapBan({ params }: Props) {
  const id = z.string().regex(/\d+/).transform(Number).parse(params.compositionId);
  const composition = await getCompositionAsync(id);

  if (!composition) {
    notFound();
  }

  return (
    <div className="w-screen h-screen bg-gray-950 flex items-center justify-center select-none">
      <div className="absolute top-2 h-16 flex mx-auto left-0 right-0 w-max">
        <div className="text-white w-96 text-3xl flex justify-end items-center p-4 font-medium" style={{ color: byFirstColor }}>
          {composition.team1.name}
        </div>
        <div className="flex justify-center items-center text-2xl text-white w-16">vs.</div>
        <div className=" text-white text-3xl w-96 flex justify-start items-center p-4 font-medium" style={{ color: bySecondColor }}>
          {composition.team2.name}
        </div>
      </div>

      <MapSelection composition={composition} type="preview" />
    </div>
  );
}

<Start />;
