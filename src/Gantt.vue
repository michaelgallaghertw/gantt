<template>
    <div class="gantt-container">
        <svg class="gantt" :width="grid_width" :height="grid_height">
            <g class="grid">
                <rect class="grid-background" x="0" y="0" :width="grid_width" :height="grid_height"/>
                <GanttGridRows v-bind="{ rowcount, sizing }"/>
                <rect class="grid-header" x="0" y="0" :width="grid_width" :height="header_height + 10"/>
                <GanttGridColumns v-bind="{ ticks, view_mode, sizing, scale, start }"/>
            </g>
            <g class="date">
                <GanttTick v-for="(tick, index) in ticks"
                    v-bind="{ tick, index, sizing, scale }"
                    :last_tick="index > 0 ? ticks[index - 1] : new Date(0)"/>
            </g>
            <g class="arrow">

            </g>
            <g class="progress">

            </g>
            <g class="bar">
                <GanttBar v-for="(task, index) in tasks" :key="task.id" v-bind="{ task, index, sizing, scale, start }"/>
            </g>
        </svg>
    </div>
</template>
<script>
    import { diff } from './date_utils';
    import scales from './scale_utils';
    import GanttGridRows from './GanttGridRows.vue';
    import GanttGridColumns from './GanttGridColumns.vue';
    import GanttTick from './GanttTick.vue';
    import GanttBar from './GanttBar.vue';

    export default {
        props: ['tasks'],
        components: { GanttGridColumns, GanttGridRows, GanttTick, GanttBar },
        data() {
            return {
                header_height: 50,
                bar_height: 20,
                padding: 18,
                view_mode: 'Day',
            };
        },
        computed: {
            rowcount: vm => vm.tasks.length,
            grid_height: vm => vm.header_height + vm.padding +
                (vm.bar_height + vm.padding) * vm.rowcount,

            scale: vm => ({ ...scales[vm.view_mode] }),

            raw_start: vm => vm.tasks.map(t => t.start).reduce((earliest, start) => (start < earliest ? start : earliest)),
            raw_end: vm => vm.tasks.map(t => t.end).reduce((latest, end) => (end > latest ? end : latest)),
            start: vm => vm.scale.pad_start(vm.raw_start),
            end: vm => vm.scale.pad_end(vm.raw_end),
            ticks: vm => vm.scale.ticks(vm.start, vm.end),
            grid_width: vm => vm.ticks.length * vm.scale.column_width,

            sizing: vm => ({
                bar_height: vm.bar_height,
                padding: vm.padding,
                column_width: vm.scale.column_width,
                header_height: vm.header_height,
                grid_width: vm.grid_width,
                grid_height: vm.grid_height,
            }),
        },
        methods: {
            horizontal_scroll() {
                const hours_before_first_task = diff(this.raw_start, this.start, 'hour');
                const scroll_pos = ((hours_before_first_task / this.scale.step) * this.scale.column_width) - this.scale.column_width;
                this.$el.scrollLeft = scroll_pos;
            }
        },
        mounted() { this.horizontal_scroll(); },
    }
</script>
<style lang="scss">
    @import 'gantt_colors';

    .gantt {
        .grid-background {
            fill: none;
        }
        .grid-header {
            fill: #ffffff;
            stroke: $border-color;
            stroke-width: 1.4;
        }

        .hide {
            display: none;
        }
    }

    .gantt-container {
        position: relative;
        overflow: auto;
        font-size: 12px;

        text-rendering: optimizeLegibility !important;
        line-height: 1.5em;
        -moz-osx-font-smoothing: grayscale;
        -webkit-font-smoothing: antialiased;
    }
</style>