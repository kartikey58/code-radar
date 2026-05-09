import { addSeconds } from 'date-fns';
import type { Contest } from './contests';

export async function createGoogleCalendarEvent(accessToken: string, contest: Contest, reminderMinutes: number) {
  const endTime = addSeconds(contest.startTime, contest.durationSeconds);
  
  const event = {
    summary: `[${contest.platform}] ${contest.name}`,
    description: `Contest Link: ${contest.url}`,
    start: {
      dateTime: contest.startTime.toISOString(),
    },
    end: {
      dateTime: endTime.toISOString(),
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: reminderMinutes },
      ],
    },
    source: {
      title: contest.platform,
      url: contest.url
    }
  };

  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    throw new Error('Failed to create event: ' + await response.text());
  }

  return await response.json();
}
