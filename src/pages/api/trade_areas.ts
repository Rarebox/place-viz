// pages/api/trade_areas.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { page } = req.query;
  const pageParam = Array.isArray(page) ? page[0] : page;

  // ✅ Güvenli dosya adı kontrolü: sadece "1", "2a", "12b" gibi değerler geçerli
  const isValidPage = typeof pageParam === 'string' && /^[0-9]{1,2}[ab]?$/.test(pageParam);
  const safePageName = isValidPage ? pageParam : '1a';

  const filePath = path.join(process.cwd(), 'src/data', `page_${safePageName}.json`);

  try {
    const rawData = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(rawData);

    // 🔁 polygon'u geometry'ye dönüştür
    const features = parsed.features.map((f: any) => ({
      type: 'Feature',
      geometry: JSON.parse(f.polygon),
      properties: {
        pid: f.pid,
        trade_area: f.trade_area,
      },
    }));

    res.status(200).json({
      type: 'FeatureCollection',
      features,
    });
  } catch (error) {
    console.error('Error loading file:', filePath, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
