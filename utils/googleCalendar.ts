import { CalendarEvent } from '../types';

export const fetchGoogleCalendarEvents = async (apiKey: string, calendarId: string, accessToken?: string): Promise<CalendarEvent[]> => {
    try {
        const timeMin = new Date();
        timeMin.setDate(timeMin.getDate() - 30); // Last 30 days
        const timeMinStr = timeMin.toISOString();

        const timeMax = new Date();
        timeMax.setMonth(timeMax.getMonth() + 6); // Next 6 months
        const timeMaxStr = timeMax.toISOString();

        let url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?singleEvents=true&orderBy=startTime&maxResults=50&timeMin=${timeMinStr}&timeMax=${timeMaxStr}&_t=${Date.now()}`;

        // Add timeMax to avoid fetching too far into the future if limit is high, but for now just increasing limit.
        // Let's rely on limit + maybe a localized timeMax if needed later.

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

        console.log(`Fetched ${data.items ? data.items.length : 0} events from Google Calendar.`);
        if (data.items && data.items.length > 0) {
            console.log('Last fetched event start:', data.items[data.items.length - 1].start.dateTime || data.items[data.items.length - 1].start.date);
        }

        return (data.items || []).map((item: any) => {
            const colorId = item.colorId || '9'; // Default to blue (9)
            const color = mapGoogleIdToColor(colorId);

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
                color: color,
                source: 'google' as const,
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
            colorId: event.color ? mapColorToGoogleId(event.color) : undefined,
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (response.status === 401) {
            throw new Error('Unauthorized');
        }

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

export const updateGoogleCalendarEvent = async (event: CalendarEvent, calendarId: string, accessToken: string) => {
    try {
        const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${event.id}`;

        const body = {
            summary: event.title,
            description: event.description,
            start: {
                dateTime: event.start.toISOString(),
            },
            end: {
                dateTime: event.end?.toISOString() || new Date(event.start.getTime() + 60 * 60 * 1000).toISOString(),
            },
            colorId: event.color ? mapColorToGoogleId(event.color) : undefined,
        };

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (response.status === 401) {
            throw new Error('Unauthorized');
        }

        const data = await response.json();

        if (data.error) {
            console.error('Error updating Google Calendar event:', data.error);
            throw new Error(data.error.message);
        }

        return data;
    } catch (error) {
        console.error('Failed to update event:', error);
        throw error;
    }
};

export const deleteGoogleCalendarEvent = async (eventId: string, calendarId: string, accessToken: string) => {
    try {
        const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`;

        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (response.status === 401) {
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            const data = await response.json();
            console.error('Error deleting Google Calendar event:', data.error);
            throw new Error(data.error?.message || 'Failed to delete event');
        }

        return true;
    } catch (error) {
        console.error('Failed to delete event:', error);
        throw error;
    }
};

const mapColorToGoogleId = (color: string): string => {
    // Basic mapping based on Google Calendar standard colors
    // https://lukeboyle.com/blog/posts/google-calendar-api-color-id
    const colorMap: Record<string, string> = {
        'red': '11',      // Tomato
        'blue': '9',      // Blueberry
        'green': '10',    // Basil
        'yellow': '5',    // Banana
        'purple': '3',    // Grape
        'gray': '8',      // Graphite
    };

    return colorMap[color] || '9'; // Default to blue
};

const mapGoogleIdToColor = (googleId: string): 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'gray' => {
    // Reverse mapping
    const idMap: Record<string, 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'gray'> = {
        '11': 'red',
        '9': 'blue',
        '10': 'green',
        '5': 'yellow',
        '3': 'purple',
        '8': 'gray',
    };

    return idMap[googleId] || 'blue'; // Default to blue if unknown
};
