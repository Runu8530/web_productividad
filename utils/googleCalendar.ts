import { CalendarEvent } from '../types';

export const fetchGoogleCalendarEvents = async (apiKey: string, calendarId: string, accessToken?: string): Promise<CalendarEvent[]> => {
    try {
        const timeMin = new Date().toISOString();
        let url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?singleEvents=true&orderBy=startTime&maxResults=100&timeMin=${timeMin}`;

        const headers: HeadersInit = {};
        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        } else {
            url += `&key=${apiKey}`;
        }

        const response = await fetch(url, { headers });
        const data = await response.json();

        if (data.error) {
            console.error('Google Calendar API Error:', data.error);
            return [];
        }

        return (data.items || []).map((item: any) => {
            const colors: ('red' | 'blue' | 'green' | 'yellow' | 'purple' | 'gray')[] = ['red', 'blue', 'green', 'yellow', 'purple', 'gray'];
            const colorIndex = item.colorId ? parseInt(item.colorId) % colors.length : 0;

            // Handle both date (all-day) and dateTime (timed)
            const start = item.start.dateTime ? new Date(item.start.dateTime) : new Date(item.start.date);
            const end = item.end.dateTime ? new Date(item.end.dateTime) : new Date(item.end.date);

            return {
                id: item.id,
                title: item.summary || 'No Title',
                description: item.description || '',
                start: start,
                end: end,
                date: item.start.date || item.start.dateTime?.split('T')[0], // Keep for compatibility if needed, but start/end are preferred
                color: colors[colorIndex],
            };
        });
    } catch (error) {
        console.error('Failed to fetch Google Calendar events:', error);
        return [];
    }
};

export const createGoogleCalendarEvent = async (event: CalendarEvent, calendarId: string, accessToken: string) => {
    try {
        const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`;

        const body = {
            summary: event.title,
            description: event.description,
            start: {
                dateTime: event.start.toISOString(),
            },
            end: {
                dateTime: event.end?.toISOString() || new Date(event.start.getTime() + 60 * 60 * 1000).toISOString(),
            },
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (data.error) {
            console.error('Error creating Google Calendar event:', data.error);
            throw new Error(data.error.message);
        }

        return data;
    } catch (error) {
        console.error('Failed to create event:', error);
        throw error;
    }
};
