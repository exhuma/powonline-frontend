<template>
  <v-card>
    <v-card-title>
      <span>{{ state.team }}</span>
    </v-card-title>
    <v-card-text>
      <v-container pa-0>
        <v-layout row align-center>
          <v-flex xs12>
            <v-text-field
              @keyup.enter="onScoreEnter"
              @change="updateScore"
              type='number'
              v-model='state.score'
              label='Score' />
          </v-flex>
        </v-layout>
        <v-layout row align-center>
          <v-flex xs6>
            <v-btn
              style="height: 4em;"
              @click="advanceState(state)"><state-icon :state="state.state"></state-icon></v-btn>
          </v-flex>
          <v-flex xs6>
            <v-btn style="height: 4em;" @click="saveChanges" color="success"><v-icon>save</v-icon></v-btn>
          </v-flex>
        </v-layout>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'small-station-dashboard-item',
  props: ['state'],
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
    saveChanges: function () {
      this.$emit('saveClicked', this.state)
    }
  }
}
</script>
