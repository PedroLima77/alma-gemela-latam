export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { nombre, signo, deseo } = req.body;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `Eres un oráculo de amor. Responde SOLO con JSON válido, sin texto adicional, sin markdown.

Para: ${nombre}, signo ${signo}, deseo: ${deseo || 'amor verdadero'}

Devuelve exactamente este JSON:
{"desc":"descripcion poetica del alma gemela 70 palabras","h1":"historia 1 como se conocen 55 palabras","h2":"historia 2 alternativa 55 palabras","r1n":"nombre ritual 1","r1d":"instrucciones ritual 1 en 35 palabras","r1e":"emoji","r2n":"nombre ritual 2","r2d":"instrucciones ritual 2 en 35 palabras","r2e":"emoji","r3n":"nombre ritual 3","r3d":"instrucciones ritual 3 en 35 palabras","r3e":"emoji","fin":"mensaje esperanzador para ${nombre} 30 palabras"}`
        }]
      })
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });

    const text = data.content?.[0]?.text || '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return res.status(500).json({ error: 'Invalid response' });

    const parsed = JSON.parse(match[0]);
    res.status(200).json(parsed);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
