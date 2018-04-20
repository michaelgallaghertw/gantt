<template>
    <g>
        <rect class="grid-row" x="0" :width="sizing.grid_width" :height="height"
              v-for="(row, row_index) in rowcount" :y="y(row_index)"/>
        <rect class="row-line" x1="0" :x2="sizing.grid_width" v-for="(row, row_index) in rowcount"
              :y1="y(row_index) + height" :y2="y(row_index) + height"/>
    </g>
</template>
<script>
    export default {
        props: ['rowcount', 'sizing'],
        computed: {
            height: vm => vm.sizing.bar_height + vm.sizing.padding,
            y: vm => row_index => vm.sizing.header_height + (vm.sizing.padding / 2) +
                (row_index * (vm.sizing.bar_height + vm.sizing.padding)),
        }
    };
</script>
<style lang="scss">
    @import 'gantt_colors';

    .gantt {
        .grid-row {
            fill: #ffffff;
        }
        .grid-row:nth-child(even) {
            fill: $light-bg;
        }
        .row-line {
            stroke: $light-border-color;
        }
    }
</style>