<template>
  <div
    :class="question.cssClasses.root"
    v-bind:style="{
      height: question.signatureHeight + 'px',
      width: question.signatureWidth + 'px',
    }"
  >
    <div :class="question.cssClasses.placeholder" v-show="question.needShowPlaceholder()">{{ question.placeHolderText }}</div>
    <div>
      <img v-if="question.backgroundImage" :class="question.cssClasses.backgroundImage" :src="question.backgroundImage"
      :width="question.signatureWidth" :height="question.signatureHeight">
      <canvas tabindex="0" :class="question.cssClasses.canvas"></canvas>
    </div>
    <div :class="question.cssClasses.controls" v-if="question.canShowClearButton">
      <button
        type="button"
        :class="question.cssClasses.clearButton"
        :title="question.clearButtonCaption"
        v-on:click="
          () => {
            question.clearValue();
          }
        "
      >
        <span v-if="!question.cssClasses.clearButtonIconId">✖</span>
        <sv-svg-icon
          v-if="question.cssClasses.clearButtonIconId"
          :iconName="question.cssClasses.clearButtonIconId"
          :size="'auto'"
        ></sv-svg-icon>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";
import { default as QuestionVue } from "./question";
import { QuestionSignaturePadModel } from "survey-core";

@Component
export class SignaturePad extends QuestionVue<QuestionSignaturePadModel> {}
Vue.component("survey-signaturepad", SignaturePad);
export default SignaturePad;
</script>
