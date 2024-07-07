"use client";

import { useState } from "react";

interface TeamLinkInputProps {
  team: string;
  compositionId: number;
  token: string;
}

export const TeamLinkInput = ({ team, compositionId, token }: TeamLinkInputProps) => {
  const [isVisible, setVisible] = useState(false);
  const origin = window.location.origin;

  // TODO: Link anpassen
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={`team-link-${team}`}>Abstimmungslink für {team}</label>
      <div className="flex flex-nowrap gap-2">
        <input id={`team-link-${team}`} type={isVisible ? "text" : "password"} className="border" defaultValue={`${origin}/maps/ban/${compositionId}/teams?token=${token}`} />
        <button onClick={() => setVisible((v) => !v)}>{isVisible ? "Verstecken" : "Anzeigen"}</button>
      </div>
    </div>
  );
};
