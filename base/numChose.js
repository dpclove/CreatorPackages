'use strict';
Vue.component('aa-inspector', {
  template: `
	<ui-prop v-prop="target.add"></ui-prop>
	<ui-prop v-prop="target.sub"></ui-prop>
	<ui-prop v-prop="target.count"></ui-prop>
    <ui-prop v-prop="target.type"></ui-prop>
	<div v-if="target.type.value === 0">
		<ui-prop v-prop="target.fiveAdd"></ui-prop>
		<ui-prop v-prop="target.fiveSub"></ui-prop>
		<ui-prop v-prop="target.minCount"></ui-prop>
		<ui-prop v-prop="target.spType"></ui-prop>
		<ui-prop v-prop="target.maxCount"></ui-prop>
		<ui-prop v-prop="target.preAdd"></ui-prop>
		<ui-prop v-prop="target.fiveAddNum"></ui-prop>
		<ui-prop v-prop="target.initNormalNum"></ui-prop>
	</div>
	<div v-if="target.type.value === 1">
		<ui-prop v-prop="target.spType"></ui-prop>
		<ui-prop v-prop="target.minCount"></ui-prop>
		<ui-prop v-prop="target.initStListNum"></ui-prop>
		<ui-prop v-prop="target.preAdd"></ui-prop>
		<cc-array-prop :target.sync="target.special"></cc-array-prop>
		
	</div>
  `,

  props: {
    target: {
      twoWay: true,
      type: Object,
    },
  },
});




