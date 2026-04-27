<template>
  <div>
    <v-toolbar flat color="transparent">
      <v-icon class="mr-2">mdi-comment-question</v-icon>
      <v-toolbar-title>Questionnaire Management</v-toolbar-title>
      <v-divider class="mx-4" inset vertical></v-divider>
      <v-btn color="primary" @click="$emit('open-create')">
        <v-icon start>mdi-plus</v-icon>
        New Questionnaire
      </v-btn>
    </v-toolbar>
    <v-data-table
      :headers="questionnaireHeaders"
      :items="questionnaires"
      :items-per-page="15"
      :loading="loading"
      :sort-by="[{ key: 'order' }, { key: 'name' }]"
      class="elevation-0"
    >
      <template v-slot:item.station_name="{ item }">
        <v-select
          :items="[{ name: '-- None --' }, ...stations]"
          :model-value="
            stations.find((s) => s.name === item.station_name) || {
              name: '-- None --'
            }
          "
          item-title="name"
          item-value="name"
          hide-details
          variant="plain"
          density="compact"
          return-object
          @update:model-value="$emit('station-updated', $event, item)"
        ></v-select>
      </template>
      <template v-slot:item.name="{ item }">
        <v-text-field
          v-model="item.name"
          hide-details
          variant="plain"
          density="compact"
          style="font-size: 90%"
          @change="
            $emit('questionnaire-updated', item, item.originalName || item.name)
          "
          @focus="item.originalName = item.name"
        ></v-text-field>
      </template>
      <template v-slot:item.max_score="{ item }">
        <v-text-field
          v-model="item.max_score"
          type="number"
          hide-details
          variant="plain"
          density="compact"
          @change="
            $emit('questionnaire-updated', item, item.originalName || item.name)
          "
          @focus="item.originalName = item.name"
        ></v-text-field>
      </template>
      <template v-slot:item.actions="{ item }">
        <RowActions>
          <v-list-item
            prepend-icon="mdi-delete"
            title="Delete"
            class="text-error"
            @click="$emit('open-delete', item)"
          />
        </RowActions>
      </template>
    </v-data-table>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type { Questionnaire } from '@/remote/model/questionnaire'
import type { Station } from '@/remote/model/station'
import RowActions from '@/components/RowActions.vue'

export default defineComponent({
  name: 'QuestionnaireTable',
  components: { RowActions },
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
      questionnaireHeaders: [
        { title: 'Name', key: 'name', sortable: true },
        { title: 'Max. Score', key: 'max_score', sortable: true },
        { title: 'Station', key: 'station_name', sortable: true },
        {
          title: 'Actions',
          key: 'actions',
          sortable: false,
          align: 'end' as const
        }
      ]
    }
  }
})
</script>
