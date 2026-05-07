<template>
  <v-card>
    <v-card-title class="bg-primary darken-3 pa-1 pl-3 pr-3 card-title">
      <span :class="hasCancelled ? 'cancelled' : ''">{{ state.team }}</span>
      <span class="cancelledHeader" v-if="hasCancelled">Cancelled</span>
    </v-card-title>
    <v-card-text class="pt-3 pb-2 px-3">
      <v-container class="pa-0">
        <v-row align="stretch" dense>
          <v-col cols="6" class="d-flex flex-column">
            <v-text-field
              @keyup.enter="onScoreEnter"
              @change="updateScore"
              type="number"
              v-model="state.score"
              label="Score"
              density="comfortable"
              variant="outlined"
              hide-details
              prepend-inner-icon="mdi-gamepad-variant-outline"
              class="flex-grow-1"
              :disabled="!eventLive"
            />
          </v-col>
          <v-col cols="6" class="d-flex flex-column">
            <v-text-field
              @keyup.enter="onQuestionnaireScoreEnter"
              @change="updateQuestionnaireScore"
              type="number"
              v-model="questionnaireScore.score"
              :label="'Q-Score (' + questionnaireScore.name + ')'"
              density="comfortable"
              variant="outlined"
              hide-details
              prepend-inner-icon="mdi-clipboard-list-outline"
              class="flex-grow-1"
              :disabled="!eventLive || !hasQuestionnaire"
            />
          </v-col>
          <v-col cols="6" class="d-flex flex-column">
            <v-btn
              class="action-button flex-grow-1"
              @click="advanceState(state)"
              :disabled="!eventLive"
              ><state-icon :state="state.state"></state-icon
            ></v-btn>
          </v-col>
          <v-col cols="6" class="d-flex flex-column">
            <v-btn
              class="action-button flex-grow-1"
              @click="saveChanges"
              color="success"
              :disabled="!eventLive"
              ><v-icon>mdi-content-save</v-icon></v-btn
            >
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.card-title {
  font-size: 0.95rem;
  font-weight: bold;
  line-height: 1.4;
}

.action-button {
  min-height: 3rem;
  width: 100%;
  height: 100%;
}
.cancelledHeader {
  color: #fa0;
  margin-left: 1em;
  font-size: 90%;
  font-weight: bold;
}

.cancelled {
  text-decoration: line-through;
  color: #888;
}
</style>

<script lang="ts">
import { defineComponent } from 'vue'
import type { Team } from '@/remote/model/team'
import type { QuestionnaireScores } from '@/remote/model/questionnaireScores'

const SmallStationDashboardIcon = defineComponent({
  name: 'small-station-dashboard-item',
  props: {
    state: {
      type: Object,
      default: () => ({})
    },
    cancelled: {
      type: Boolean,
      default: false
    },
    // Array of all teams so we can look up cancelled status
    teams: {
      type: Array as () => Team[],
      default: () => []
    },
    // QuestionnaireScores: { [teamName]: { [stationName]: { name, score } } }
    questionnaireScores: {
      type: Object as () => QuestionnaireScores,
      default: () => ({})
    },
    hasQuestionnaire: {
      type: Boolean,
      default: false
    },
    eventLive: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    hasCancelled(): boolean {
      const teamDetails = (this.teams as Team[]).find(
        (t) => t.name === this.state.team
      )
      return teamDetails ? teamDetails.cancelled : false
    },
    questionnaireScore(): { name: string; score: number } {
      const teamScores = (this.questionnaireScores as QuestionnaireScores)[
        this.state.team
      ]
      if (!teamScores) return { name: 'unknown', score: 0 }
      const score = teamScores[this.state.station]
      if (!score) return { name: 'unknown', score: 0 }
      return score
    }
  },
  methods: {
    advanceState: function (_state?: any) {
      this.$emit('stateAdvanced', this.state)
    },
    onScoreEnter: function (event: Event) {
      const newValue = (event.target as HTMLInputElement).value
      this.$emit('scoreUpdated', this.state, newValue)
    },
    updateScore: function (evt: Event) {
      const newValue = (evt.target as HTMLInputElement).value
      this.$emit('scoreUpdated', this.state, newValue)
    },
    onQuestionnaireScoreEnter: function (event: Event) {
      const newValue = (event.target as HTMLInputElement).value
      this.$emit('questionnaireScoreUpdated', {
        score: newValue,
        team: this.state.team
      })
    },
    updateQuestionnaireScore: function (evt: Event) {
      const newValue = (evt.target as HTMLInputElement).value
      this.$emit('questionnaireScoreUpdated', {
        score: newValue,
        team: this.state.team
      })
    },
    saveChanges: function (_event?: Event) {
      this.$emit('scoreUpdated', this.state, this.state.score)
      this.$emit('questionnaireScoreUpdated', {
        score: this.questionnaireScore.score,
        team: this.state.team
      })
    }
  }
})
export default SmallStationDashboardIcon
</script>
