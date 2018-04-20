import Vue from 'vue';
import 'regenerator-runtime/runtime'; // generator function polyfill
import GanttVue from './Gantt.vue';

export default function(el, tasks) {
    const GanttVueComponent = Vue.component('gantt', GanttVue);
    new GanttVueComponent({ el, propsData: { tasks } });
};