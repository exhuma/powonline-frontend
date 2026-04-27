<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="500px"
  >
    <v-card>
      <v-card-title>Edit Questionnaire</v-card-title>
      <v-card-text>
        <v-text-field v-model="form.name" label="Name" />
        <v-text-field
          v-model.number="form.max_score"
          type="number"
          label="Max Score"
        />
        <v-select
          v-model="selectedStation"
          :items="[{ name: '-- None --' }, ...stations]"
          item-title="name"
          item-value="name"
          return-object
          label="Station"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="$emit('update:modelValue', false)"
          >Cancel</v-btn
        >
        <v-btn color="primary" @click="onSave">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type { Questionnaire } from '@/remote/model/questionnaire'
import type { Station } from '@/remote/model/station'

export default defineComponent({
  name: 'QuestionnaireEditDialog',
  props: {
    modelValue: { type: Boolean, default: false },
    questionnaire: {
      type: Object as PropType<Questionnaire | null>,
      default: null
    },
    stations: { type: Array as PropType<Station[]>, default: () => [] }
  },
  emits: ['update:modelValue', 'save-name', 'save-station'],
  data() {
    return {
      form: { name: '', max_score: 0 } as Partial<Questionnaire> & {
        originalName?: string
      },
      selectedStation: { name: '-- None --' } as { name: string }
    }
  },
  watch: {
    questionnaire(q: Questionnaire | null) {
      if (q) {
        this.form = { ...q, originalName: q.name }
        this.selectedStation = q.station_name
          ? { name: q.station_name }
          : { name: '-- None --' }
      }
    }
  },
  methods: {
    onSave() {
      if (!this.questionnaire) return
      const originalName =
        (this.form as any).originalName || this.questionnaire.name
      // Emit name/score update
      this.$emit('save-name', this.form, originalName)
      // Emit station update
      this.$emit('save-station', this.selectedStation, this.form)
      this.$emit('update:modelValue', false)
    }
  }
})
</script>
