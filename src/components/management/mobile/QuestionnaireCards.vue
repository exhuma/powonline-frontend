<template>
  <div>
    <!-- Mobile toolbar -->
    <v-container class="pa-2">
      <v-row align="center" class="mb-1">
        <v-col class="d-flex align-center">
          <v-icon class="mr-2">mdi-comment-question</v-icon>
          <span class="text-h6">Questionnaires</span>
          <v-spacer />
          <v-btn color="primary" size="small" @click="$emit('open-create')">
            <v-icon start>mdi-plus</v-icon>
            New
          </v-btn>
        </v-col>
      </v-row>
    </v-container>

    <v-progress-linear v-if="loading" indeterminate />

    <v-expansion-panels v-model="expanded" multiple variant="accordion">
      <v-expansion-panel v-for="q in questionnaires" :key="q.name">
        <v-expansion-panel-title>
          <div class="d-flex align-center ga-2 w-100 pr-2">
            <span class="font-weight-medium">{{ q.name }}</span>
            <v-spacer />
            <v-chip v-if="q.station_name" size="x-small" class="mr-1">{{
              q.station_name
            }}</v-chip>
            <v-chip size="x-small" variant="tonal"
              >{{ q.max_score }} pts</v-chip
            >
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-list density="compact" class="pa-0 mb-2">
            <v-list-item prepend-icon="mdi-counter">
              <v-list-item-title>{{ q.max_score }}</v-list-item-title>
              <v-list-item-subtitle>Max Score</v-list-item-subtitle>
            </v-list-item>
            <v-list-item prepend-icon="mdi-map-marker">
              <v-list-item-title>{{ q.station_name || '—' }}</v-list-item-title>
              <v-list-item-subtitle>Station</v-list-item-subtitle>
            </v-list-item>
          </v-list>
          <v-divider class="my-2" />
          <div class="d-flex ga-2">
            <v-btn
              variant="tonal"
              size="small"
              prepend-icon="mdi-pencil"
              @click="openEdit(q)"
              >Edit</v-btn
            >
            <v-btn
              variant="tonal"
              size="small"
              color="error"
              prepend-icon="mdi-delete"
              @click="$emit('open-delete', q)"
              >Delete</v-btn
            >
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <div
      v-if="!loading && questionnaires.length === 0"
      class="text-center text-disabled pa-8"
    >
      No questionnaires found.
    </div>

    <!-- Mobile edit dialog -->
    <QuestionnaireEditDialog
      v-model="showEditDialog"
      :questionnaire="editingQuestionnaire"
      :stations="stations"
      @save-name="onSaveName"
      @save-station="onSaveStation"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type { Questionnaire } from '@/remote/model/questionnaire'
import type { Station } from '@/remote/model/station'
import QuestionnaireEditDialog from './QuestionnaireEditDialog.vue'

export default defineComponent({
  name: 'QuestionnaireCards',
  components: { QuestionnaireEditDialog },
  props: {
    questionnaires: {
      type: Array as PropType<Questionnaire[]>,
      required: true
    },
    stations: { type: Array as PropType<Station[]>, default: () => [] },
    loading: { type: Boolean, default: false }
  },
  emits: [
    'open-create',
    'open-delete',
    'station-updated',
    'questionnaire-updated'
  ],
  data() {
    return {
      expanded: [] as number[],
      showEditDialog: false,
      editingQuestionnaire: null as Questionnaire | null
    }
  },
  methods: {
    openEdit(q: Questionnaire) {
      this.editingQuestionnaire = q
      this.showEditDialog = true
    },
    onSaveName(form: Partial<Questionnaire>, originalName: string) {
      this.$emit('questionnaire-updated', form, originalName)
    },
    onSaveStation(
      station: Station | { name: string },
      questionnaire: Partial<Questionnaire>
    ) {
      this.$emit('station-updated', station, questionnaire)
    }
  }
})
</script>
