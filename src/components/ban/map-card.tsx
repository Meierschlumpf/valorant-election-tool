import { attackColor, byFirstColor, bySecondColor, defenseColor } from "@/constants";
import { IconForbid2, IconShield, IconSword } from "@tabler/icons-react";
import { By, Role } from "./types";

interface MapCardProps {
  map: string;
  disabled?: boolean;
  selected?: boolean;
  selectionIndex: number;
  voter?: By;
  onClick: () => void;
  mapRole?: Role;
  firstTeam: string;
  secondTeam: string;
  preview: boolean;
  cursor: "default" | undefined;
}

export const MapCard = ({ map, disabled, selected, selectionIndex, voter, onClick, mapRole, firstTeam, secondTeam, preview, cursor }: MapCardProps) => {
  const currentColor = voter === "first" ? byFirstColor : voter === "second" ? bySecondColor : voter === "computer" ? "white" : "transparent";
  const isFirstAttack = mapRole?.role === "attack" && mapRole.by === "first";
  const isSecondDefense = mapRole?.role === "defense" && mapRole.by === "second";
  const attackTeam = isFirstAttack || isSecondDefense ? "first" : "second";

  return (
    <button
      style={{
        aspectRatio: 4 / 3,
        border: `4px solid ${currentColor}`,
        cursor,
      }}
      className="w-full bg-gray-900 rounded text-2xl font-medium text-white uppercase p-2 relative"
      disabled={disabled || selected || preview}
      onClick={onClick}
    >
      <div
        style={{
          backgroundImage: `url(https://raw.githubusercontent.com/Meierschlumpf/valorant-election-tool/master/public/maps/${map}.png)`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          filter: disabled ? "grayscale(0.9)" : undefined,
          boxShadow: disabled ? "inset 0px 0px 50px 50px rgba(0,0,0,0.5)" : "inset 0px 50px 50px 3px rgba(0,0,0,0.75)",
        }}
        className="w-full h-full absolute top-0 left-0"
      ></div>
      <div className="absolute top-2">{map}</div>
      {mapRole && (
        <div className="absolute left-0 top-0 right-0 bottom-0 flex justify-center items-center">
          <div className="flex flex-col gap-2 bg-gray-950 bg-opacity-30 p-4 rounded-xl">
            <div className="flex gap-1">
              <IconSword color={attackColor} size={32} />
              <span className="text-lg">{attackTeam === "first" ? firstTeam : secondTeam}</span>
            </div>
            <div className="flex gap-1">
              <IconShield color={defenseColor} size={32} />
              <span className="text-lg">{attackTeam === "second" ? firstTeam : secondTeam}</span>
            </div>
          </div>
        </div>
      )}
      {disabled && (
        <div className="absolute bottom-2 right-2">
          <IconForbid2 color={voter === "first" ? byFirstColor : bySecondColor} size={64} stroke={2} />
        </div>
      )}
      {selected && selectionIndex !== -1 && (
        <div className="absolute bottom-0 right-0 w-16 h-16 text-4xl flex items-center justify-center" style={{ backgroundColor: currentColor, color: voter !== "second" ? "black" : "white" }}>
          {selectionIndex + 1}
        </div>
      )}
    </button>
  );
};
