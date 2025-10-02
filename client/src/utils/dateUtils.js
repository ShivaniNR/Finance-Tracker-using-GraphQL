import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

export function calculateDateRange(rangeKey) {
    const now = new Date();
    let startDate, endDate;

    switch (rangeKey) {
        case 'last':
            startDate = startOfMonth(subMonths(now, 1));
            endDate = endOfMonth(subMonths(now, 1));
            break;
        case 'last3':
            startDate = startOfMonth(subMonths(now, 2));
            endDate = endOfMonth(now);
            break;
        case 'last6':
            startDate = startOfMonth(subMonths(now, 5));
            endDate = endOfMonth(now);
            break;
        case 'current':
        default:
            startDate = startOfMonth(now);
            endDate = endOfMonth(now);
    }

    return { startDate, endDate };
}