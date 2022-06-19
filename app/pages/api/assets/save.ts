// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import { GameAssets } from ".";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ status: string }>
) {
  if (req.method === "POST") {
    const { body } = req;
    const { logo, secId } = body;

    if (logo) {
      const currentAssets = fs.readFileSync(
        "./public/assets/gameAssets.json",
        "utf8"
      );
      const gameAssets = JSON.parse(currentAssets) as GameAssets;
      gameAssets.logo = logo;
      fs.writeFileSync(
        "./public/assets/gameAssets.json",
        JSON.stringify(gameAssets, null, 4)
      );

      res.status(200).json({ status: "success" });
    } else {
      res.status(400).json({ status: "Missing body data" });
    }
  } else {
    res.status(405).json({ status: "Method not allowed" });
  }
}
