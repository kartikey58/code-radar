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

  // Handle sending a single specific contest via POST
  if (req.method === 'POST') {
    try {
      // Helper to parse request body stream in Node.js raw serverless environment
      const getRawBody = async (readable) => {
        const chunks = [];
        for await (const chunk of readable) {
          chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
        }
        return Buffer.concat(chunks).toString('utf8');
      };

      let body = req.body;
      if (!body) {
        const raw = await getRawBody(req);
        if (raw) {
          try {
            body = JSON.parse(raw);
          } catch (e) {
            body = raw;
          }
        }
      }

      if (typeof body === 'string') {
        body = JSON.parse(body);
      }
      
      const { name, platform, startTime, url } = body || {};
      if (!name || !platform || !startTime || !url) {
        return res.status(400).json({ error: 'Missing contest details (name, platform, startTime, url) in request body.' });
      }

      // Format start time in IST (+05:30)
      const formattedStart = new Date(startTime).toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'medium',
        timeStyle: 'short'
      });

      const msg = `🚀 *${platform} Contest Details*\n\n🏆 *${name}*\n📅 Starts: *${formattedStart} (IST)*\n🔗 Link: ${url}`;
      
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

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
        return res.status(200).json({ success: true, messageSent: 1, logs: [msg] });
      } else {
        const twilioErr = await twilioRes.text();
        console.error('Twilio Error:', twilioErr);
        return res.status(500).json({ error: 'Twilio failed to send message.', details: twilioErr });
      }
    } catch (err) {
      console.error('Single Send Error:', err);
      return res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
  }

  try {
    const { hours } = req.query;
    const lookaheadHours = hours ? parseFloat(hours) : 24; // Default to 24 hours for daily cron digest
    
    const now = new Date();
    const lookaheadTime = new Date(now.getTime() + lookaheadHours * 60 * 60000);
    const messages = [];

    // 1. Fetch Clist for LeetCode (102), CodeChef (2), and Codeforces (1)
    if (clistUser && clistKey) {
      const nowStr = now.toISOString().split('.')[0];
      const lookaheadStr = lookaheadTime.toISOString().split('.')[0];
      
      // resource__id__in=1 (Codeforces), 2 (CodeChef), 102 (LeetCode)
      const url = `https://clist.by/api/v1/contest/?limit=20&start__gt=${encodeURIComponent(nowStr)}&start__lte=${encodeURIComponent(lookaheadStr)}&resource__id__in=1,2,102`;
      
      const clistRes = await fetch(url, {
        headers: { 'Authorization': `ApiKey ${clistUser}:${clistKey}` }
      });

      if (clistRes.ok) {
        const clistData = await clistRes.json();
        for (const c of clistData.objects) {
          const resourceId = c.resource.id || c.resource_id;
          let platformName = "Platform";
          if (resourceId === 1) platformName = "Codeforces";
          else if (resourceId === 2) platformName = "CodeChef";
          else if (resourceId === 102) platformName = "LeetCode";

          // Format start time in IST (+05:30)
          const formattedStart = new Date(c.start).toLocaleString('en-US', {
            timeZone: 'Asia/Kolkata',
            dateStyle: 'medium',
            timeStyle: 'short'
          });

          const timeMsg = lookaheadHours <= 1
            ? "is starting in less than 30 minutes! Get ready!"
            : `starts on *${formattedStart} (IST)*!`;

          messages.push(`🚀 *${platformName} Reminder*\n\n${c.event} ${timeMsg}\nLink: ${c.href}`);
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
