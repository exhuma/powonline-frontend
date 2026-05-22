<template>
  <v-card>
    <v-card-title class="bg-primary darken-3 pa-1 pl-3 pr-3 card-title">
      <span :class="cancelled ? 'cancelled' : ''">{{ teamName }}</span>
      <span class="cancelledHeader" v-if="cancelled">Cancelled</span>
    </v-card-title>
    <v-card-text class="pt-3 pb-2 px-3">
      <v-container class="pa-0">
        <v-row align="stretch" dense>
          <v-col cols="6" class="d-flex flex-column">
            <v-text-field
              @keyup.enter="onScoreEnter"
              @change="updateScore"
              type="number"
              :value="stationScore"
              label="Score"
              density="comfortable"
              variant="outlined"
              hide-details
              prepend-inner-icon="mdi-gamepad-variant-outline"
              class="flex-grow-1"
              :disabled="disabled"
            />
          </v-col>
          <v-col cols="6" class="d-flex flex-column">
            <v-text-field
              @keyup.enter="onQuestionnaireScoreEnter"
              @change="updateQuestionnaireScore"
              type="number"
              :value="questionnaireScore"
              label="Q-Score"
              density="comfortable"
              variant="outlined"
              hide-details
              prepend-inner-icon="mdi-clipboard-list-outline"
              class="flex-grow-1"
              :disabled="disabled || !hasQuestionnaire"
            />
          </v-col>
          <v-col cols="6" class="d-flex flex-column">
            <v-btn
              class="action-button flex-grow-1"
              @click="advanceState"
              :disabled="disabled"
              ><state-icon :state="state"></state-icon
            ></v-btn>
          </v-col>
          <v-col cols="6" class="d-flex flex-column">
            <v-btn
              class="action-button flex-grow-1"
              @click="saveChanges"
              color="success"
              :disabled="disabled"
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

const SmallStationDashboardIcon = defineComponent({
  name: 'small-station-dashboard-item',
  props: {
    questionnaireScore: {
      type: Number,
      default: 0
    },
    stationScore: {
      type: Number,
      default: 0
    },
    state: {
      type: String,
      required: true
    },
    cancelled: {
      type: Boolean,
      default: false
    },
    teamName: {
      type: String
    },
    hasQuestionnaire: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    advanceState: function () {
      this.$emit('state-advance-requested', this.teamName)
    },
    onScoreEnter: function (event: Event) {
      const newValue = (event.target as HTMLInputElement).value
      this.$emit('update:station-score', Number.parseFloat(newValue))
    },
    updateScore: function (evt: Event) {
      const newValue = (evt.target as HTMLInputElement).value
      this.$emit('update:station-score', Number.parseFloat(newValue))
    },
    onQuestionnaireScoreEnter: function (event: Event) {
      const newValue = (event.target as HTMLInputElement).value
      this.$emit('update:questionnaire-score', newValue)
    },
    updateQuestionnaireScore: function (evt: Event) {
      const newValue = (evt.target as HTMLInputElement).value
      this.$emit('update:questionnaire-score', newValue)
    },
    saveChanges: function () {
      // deliberate no-op
      //   The code-paths which react to "change" events already handle the
      //   necessary updates, so this is just a placeholder for the "Save"
      //   button. It gives the user something to click on.
    }
  }
})
export default SmallStationDashboardIcon
</script>
