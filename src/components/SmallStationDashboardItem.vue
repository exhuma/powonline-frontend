<template>
  <v-card>
    <v-card-title class="primary darken-3 pa-1 pl-3 pr-3">
      <span :class="hasCancelled ? 'cancelled' : ''"
        ><h4>{{ state.team }}</h4></span
      >
      <span class="cancelledHeader" v-if="hasCancelled">Cancelled</span>
    </v-card-title>
    <v-card-text>
      <v-container>
        <v-layout row align-center>
          <v-flex xs12>
            <v-text-field
              @keyup.enter="onScoreEnter"
              @change="updateScore"
              type="number"
              v-model="state.score"
              label="Score"
            />
          </v-flex>
        </v-layout>
        <v-layout row align-center>
          <v-flex xs12>
            <v-text-field
              @keyup.enter="onQuestionnaireScoreEnter"
              @change="updateQuestionnaireScore"
              type="number"
              v-model="questionnaireScore.score"
              :label="'Questionnaire Score (' + questionnaireScore.name + ')'"
            />
          </v-flex>
        </v-layout>
        <v-layout row align-center>
          <v-flex xs6>
            <v-btn class="action-button" @click="advanceState(state)"
              ><state-icon :state="state.state"></state-icon
            ></v-btn>
          </v-flex>
          <v-flex xs6>
            <v-btn class="action-button" @click="saveChanges" color="success"
              ><v-icon>mdi-content-save</v-icon></v-btn
            >
          </v-flex>
        </v-layout>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.action-button {
  min-height: 4em;
  width: 100%;
}
.cancelledHeader {
  color: #fa0;
  margin-left: 1em;
  font-size: 100%;
  font-weight: bold;
}

.cancelled {
  text-decoration: line-through;
  color: #888;
}
</style>

<script>
export default {
  name: 'small-station-dashboard-item',
  props: ['state', 'cancelled'],
  computed: {
    hasCancelled() {
      let teamDetails = this.$store.getters.findTeam(this.state.team)
      if (teamDetails === null) {
        return false
      }
      return teamDetails.cancelled
    },
    questionnaireScore() {
      const team = this.$store.state.questionnaireScores[this.state.team]
      if (!team) {
        return {
          name: 'unknown',
          score: 0
        }
      }
      const score = team[this.state.station]
      if (!score) {
        return {
          name: 'unknown',
          score: 0
        }
      }
      return score
    }
  },
  methods: {
    advanceState: function () {
      this.$emit('stateAdvanced', this.state)
    },
    onScoreEnter: function (event) {
      const newValue = event.target.value
      this.$emit('scoreUpdated', this.state, newValue)
    },
    updateScore: function (newValue) {
      this.$emit('scoreUpdated', this.state, newValue)
    },
    onQuestionnaireScoreEnter: function (event) {
      const newValue = event.target.value
      this.$emit('questionnaireScoreUpdated', {
        score: newValue,
        team: this.state.team
      })
    },
    updateQuestionnaireScore: function (newValue) {
      this.$emit('questionnaireScoreUpdated', {
        score: newValue,
        team: this.state.team
      })
    },
    saveChanges: function () {
      this.$emit('scoreUpdated', this.state, this.state.score)
      this.$emit('questionnaireScoreUpdated', {
        score: this.questionnaireScore.score,
        team: this.state.team
      })
    }
  }
}
</script>
