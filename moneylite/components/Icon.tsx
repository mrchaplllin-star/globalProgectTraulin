import React from "react";
import { Feather } from "@expo/vector-icons";

type Props = {
  name: string;
  color: string;
  size?: number;
};

const iconMap: Record<string, React.ComponentProps<typeof Feather>["name"]> = {
  wallet: "credit-card",
  "credit-card": "credit-card",
  bank: "home",
  cash: "dollar-sign",
  pizza: "shopping-bag",
  coffee: "coffee",
  bus: "truck",
  home: "home",
  heart: "heart",
  "shopping-bag": "shopping-bag",
  music: "music",
  briefcase: "briefcase",
  laptop: "monitor",
  gift: "gift",
  transfer: "repeat",
  note: "file-text"
};

export const Icon = ({ name, color, size = 20 }: Props) => {
  const mapped = iconMap[name] ?? "circle";
  return <Feather name={mapped} color={color} size={size} />;
};
