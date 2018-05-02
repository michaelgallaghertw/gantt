<template>
    <div class="gantt-container" @mousedown="drag" @mousemove="move" @mouseup="release" @wheel="wheel">
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
                <GanttArrow v-for="link in links" :key="`${link.from.id}:${link.to.id}`"
                    v-bind="{ link, sizing }"/>
            </g>
            <g class="progress">

            </g>
            <g class="bar">
                <GanttBar v-for="(task, index) in positioned_tasks" :key="task.id"
                          v-bind="{ task, index, sizing, scale, start, dragging }"
                          @change="change" @persist="persist"/>
            </g>
        </svg>
    </div>
</template>
<script>
    import { throttle } from 'lodash-es';
    import Vue from 'vue';
    import { diff } from './date_utils';
    import scales from './scale_utils';
    import GanttGridRows from './GanttGridRows.vue';
    import GanttGridColumns from './GanttGridColumns.vue';
    import GanttTick from './GanttTick.vue';
    import GanttBar from './GanttBar.vue';
    import GanttArrow from './GanttArrow.vue';

    export default {
        props: ['tasks'],
        components: { GanttGridColumns, GanttGridRows, GanttTick, GanttBar, GanttArrow },
        data() {
            return {
                header_height: 50,
                bar_height: 20,
                padding: 18,
                view_mode: 'Day',
                changes: {},
                dragging: null,
            };
        },
        computed: {
            links: vm => vm.positioned_tasks.reduce((deps, task) => [
                ...deps,
                ...(task.dependencies || []).map((dep) => ({
                    to: task,
                    from: vm.positioned_tasks.find((ptask) => ptask.id === dep)
                }))
            ], []),
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

            positioned_tasks: vm => vm.tasks.map((task, index) => {
                const duration = (diff(task.end, task.start, 'hour') + 24) / vm.scale.step;
                return {
                    ...task,
                    x: vm.scale.offset_x(task.start, vm.start),
                    y: vm.header_height + vm.padding + (index * (vm.bar_height + vm.padding)),
                    duration,
                    width: vm.scale.column_width * duration,
                    changes: vm.changes[task.id] || {},
                };
            }),

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
            },
            change(data) {
                Vue.set(this.changes, data.id, data);
            },
            persist(changes) {
                const task = this.tasks.find((task) => task.id === changes.id);
                Object.assign(task, changes);
                delete this.changes[changes.id];
            },
            drag(e) {
                this.dragging = { ex: e.offsetX, ey: e.offsetY, dx: 0, dy: 0 };
            },
            move(e) {
                if (this.dragging) {
                    this.dragging = {
                        ...this.dragging,
                        dx: e.offsetX - this.dragging.ex,
                        dy: e.offsetY - this.dragging.ey,
                    };
                }
            },
            release() {
                this.dragging = null;
            },
            zoom: throttle(function(modifier) {
                const view_modes = Object.keys(scales);
                let index = view_modes.indexOf(this.view_mode) + modifier;
                index = Math.min(Math.max(0, index), view_modes.length - 1);
                this.view_mode = view_modes[index];
            }, 1000, { trailing: false }),
            wheel: function(e) {
                // More movement in the X axis than Y, defer to default behaviour
                if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                    return;
                }
                const modifier = e.deltaY > 0 ? 1 : -1;
                this.zoom(modifier);
                e.preventDefault();
            },
        },
        watch: {
            view_mode() {
                this.horizontal_scroll();
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
        .arrow {
            fill: none;
            stroke: $text-muted;
            stroke-width: 1.4;
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