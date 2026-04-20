<template>
  <div class="d-flex align-center ga-1 justify-end">
    <slot name="pinned" />
    <v-menu location="bottom end" :close-on-content-click="true">
      <template #activator="{ props }">
        <v-btn
          icon
          size="small"
          variant="text"
          v-bind="props"
          :title="menuTitle"
          :aria-label="menuTitle"
        >
          <v-icon>mdi-dots-vertical</v-icon>
        </v-btn>
      </template>
      <v-list density="compact" nav>
        <slot />
      </v-list>
    </v-menu>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'RowActions',
  props: {
    menuTitle: {
      type: String,
      default: 'More actions'
    }
  }
})
</script>
