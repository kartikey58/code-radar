export default async function handler(req, res) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioNumber = process.env.TWILIO_WHATSAPP_NUMBER; // e.g., whatsapp:+14155238886
  const toNumber = process.env.TWILIO_TO_NUMBER; // e.g., whatsapp:+919876543210
  
  const clistUser = process.env.VITE_CLIST_USER;
  const clistKey = process.env.VITE_CLIST_KEY;

  if (!accountSid || !authToken || !twilioNumber || !toNumber) {
    return res.status(400).json({ error: 'Twilio WhatsApp credentials missing. Please configure them in Vercel.' });
  }

  try {
    const now = new Date();
    const lookaheadTime = new Date(now.getTime() + 35 * 60000);
    const messages = [];

    // 1. Fetch Codeforces
    const cfRes = await fetch('https://codeforces.com/api/contest.list');
    const cfData = await cfRes.json();
    if (cfData.status === 'OK') {
      const upcoming = cfData.result.filter(c => c.phase === 'BEFORE');
      for (const c of upcoming) {
        const startTime = new Date(c.startTimeSeconds * 1000);
        if (startTime > now && startTime <= lookaheadTime) {
          messages.push(`🚀 *Codeforces Reminder*\n\n${c.name} is starting in less than 30 minutes! Get ready!`);
        }
      }
    }

    // 2. Fetch Clist for LeetCode, CodeChef, AtCoder
    if (clistUser && clistKey) {
      const nowStr = now.toISOString().split('.')[0];
      const lookaheadStr = lookaheadTime.toISOString().split('.')[0];
      
      const url = `https://clist.by/api/v1/contest/?limit=20&start__gt=${encodeURIComponent(nowStr)}&start__lte=${encodeURIComponent(lookaheadStr)}&resource__id__in=2,73,93`;
      
      const clistRes = await fetch(url, {
        headers: { 'Authorization': `ApiKey ${clistUser}:${clistKey}` }
      });

      if (clistRes.ok) {
        const clistData = await clistRes.json();
        for (const c of clistData.objects) {
          let platformName = "Contest";
          if (c.resource.id === 2) platformName = "CodeChef";
          if (c.resource.id === 73) platformName = "LeetCode";
          if (c.resource.id === 93) platformName = "AtCoder";

          messages.push(`🚀 *${platformName} Reminder*\n\n${c.event} is starting in less than 30 minutes! Get ready!\nLink: ${c.href}`);
        }
      }
    }

    // 3. Send WhatsApp Messages via Twilio
    let sentCount = 0;
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    for (const msg of messages) {
      const bodyParams = new URLSearchParams();
      bodyParams.append('From', twilioNumber);
      bodyParams.append('To', toNumber);
      bodyParams.append('Body', msg);

      const twilioRes = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: bodyParams
      });

      if (twilioRes.ok) {
        sentCount++;
      } else {
        console.error('Twilio Error:', await twilioRes.text());
      }
    }

    res.status(200).json({ success: true, contestsFound: messages.length, messagesSent: sentCount, logs: messages });
  } catch (err) {
    console.error('Cron Error:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
}
