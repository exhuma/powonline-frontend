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
          :items="Object.values(stations)"
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
      this.loading = true

      this.$store
        .dispatch('setQuestionnaireStation', {
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
    }
  },
  data() {
    return {
      loading: false,
      questionnaireHeaders: [
        {
          text: 'Name',
          value: 'name',
          sortable: true
        },
        {
          text: 'Max. Score',
          value: 'max_score'
        },
        {
          text: 'Order',
          value: 'order'
        },
        {
          text: 'Station',
          value: 'station_name'
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
