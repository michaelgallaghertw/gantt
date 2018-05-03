<template>
    <path :d="path" :data-from="link.from.id" :data-to="link.to.id"/>
</template>
<script>
    export default {
        props: ['link', 'sizing'],
        data() {
            return {
                arrow_curve: 5,
            };
        },
        computed: {
            tx: (vm) => vm.link.to.changes.x || vm.link.to.x,
            fx: (vm) => vm.link.from.changes.x || vm.link.from.x,
            fw: (vm) => vm.link.from.changes.width || vm.link.from.width,

            ideal_sx: (vm) => vm.tx - vm.sizing.padding,
            sx() {
                const furthest_left = this.fx + this.sizing.padding;
                const furthest_right = this.fx + this.fw - this.sizing.padding;
                return Math.min(Math.max(this.ideal_sx, furthest_left), furthest_right);
            },
            sy: (vm) => vm.sizing.bar_height + vm.link.from.y,
            ex: (vm) => vm.tx - (vm.sizing.padding / 2),
            ey: (vm) => (vm.sizing.bar_height / 2) + vm.link.to.y,

            upwards: (vm) => vm.link.from.y > vm.link.to.y,
            clockwise: (vm) =>  vm.upwards ? 1 : 0,
            curve_y: (vm) => vm.upwards ? -vm.arrow_curve : vm.arrow_curve,

            down_1: (vm) => vm.sizing.padding / 2 - vm.arrow_curve,
            down_2: (vm) => vm.link.to.y + (vm.sizing.bar_height / 2) - vm.curve_y,

            /**
             * If the to bar is more left than the from bar, we need
             * an extra 2 curves in the path.
             */
            down_to_target: (vm) => vm.tx < (vm.fx + vm.sizing.padding) ?
                `v ${vm.down_1}
                ${vm.arc(true, true, false)}
                H ${vm.ideal_sx}
                ${vm.arc(vm.clockwise, true, vm.clockwise)}
                V ${vm.down_2}` : `V ${vm.ey - vm.curve_y}`,

            path: (vm) => `M ${vm.sx} ${vm.sy}
                            ${vm.down_to_target}
                            ${vm.arc(vm.clockwise, false, vm.clockwise)}
                            L ${vm.ex} ${vm.ey}
                            m -5 -5
                            l 5 5
                            l -5 5`,

        },
        methods: {
            /**
             * Draw an SVG Elliptical Arc
             * http://xahlee.info/js/svg_path_ellipse_arc.html
             */
            arc(sweep, left, higher) {
                const ac = this.arrow_curve;
                return `a ${ac} ${ac} 0 0 ${sweep ? 1 : 0} ${ac * (left ? -1 : 1)} ${ac * (higher ? -1 : 1)}`;
            }
        }
    }
</script>