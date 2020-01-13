<template>
  <div>
    <v-progress-linear
      v-if="!model.visible"
      class="mt-0"
      height="4"></v-progress-linear>
    <v-progress-linear
      v-if="model.visible"
      class="mt-0"
      height="4"
      v-model="model.progress"
      :indeterminate="model.progress === -1"></v-progress-linear>
  </div>
</template>

<script>
export default {
  name: 'ProgressIndicator',
  props: ["model"]
};
</script>
