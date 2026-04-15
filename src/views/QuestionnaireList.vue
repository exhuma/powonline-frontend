<template>
  <center-col id="QuestionnaireList">
    <popup-dialog
      @dialogConfirmed="onDialogConfirmed"
      @dialogDismissed="closeAddBlock"
      :dialogVisible="isAddBlockVisible"
      :editMode="sendMode === SEND_MODE.UPDATE"
      title="Add New Questionnaire"
    >
      <v-text-field
        @keyup.enter.native="onDialogConfirmed"
        type="text"
        v-model="selectedQuestionnaire.name"
        label="Enter a new questionnaire name"
      />
      <v-text-field
        name="order"
        type="number"
        v-model="selectedQuestionnaire.order"
        hint="This field is used to sort questionnaires"
        label="Questionnaire Ordering"
      />
    </popup-dialog>

    <div v-if="loading" class="text-center py-6">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <v-data-table
      v-else
      :headers="questionnaireHeaders"
      :items="questionnaires"
      :sort-by="['order', 'name']"
      :multi-sort="true"
    >
      <template v-slot:item.station_name="{ item }">
        <v-select
          v-model="item.station_name"
          :items="[{ id: null, name: '-- None --' }, ...stations]"
          item-text="name"
          item-value="id"
          hide-details
          solo
          dense
          return-object
          @change="stationUpdated($event, item)"
          :menu-props="{ closeOnContentClick: false }"
        ></v-select>
      </template>
      <template v-slot:item.actions="{ item }">
        <confirmation-dialog
          buttonText="Delete"
          :actionArgument="item.name"
          @confirmed="deleteQuestionnaire(item)"
        >
          <span slot="title"
            >Do you want to delete the questionnaire "{{ item.name }}"?</span
          >
          <div slot="text">
            <p>
              This will delete the questionnaire with the name "{{ item.name }}"
              and all related information!
            </p>
            <p>Are you sure?</p>
          </div>
        </confirmation-dialog>
      </template>
      <template v-slot:item.max_score="{ item }">
        <v-text-field
          v-model="item.max_score"
          type="number"
          dense
          solo
          hide-details
          @change="questionnaireUpdated(item, item.originalName || item.name)"
          @focus="item.originalName = item.name"
        ></v-text-field>
      </template>
      <template v-slot:item.name="{ item }">
        <v-text-field
          v-model="item.name"
          dense
          solo
          hide-details
          style="font-size: 90%"
          @change="questionnaireUpdated(item, item.originalName || item.name)"
          @focus="item.originalName = item.name"
        ></v-text-field>
      </template>
    </v-data-table>

    <v-btn class="pa-3 mt-2" @click="openCreateDialog"
      >Add new Questionnaire</v-btn
    >
  </center-col>
</template>

<script lang="ts">
import Vue from 'vue'
import { api } from '@/main'
import model from '@/model'
import ConfirmationDialog from '@/components/ConfirmationDialog.vue'
import type { Questionnaire } from '@/remote/model/questionnaire'
import type { Station } from '@/remote/model/station'

const QuestionnaireList = Vue.extend({
  name: 'questionnaire_list',
  components: { ConfirmationDialog },
  inject: ['getSelectedEventId'],

  data() {
    return {
      loading: false,
      saving: false,
      questionnaires: [] as Questionnaire[],
      stations: [] as Station[],
      isAddBlockVisible: false,
      selectedQuestionnaire: model.questionnaire.makeEmpty() as any,
      sendMode: model.SEND_MODE.CREATE,
      SEND_MODE: model.SEND_MODE,
      questionnaireHeaders: [
        { text: 'Name', value: 'name', sortable: true, width: '200' },
        { text: 'Max. Score', value: 'max_score' },
        { text: 'Station', value: 'station_name' },
        { text: 'Actions', value: 'actions', sortable: false, align: 'end' }
      ]
    }
  },

  async created() {
    await this.fetchData()
  },

  methods: {
    async fetchData() {
      // @ts-expect-error inject
      const eventId = this.getSelectedEventId()
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
      this.selectedQuestionnaire = model.questionnaire.makeEmpty()
      this.isAddBlockVisible = true
      this.sendMode = model.SEND_MODE.CREATE
    },
    closeAddBlock() {
      this.isAddBlockVisible = false
    },
    async onDialogConfirmed() {
      // @ts-expect-error inject
      const eventId = this.getSelectedEventId()
      const questionnaire = this.selectedQuestionnaire

      if (this.sendMode === model.SEND_MODE.CREATE) {
        try {
          const created = await api.addQuestionnaire(questionnaire, eventId)
          this.questionnaires.push(created)
        } catch (e) {
          console.error('Failed to add questionnaire', e)
        }
      }

      this.selectedQuestionnaire = model.questionnaire.makeEmpty()
      this.isAddBlockVisible = false
    },
    async deleteQuestionnaire(questionnaire: Questionnaire) {
      // @ts-expect-error inject
      const eventId = this.getSelectedEventId()
      try {
        await api.deleteQuestionnaire(questionnaire.name, eventId)
        this.questionnaires = this.questionnaires.filter(
          (q) => q.name !== questionnaire.name
        )
      } catch (e) {
        console.error('Failed to delete questionnaire', e)
      }
    },
    async stationUpdated(
      station: Station | { id: null; name: string },
      questionnaire: Questionnaire
    ) {
      // @ts-expect-error inject
      const eventId = this.getSelectedEventId()
      this.saving = true
      try {
        if ((station as any).id !== null) {
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
      } catch (e) {
        console.error('Failed to update station assignment', e)
      } finally {
        this.saving = false
      }
    },
    async questionnaireUpdated(questionnaire: Questionnaire, oldName: string) {
      // @ts-expect-error inject
      const eventId = this.getSelectedEventId()
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
export default QuestionnaireList
</script>

<style scoped>
#QuestionnaireList {
  padding-bottom: 5em;
}
</style>
