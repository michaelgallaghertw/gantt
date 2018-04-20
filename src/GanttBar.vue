<template>
    <g :class="['bar-wrapper', task.custom_class]" :data-id="task.id">
        <g class="bar-group">
            <rect class="bar" v-bind="{ x, y, width, height, rx: bar_corner_radius, ry: bar_corner_radius}"/>
            <rect class="bar-progress" v-bind="{ x, y, width: progress_width, height, rx: bar_corner_radius, ry: bar_corner_radius}"/>
            <text :class="['bar-label', { big: big_label }]" :x="text_x" :y="y + height / 2">{{ task.name }}</text>
        </g>
        <g class="handle-group">
            <rect class="handle right"
                  v-bind="{
                       x: x + width - (handle_width + 1),
                       y: y + 1,
                       width: handle_width,
                       height: height - 2,
                       rx: bar_corner_radius,
                       ry: bar_corner_radius}"/>
            <rect class="handle left"
                  v-bind="{
                        x: x + 1,
                        y: y + 1,
                        width: handle_width,
                        height: height - 2,
                        rx: bar_corner_radius,
                        ry: bar_corner_radius}"/>
        </g>
    </g>
</template>
<script>
    import { diff } from './date_utils';

    export default {
        props: ['task', 'index', 'sizing', 'scale', 'start'],
        data() {
            return {
                bar_corner_radius: 3,
                handle_width: 8,
                big_label: false,
            };
        },
        computed: {
            x: vm => vm.scale.offset_x(vm.task.start, vm.start),
            y: vm => vm.sizing.header_height + vm.sizing.padding +
                vm.index * (vm.height + vm.sizing.padding),
            duration: vm => (diff(vm.task.end, vm.task.start, 'hour') + 24) / vm.scale.step,
            width: vm => vm.sizing.column_width * vm.duration,
            height: vm => vm.sizing.bar_height,
            progress_width: vm => vm.sizing.column_width * vm.duration * (vm.task.progress / 100) || 0,
            text_x: vm => vm.big_label ? vm.x + vm.width + 5 : vm.x + vm.width / 2,
        },
        methods: {
            check_label() {
                this.$nextTick(() => {
                    const label = this.$el.querySelector('.bar-label');
                    this.big_label = label.getBBox().width > this.width;
                });
            }
        },
        mounted() { this.check_label(); },
        updated() { this.check_label(); },
    }
</script>
<style lang="scss">
    @import 'gantt_colors';

    .gantt {
        .bar {
            fill: $bar-color;
            stroke: $bar-stroke;
            stroke-width: 0;
            transition: stroke-width .3s ease;
            user-select: none;
        }
        .bar-progress {
            fill: $blue;
        }
        .bar-label {
            fill: #fff;
            dominant-baseline: central;
            text-anchor: middle;
            font-size: 12px;
            font-weight: lighter;

            &.big {
                fill: $text-light;
                text-anchor: start;
            }
        }

        .handle {
            fill: $handle-color;
            cursor: ew-resize;
            opacity: 0;
            visibility: hidden;
            transition: opacity .3s ease;
        }

        .bar-wrapper {
            cursor: pointer;

            &:hover {
                .bar {
                    fill: darken($bar-color, 5);
                }

                .bar-progress {
                    fill: darken($blue, 5);
                }

                .handle {
                    visibility: visible;
                    opacity: 1;
                }
            }

            &.active {
                .bar {
                    fill: darken($bar-color, 5);
                }

                .bar-progress {
                    fill: darken($blue, 5);
                }
            }
        }
    }

</style>