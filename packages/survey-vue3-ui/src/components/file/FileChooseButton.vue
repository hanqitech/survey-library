<template>
  <label
    v-if="!question.isReadOnly"
    role="button"
    tabindex="0"
    :class="question.getChooseFileCss()"
    :for="question.inputId"
    v-bind:aria-label="question.chooseButtonText"
    v-key2click
  >
    <sv-svg-icon
      v-if="question.cssClasses.chooseFileIconId"
      :title="question.chooseButtonText"
      :iconName="question.cssClasses.chooseFileIconId"
      :size="'auto'"
    ></sv-svg-icon>
    <span>{{ question.chooseButtonText }}</span>
  </label>
</template>
<script setup lang="ts">
import type { QuestionFileModel, Action } from "survey-core";
import { computed } from "vue";
const props = defineProps<{
  data?: { question: QuestionFileModel };
  item?: Action;
}>();
const question = computed(
  () => props.data?.question || props.item.data.question
);
</script>
