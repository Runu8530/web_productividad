import { CalendarEvent } from '../types';

export const fetchGoogleCalendarEvents = async (apiKey: string, calendarId: string): Promise<CalendarEvent[]> => {
    try {
        const timeMin = new Date().toISOString();
        const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?key=${apiKey}&timeMin=${timeMin}&singleEvents=true&orderBy=startTime&maxResults=100`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error('Google Calendar API Error:', data.error);
            return [];
        }

        return (data.items || []).map((item: any) => {
            // Map Google Calendar colors to our app colors (simplified mapping)
            // Google colors are strings like "1", "2", etc. We'll just randomize or default for now, 
            // or map specific IDs if we knew them. Defaulting to 'blue' or based on some hash.
            const colors: ('red' | 'blue' | 'green' | 'yellow' | 'purple' | 'gray')[] = ['red', 'blue', 'green', 'yellow', 'purple', 'gray'];
            const colorIndex = item.colorId ? parseInt(item.colorId) % colors.length : 0;

            return {
                id: item.id,
                title: item.summary || 'No Title',
                description: item.description || '',
                date: item.start.date || (item.start.dateTime ? item.start.dateTime.split('T')[0] : new Date().toISOString().split('T')[0]),
                color: colors[colorIndex],
                // Store original start/end for potential future use, though our app currently just uses 'date'
            };
        });
    } catch (error) {
        console.error('Failed to fetch Google Calendar events:', error);
        return [];
    }
};
