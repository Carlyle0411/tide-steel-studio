import { approvedImages } from "../../../pages/production/data/productionData";

export function getEP01VisualProductionStats() {
  return {
    characters: "0/4",
    mechas: "0/3",
    creatures: "0/3",
    environment: "0/5",
    keyframes: `${approvedImages.length}/18`
  };
}
