// Appelé chaque jour par Vercel (voir vercel.json) : une petite lecture de la table des pièces
// pour que la base Supabase (offre gratuite) ne se mette pas en pause après 7 jours sans activité.
// La clé « publishable » est publique par nature (elle est aussi dans le site).
export default async function handler(req, res) {
  try {
    const r = await fetch(
      "https://ficpgpduwkgdqcfgjtdi.supabase.co/rest/v1/pieces?select=slug&limit=1",
      { headers: { apikey: "sb_publishable_D7hHj4K2Y1bVn2hIHA8HAA__ZcT0sPk" } }
    );
    res.status(r.ok ? 200 : 502).json({ ok: r.ok, supabase: r.status, at: new Date().toISOString() });
  } catch (e) {
    res.status(502).json({ ok: false, error: String(e) });
  }
}
