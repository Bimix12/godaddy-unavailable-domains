export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { domains } = req.body;
  const chunks = [];
  for (let i = 0; i < domains.length; i += 500) {
    chunks.push(domains.slice(i, i + 500));
  }

  let unavailable = [];

  for (const chunk of chunks) {
    const godaddyRes = await fetch('https://api.godaddy.com/v1/domains/available', {
      method: 'POST',
      headers: {
        'Authorization': 'sso-key dLYuzkosMXb5_5w8r1GAw2ES94SwM4onm5a:5UDQgP3bPRc6EoijADcqic',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ domainNames: chunk, checkType: 'FAST' })
    });

    const data = await godaddyRes.json();
    const notAvailable = data.domains.filter(d => !d.available).map(d => d.domain);
    unavailable.push(...notAvailable);
  }

  res.status(200).json(unavailable);
}
