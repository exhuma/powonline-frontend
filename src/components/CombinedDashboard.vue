<template>
    <div>
      <dashboard-progress-line
        row
        :data="overallData"
        :color="overallColor"></dashboard-progress-line>
      <dashboard-progress-line
        row
        v-for="row in unfinishedTeams"
        :key="row.team"
        :data="row"
        :color="row.color"></dashboard-progress-line>
      <v-divider class="ma-3"></v-divider>
      <h1 class="primary--text">Finished Teams</h1>
      <dashboard-progress-line
        row
        v-for="row in finishedTeams"
        :key="row.team"
        :data="row"
        :color="row.color"></dashboard-progress-line>
    </div>
</template>

<script>
function isFinished (item) {
  if (item.cancelled || item.completed) {
    return true
  }
  return (item.waiting + item.pending) === 0
}
export default {
  name: 'combined-dashboard',
  props: {
    routes: {
      required: true
    }
  },
  data () {
    return {
      overallColor: 'hsl(120, 30%, 30%)'
    }
  },
  computed: {
    overallData () {
      return {
        pct_finished: this.overall_pct_finished,
        pct_waiting: this.overall_pct_waiting,
        team: 'Overall Progress'
      }
    },
    overall_pct_finished () {
      let pending = 0
      let waiting = 0
      let finished = 0
      let activeTeams = this.rows.filter(item => !item.cancelled)
      activeTeams.forEach(item => {
        if (isFinished(item)) {
          finished += item.pending + item.waiting + item.finished
        } else {
          pending += item.pending
          waiting += item.waiting
          finished += item.finished
        }
      })
      let total = pending + waiting + finished
      return finished / total * 100
    },
    overall_pct_waiting () {
      let pending = 0
      let waiting = 0
      let finished = 0
      let activeTeams = this.rows.filter(item => !item.cancelled)
      activeTeams.forEach(item => {
        if (isFinished(item)) {
          finished += item.pending + item.waiting + item.finished
        } else {
          pending += item.pending
          waiting += item.waiting
          finished += item.finished
        }
      })
      let total = pending + waiting + finished
      return waiting / total * 100
    },
    rows () {
      let output = []
      this.$store.state.global_dashboard.forEach(team => {
        let teamDetails = this.$store.getters.findTeam(team.team)
        let route = this.$store.state.routes.find(item => item.name === teamDetails.route_name)
        let row = {
          pending: 0,
          waiting: 0,
          finished: 0,
          team: team.team,
          cancelled: teamDetails.cancelled,
          completed: teamDetails.completed,
          color: (route ? route.color : '#ccc')
        }
        team.stations.forEach(station => {
          switch (station.state) {
            case 'arrived':
              row.waiting += 1
              break
            case 'finished':
              row.finished += 1
              break
            case 'unknown':
              row.pending += 1
              break
            default:
              console.warn(`Unknown state: ${JSON.stringify(station.state)}`)
          }
        })
        let total = row.pending + row.waiting + row.finished
        row.pct_pending = row.pending / total * 100
        row.pct_waiting = row.waiting / total * 100
        row.pct_finished = row.finished / total * 100
        output.push(row)
      })
      output.sort((a, b) => (a.pct_finished * 2 + a.pct_waiting) <= (b.pct_finished * 2 + b.pct_waiting))
      return output
    },
    finishedTeams () {
      let all = this.rows
      return all.filter(item => isFinished(item))
    },
    unfinishedTeams () {
      let all = this.rows
      return all.filter(item => !isFinished(item))
    }
  }
}
</script>
