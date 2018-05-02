<template>
    <g :class="['bar-wrapper', task.custom_class]" :data-id="task.id" @mousedown="drag">
        <g class="bar-group">
            <rect class="bar" v-bind="{ x, y, width, height, rx: bar_corner_radius, ry: bar_corner_radius}"/>
            <rect class="bar-progress" v-bind="{ x, y, width: progress_width, height, rx: bar_corner_radius, ry: bar_corner_radius}"/>
            <text :class="['bar-label', { big: big_label }]" :x="text_x" :y="y + height / 2">{{ task.name }}</text>
        </g>
        <g class="handle-group">
            <rect class="handle right" @mousedown="resize_right"
                  v-bind="{
                       x: x + width - (handle_width + 1),
                       y: y + 1,
                       width: handle_width,
                       height: height - 2,
                       rx: bar_corner_radius,
                       ry: bar_corner_radius}"/>
            <rect class="handle left" @mousedown="resize_left"
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
    import { diff, add } from './date_utils';

    export default {
        props: ['task', 'index', 'sizing', 'scale', 'start', 'dragging'],
        data() {
            return {
                bar_corner_radius: 3,
                handle_width: 8,
                big_label: false,
                ex: 0,
                ey: 0,
                drag_action: null,
            };
        },
        computed: {
            x: vm => vm.task.changes.x || vm.task.x,
            y: vm => vm.task.y,
            width: vm => vm.task.changes.width || vm.task.width,
            height: vm => vm.sizing.bar_height,
            progress_width: vm => vm.width * (vm.task.progress / 100) || 0,
            text_x: vm => vm.big_label ? vm.x + vm.width + 5 : vm.x + vm.width / 2,
        },
        methods: {
            check_label() {
                this.$nextTick(() => {
                    const label = this.$el.querySelector('.bar-label');
                    this.big_label = label.getBBox().width > this.width;
                });
            },
            resize_right() { this.drag_action = 'right'; },
            resize_left() { this.drag_action = 'left'; },
            // event bubbles, so need to ensure we don't overwrite a resize action
            drag() { this.drag_action = this.drag_action || 'move'; },
            get_snap_position(dx) {
                const column_divisor = Math.ceil(this.scale.step / 24);
                const day_width = this.sizing.column_width / column_divisor;
                return Math.round(dx / day_width) * day_width;
            }
        },
        watch: {
            dragging(val) {
                if (this.drag_action) {
                    if (val) {
                        const finaldx = this.get_snap_position(val.dx);
                        let { id, x, width } = this.task;
                        if (['left', 'move'].includes(this.drag_action)) {
                            x = this.task.x + finaldx;
                        }
                        if (this.drag_action === 'left') {
                            width = this.task.width - finaldx;
                        }
                        if (this.drag_action === 'right') {
                            width = this.task.width + finaldx;
                        }
                        this.$emit('change', { id, x, width });
                    }
                    else {
                        const start = this.scale.offset_to_date(this.start, this.x);
                        // End date always gets 24 hours added on in the display, so need to remove it here
                        const end = add(this.scale.offset_to_date(this.start, this.x + this.width), -24, 'hour');
                        this.drag_action = null;
                        this.$emit('persist', { id: this.task.id, start, end });
                    }
                }
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