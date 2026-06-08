"use client";

import { useState } from "react";
import { saveLocalContribution } from "@/lib/storageHelpers";

export function useLocalContributions() {
  const [contributions, setContributions] = useState([]);

  const addContribution = (contribution) => {
    const nextContributions = saveLocalContribution(contribution);
    setContributions(nextContributions);
  };

  return { contributions, addContribution };
}
