import Vue from 'vue';
import 'regenerator-runtime/runtime'; // generator function polyfill
import GanttVue from './Gantt.vue';

export default function(el, tasks) {
    Vue.config.devtools = true;

    const GanttVueComponent = Vue.component('gantt', GanttVue);
    new GanttVueComponent({ el, propsData: { tasks } });
};