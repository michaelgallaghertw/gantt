<template>
    <g>
        <text class="lower-text" :x="lower_x" :y="lower_y">{{ lower_text }}</text>
        <text v-if="upper_text" class="upper-text" :x="upper_x" :y="upper_y">
            {{ upper_text }}
        </text>
    </g>
</template>
<script>
    export default {
        props: ['tick', 'last_tick', 'index', 'sizing', 'scale'],
        computed: {
            lower_x: vm => (vm.index * vm.sizing.column_width) + (vm.sizing.column_width * vm.scale.tick_lower_multiplier / 2),
            lower_y: vm => vm.sizing.header_height,
            lower_text: vm => vm.scale.tick_lower(vm.tick, vm.last_tick),

            upper_x: vm => (vm.index * vm.sizing.column_width) + (vm.sizing.column_width * vm.scale.tick_upper_multiplier / 2),
            upper_y: vm => vm.sizing.header_height - 25,
            upper_text: vm => vm.scale.tick_upper(vm.tick, vm.last_tick),
        }
    };
</script>
<style lang="scss">
    @import 'gantt_colors';

    .gantt {
        .lower-text, .upper-text {
            font-size: 12px;
            text-anchor: middle;
        }
        .upper-text {
            fill: $text-light;
        }
        .lower-text {
            fill: $text-color;
        }
    }
</style>