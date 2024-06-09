import { ValorantMap } from "@/app/maps";
import { defenseColor, attackColor } from "@/constants";
import { IconShield, IconSword } from "@tabler/icons-react";

interface RoleSelectionProps {
  map: ValorantMap;
  onSelection: (role: "attack" | "defense") => void;
}

export const RoleSelection = ({ map, onSelection }: RoleSelectionProps) => {
  return (
    <>
      <div
        className="hidden md:flex w-5/6 mx-auto flex-col gap-8 relative"
        style={{
          aspectRatio: 6 / 2,
          backgroundImage: `url(https://raw.githubusercontent.com/Meierschlumpf/valorant-election-tool/master/public/maps/${map}.png)`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          filter: "blur(100)",
        }}
      >
        <div className="flex flex-nowrap">
          <div className="p-16 aspect-square w-full">
            <button onClick={() => onSelection("defense")} className="bg-gray-950 bg-opacity-50 w-full h-full rounded-xl flex flex-col justify-center items-center">
              <IconShield color={defenseColor} size="50%" />
              <p style={{ color: defenseColor }} className="text-xl font-bold uppercase">
                Verteidigung
              </p>
            </button>
          </div>
          <div className="bg-transparent bg-opacity-50 aspect-square w-full"></div>
          <div className="p-16 aspect-square w-full">
            <button onClick={() => onSelection("attack")} className="bg-gray-950 bg-opacity-50 w-full h-full rounded-xl flex flex-col justify-center items-center">
              <IconSword color={attackColor} size="50%" />
              <p style={{ color: attackColor }} className="text-xl font-bold uppercase">
                Angriff
              </p>
            </button>
          </div>
        </div>
        <div className="absolute text-center text-5xl uppercase text-white w-full bottom-4 font-semibold">
          <span style={{ boxShadow: "0px 0px 15px 5px rgba(0, 0, 0, 0.5)", backgroundColor: "rgba(0, 0, 0, 0.5)" }} className="rounded p-1">
            {map}
          </span>
        </div>
      </div>

      <div
        className="flex md:hidden w-5/6 mx-auto flex-col gap-8 relative"
        style={{
          aspectRatio: 6 / 2,
          backgroundImage: `url(https://raw.githubusercontent.com/Meierschlumpf/valorant-election-tool/master/public/maps/${map}.png)`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          filter: "blur(100)",
        }}
      >
        <div className="absolute text-center text-5xl uppercase text-white w-full bottom-4 font-semibold">
          <span style={{ boxShadow: "0px 0px 15px 5px rgba(0, 0, 0, 0.5)", backgroundColor: "rgba(0, 0, 0, 0.5)" }} className="rounded p-1">
            {map}
          </span>
        </div>
      </div>
      <div className="flex md:hidden flex-nowrap">
        <div className="aspect-square w-1/2">
          <button onClick={() => onSelection("defense")} className="bg-gray-950 bg-opacity-50 w-full h-full rounded-xl flex flex-col justify-center items-center">
            <IconShield color={defenseColor} size="50%" />
            <p style={{ color: defenseColor }} className="text-xl font-bold uppercase">
              Verteidigung
            </p>
          </button>
        </div>
        <div className="aspect-square w-1/2">
          <button onClick={() => onSelection("attack")} className="bg-gray-950 bg-opacity-50 w-full h-full rounded-xl flex flex-col justify-center items-center">
            <IconSword color={attackColor} size="50%" />
            <p style={{ color: attackColor }} className="text-xl font-bold uppercase">
              Angriff
            </p>
          </button>
        </div>
      </div>
    </>
  );
};
