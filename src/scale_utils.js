import { add, start_of, clone, get_days_in_month, format, diff } from './date_utils';

function* scale_generator(start, end, step, unit = 'hour') {
    var cur_date = clone(start);
    while (cur_date < end) {
        yield (cur_date = add(cur_date, step, unit));
    }
}

export default {
    'Quarter Day': {
        step: 24 / 4,
        column_width: 38,
        pad_start: start => add(start, -7, 'day'),
        pad_end: end => add(end, 7, 'day'),
        ticks: (start, end) => [start, ...scale_generator(start, end, 24 / 4)],
        tick_width_multiplier: () => 1,
        thick_tick: () => false,
        tick_lower: date => format(date, 'HH'),
        tick_upper: (date, last_date) =>
            date.getDate() !== last_date.getDate() ? format(date, 'D MMM') : '',
        tick_lower_multiplier: 4,
        tick_upper_multiplier: 0,
        offset_x: (datea, dateb) => diff(datea, dateb, 'hour') / (24 / 4) * 38,
    },
    'Half Day': {
        step: 24 / 2,
        column_width: 38,
        pad_start: start => add(start, -7, 'day'),
        pad_end: end => add(end, 7, 'day'),
        ticks: (start, end) => [start, ...scale_generator(start, end, 24 / 2)],
        tick_width_multiplier: () => 1,
        thick_tick: () => false,
        tick_lower: date => format(date, 'HH'),
        tick_upper: (date, last_date) =>
            date.getDate() !== last_date.getDate()
                ? date.getMonth() !== last_date.getMonth()
                  ? format(date, 'D MMM')
                  : format(date, 'D')
                : '',
        tick_lower_multiplier: 2,
        tick_upper_multiplier: 0,
        offset_x: (datea, dateb) => diff(datea, dateb, 'hour') / (24 / 2) * 38,
    },
    Day: {
        step: 24,
        column_width: 38,
        pad_start: start => add(start, -1, 'month'),
        pad_end: end => add(end, 1, 'month'),
        ticks: (start, end) => [start, ...scale_generator(start, end, 24)],
        tick_width_multiplier: () => 1,
        thick_tick: tick => tick.getDate() === 1,
        tick_lower: (date, last_date) =>
            date.getDate() !== last_date.getDate() ? format(date, 'D') : '',
        tick_upper: (date, last_date) =>
            date.getMonth() !== last_date.getMonth() ? format(date, 'MMMM') : '',
        tick_lower_multiplier: 1,
        tick_upper_multiplier: 30,
        offset_x: (datea, dateb) => diff(datea, dateb, 'hour') / 24 * 38,
    },
    Week: {
        step: 24 * 7,
        column_width: 140,
        pad_start: start => add(start, -1, 'month'),
        pad_end: end => add(end, 1, 'month'),
        ticks: (start, end) => [start, ...scale_generator(start, end, 24 * 7)],
        tick_width_multiplier: () => 1,
        thick_tick: tick => tick.getDate() >= 1 && tick.getDate() < 8,
        tick_lower: (date, last_date) =>
            date.getMonth() !== last_date.getMonth()
                ? format(date, 'D MMM')
                : format(date, 'D'),
        tick_upper: (date, last_date) =>
            date.getMonth() !== last_date.getMonth() ? format(date, 'MMMM') : '',
        tick_lower_multiplier: 0,
        tick_upper_multiplier: 4,
        offset_x: (datea, dateb) => diff(datea, dateb, 'hour') / (24 / 4) * 140,
    },
    Month: {
        step: 24 * 30,
        column_width: 120,
        pad_start: start => start_of(start, 'year'),
        pad_end: end => add(end, 1, 'year'),
        ticks: (start, end) => [start, ...scale_generator(start, end, 1, 'month')],
        tick_width_multiplier: tick => get_days_in_month(tick) / 30,
        thick_tick: tick => (tick.getMonth() + 1) % 3 === 0,
        tick_lower: date => format(date, 'MMMM'),
        tick_upper: (date, last_date) =>
            date.getFullYear() !== last_date.getFullYear() ? format(date, 'YYYY') : '',
        tick_lower_multiplier: 1,
        tick_upper_multiplier: 12,
        offset_x: (datea, dateb) => diff(datea, dateb, 'day') / 30 * 120,
    }
};
