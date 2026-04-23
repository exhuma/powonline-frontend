<template>
  <div id="QuestionnaireList">
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-toolbar flat color="transparent">
            <v-icon class="mr-2">mdi-comment-question</v-icon>
            <v-toolbar-title>Questionnaire Management</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>
            <v-btn color="primary" @click="openCreateDialog">
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
                @update:model-value="stationUpdated($event, item)"
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
                  questionnaireUpdated(item, item.originalName || item.name)
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
                  questionnaireUpdated(item, item.originalName || item.name)
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
                  @click="confirmDelete(item)"
                />
              </RowActions>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-container>

    <!-- Create dialog -->
    <v-dialog v-model="showCreateDialog" max-width="500px">
      <v-card>
        <v-card-title>New Questionnaire</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newQuestionnaire.name"
            label="Questionnaire name"
            @keyup.enter="onCreateConfirmed"
          />
          <v-text-field
            v-model.number="newQuestionnaire.order"
            type="number"
            label="Questionnaire Ordering"
            hint="This field is used to sort questionnaires"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showCreateDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="onCreateConfirmed">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete confirmation dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400px">
      <v-card>
        <v-card-title>Delete Questionnaire</v-card-title>
        <v-card-text>
          Are you sure you want to delete
          <strong>{{
            deletingQuestionnaire && deletingQuestionnaire.name
          }}</strong
          >? This will remove the questionnaire and all related information.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showDeleteDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="doDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { api } from '@/main'
import model from '@/model'
import type { Questionnaire } from '@/remote/model/questionnaire'
import type { Station } from '@/remote/model/station'
import EventBus from '@/plugins/eventBus'
import RowActions from '@/components/RowActions.vue'

export default defineComponent({
  name: 'QuestionnaireList',
  components: { RowActions },
  inject: ['getSelectedEventId'],

  data() {
    return {
      loading: false,
      saving: false,
      questionnaires: [] as Questionnaire[],
      stations: [] as Station[],
      showCreateDialog: false,
      showDeleteDialog: false,
      newQuestionnaire: model.questionnaire.makeEmpty() as any,
      deletingQuestionnaire: null as Questionnaire | null,
      questionnaireHeaders: [
        { title: 'Name', key: 'name', sortable: true },
        { title: 'Max. Score', key: 'max_score', sortable: true },
        { title: 'Station', key: 'station_name', sortable: true },
        { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
      ]
    }
  },

  async mounted() {
    await this.fetchData()
  },

  methods: {
    async fetchData() {
      const eventId = (this as any).getSelectedEventId()
      if (!eventId) return
      this.loading = true
      try {
        const [questionnaires, stations] = await Promise.all([
          api.fetchQuestionnaires(eventId),
          api.fetchStations(eventId)
        ])
        this.questionnaires = questionnaires
        this.stations = stations
      } catch (e) {
        console.error('Failed to fetch data', e)
      } finally {
        this.loading = false
      }
    },
    openCreateDialog() {
      this.newQuestionnaire = model.questionnaire.makeEmpty()
      this.showCreateDialog = true
    },
    confirmDelete(questionnaire: Questionnaire) {
      this.deletingQuestionnaire = questionnaire
      this.showDeleteDialog = true
    },
    async onCreateConfirmed() {
      const eventId = (this as any).getSelectedEventId()
      try {
        const created = await api.addQuestionnaire(
          this.newQuestionnaire,
          eventId
        )
        this.questionnaires.push(created)
      } catch (e) {
        console.error('Failed to add questionnaire', e)
      }
      this.newQuestionnaire = model.questionnaire.makeEmpty()
      this.showCreateDialog = false
    },
    async doDelete() {
      this.showDeleteDialog = false
      if (!this.deletingQuestionnaire) return
      const eventId = (this as any).getSelectedEventId()
      try {
        await api.deleteQuestionnaire(this.deletingQuestionnaire.name, eventId)
        this.questionnaires = this.questionnaires.filter(
          (q) => q.name !== this.deletingQuestionnaire!.name
        )
      } catch (e) {
        console.error('Failed to delete questionnaire', e)
      }
      this.deletingQuestionnaire = null
    },
    async stationUpdated(
      station: Station | { name: '' },
      questionnaire: Questionnaire
    ) {
      const eventId = (this as any).getSelectedEventId()
      this.saving = true
      try {
        if ((station as any).name !== '-- None --') {
          await api.assignQuestionnaireToStation(
            (station as Station).name,
            questionnaire,
            eventId
          )
        } else {
          await api.unassignQuestionnaireFromStation(
            questionnaire.name,
            eventId
          )
        }
        const updatedQuestionnaires = await api.fetchQuestionnaires(eventId)
        this.questionnaires = updatedQuestionnaires
      } catch (e) {
        console.error('Failed to update station assignment', e)
        EventBus.emit('snackRequested', {
          message: 'Failed to update station assignment',
          color: 'error'
        })
      } finally {
        this.saving = false
      }
    },
    async questionnaireUpdated(questionnaire: Questionnaire, oldName: string) {
      const eventId = (this as any).getSelectedEventId()
      this.saving = true
      try {
        await api.updateQuestionnaire(oldName, questionnaire, eventId)
      } catch (e) {
        console.error('Failed to update questionnaire', e)
      } finally {
        this.saving = false
      }
    }
  }
})
</script>
