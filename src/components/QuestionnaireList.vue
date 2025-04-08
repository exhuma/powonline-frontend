<template>
  <center-col id="QuestionnaireList">
    <v-data-table
      :headers="questionnaireHeaders"
      :items="questionnaires"
      :loading="loading"
      :sort-by="['order', 'name']"
      :multi-sort="true"
    >
      <template v-slot:item.station_name="{ item }">
        <v-select
          v-model="item.station_name"
          :items="[
            { id: null, name: '-- None --' },
            ...Object.values(stations)
          ]"
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
          actionName="deleteQuestionnaireRemote"
        >
          <span slot="title"
            >Do you want to delete the questionnaire "{{ item.name }}"?</span
          >
          <div slot="text">
            <p>
              this will delete the questionnaire with the name "{{ item.name }}"
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
  </center-col>
</template>

<script>
import 'vue-swatches/dist/vue-swatches.min.css'
export default {
  name: 'questionnaire_list',
  created() {
    this.$store.commit('changeTitle', 'Questionnaire List')
    this.$store.dispatch('refreshRemote')
  },
  computed: {
    stations() {
      return this.$store.state.stations
    },
    questionnaires() {
      return this.$store.state.questionnaires
    }
  },
  methods: {
    stationUpdated(station, questionnaire) {
      // Recover the currently assigned station
      this.loading = true
      if (station.id !== null) {
        this.$store
          .dispatch('assignQuestionnaireToStation', {
            questionnaire: questionnaire,
            station: station
          })
          .then(() => {
            this.loading = false
          })
          .catch((error) => {
            this.loading = false
            console.error(error)
          })
      } else {
        this.$store
          .dispatch('unassignQuestionnaireFromStation', {
            questionnaire: questionnaire
          })
          .then(() => {
            this.loading = false
          })
          .catch((error) => {
            this.loading = false
            console.error(error)
          })
      }
    },
    questionnaireUpdated(questionnaire, oldName) {
      this.loading = true
      this.$store
        .dispatch('updateQuestionnaireRemote', { oldName, questionnaire })
        .then(() => {
          this.loading = false
        })
        .catch((error) => {
          this.loading = false
          console.error(error)
        })
    }
  },
  data() {
    return {
      loading: false,
      questionnaireHeaders: [
        {
          text: 'Name',
          value: 'name',
          sortable: true,
          width: '200'
        },
        {
          text: 'Max. Score',
          value: 'max_score'
        },
        {
          text: 'Station',
          value: 'station_name'
        },
        {
          text: 'Actions',
          value: 'actions',
          sortable: false,
          align: 'end'
        }
      ]
    }
  }
}
</script>

<style scoped>
#QuestionnaireList {
  padding-bottom: 5em;
}
</style>
