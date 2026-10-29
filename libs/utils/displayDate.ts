import moment from 'moment';
import { DISPLAY_UTC_OFFSET_MIN } from '../config';

/** Sanani DISPLAY_TIMEZONE da formatlaydi — SSR (UTC) va brauzer bir xil matn chizadi. */
export const formatDisplayDate = (date: Date | string | undefined, format: string): string =>
	date ? moment(date).utcOffset(DISPLAY_UTC_OFFSET_MIN).format(format) : '';
