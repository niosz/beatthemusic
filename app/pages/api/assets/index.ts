// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

export type GameAssets = {
  logo: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<GameAssets>
) {
  const gameAssets = require("../../../public/assets/gameAssets.json");
  res.status(200).json({ logo: gameAssets.logo });
}
