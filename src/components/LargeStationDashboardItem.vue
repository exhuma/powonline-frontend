<template>
  <v-card>
    <v-card-title>
      <span>{{ state.team }}</span>
    </v-card-title>
    <v-card-text>
      <v-container>
        <v-layout row wrap class="bigrow">
          <v-flex xs2 class="clickable" @click="advanceState(state)" elevation-1>
            <v-container v-ripple fill-height>
              <v-layout row align-center>
                <v-flex xs12>
                  <state-icon :state="state.state"></state-icon>
                </v-flex>
              </v-layout>
            </v-container>
          </v-flex>
          <v-flex xs10>
            <v-container>
              <v-layout row align-center>
                <v-flex xs2>
                  Score:
                </v-flex>
                <v-flex xs8 text-xs-left>
                  <input :value="state.score" type="number" @change="updateScore" :data-team="state.team" placeholder="score" />
                </v-flex>
                <v-flex xs2>
                  <v-btn @click="saveChanges" success><v-icon>save</v-icon></v-btn>
                </v-flex>
              </v-layout>
            </v-container>
          </v-flex>
        </v-layout>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'large-station-dashboard-item',
  props: ['state'],
  methods: {
    advanceState: function () {
      this.$emit('stateAdvanced', this.state)
    },
    updateScore: function (event) {
      const score = event.target.value
      this.$emit('scoreUpdated', this.state, score)
    },
    saveChanges: function () {
      this.$emit('saveClicked', this.state)
    }
  }
}
</script>
