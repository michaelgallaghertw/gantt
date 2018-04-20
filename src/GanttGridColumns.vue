<template>
    <g>
        <!-- Ticks -->
        <path v-for="(tick, index) in ticks" :class="['tick', { thick: scale.thick_tick(tick) }]"
              :d="`M ${x(index)} ${y} v ${height}`"/>
        <!-- Today Highlight -->
        <rect v-if="view_mode === 'Day'" class="today-highlight" :x="today_x" y="0"
              :width="sizing.column_width" :height="highlight_height"/>
    </g>
</template>
<script>
    import { diff, today, add, format, now } from './date_utils';

    export default {
        props: ['ticks', 'view_mode', 'sizing', 'scale', 'start'],
        computed: {
            y: vm => vm.sizing.header_height + vm.sizing.padding / 2,
            width: vm => tick => vm.scale.tick_width_multiplier(tick) * vm.sizing.column_width,
            x: vm => index => vm.ticks.slice(0, index).map(vm.width).reduce((total, width) => total + width, 0),
            height: vm => vm.sizing.grid_height - (vm.sizing.header_height + vm.sizing.padding),
            highlight_height: vm => vm.sizing.grid_height - vm.sizing.padding + 10,

            today_x: vm => vm.scale.offset_x(today(), vm.start),
        }
    };
</script>
<style lang="scss">
    @import 'gantt_colors';

    .gantt {
        .tick {
            stroke: $border-color;
            stroke-width: 0.2;
            &.thick {
                stroke-width: 0.4;
            }
        }
        .today-highlight {
            fill: $light-yellow;
            opacity: 0.5;
        }
    }
</style>