'use strict';
Vue.component('aa-inspector', {
  template: `
    <ui-prop v-prop="target.test2"></ui-prop>
	<div v-if="target.test2.value === 1">
		<ui-prop v-prop="target.test1"></ui-prop>
	</div>
  `,

  props: {
    target: {
      twoWay: true,
      type: Object,
    },
  },
});




