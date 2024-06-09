"use client";

import { useState } from "react";

interface TeamLinkInputProps {
  team: string;
  compositionId: number;
  token: string;
}

export const TeamLinkInput = ({ team, compositionId, token }: TeamLinkInputProps) => {
  const [isVisible, setVisible] = useState(false);

  // TODO: Link anpassen
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={`team-link-${team}`}>Abstimmungslink für {team}</label>
      <div className="flex flex-nowrap gap-2">
        <input id={`team-link-${team}`} type={isVisible ? "text" : "password"} defaultValue={`http://localhost:3000/maps/ban/${compositionId}/teams?token=${token}`} />
        <button onClick={() => setVisible((v) => !v)}>{isVisible ? "Verstecken" : "Anzeigen"}</button>
      </div>
    </div>
  );
};
