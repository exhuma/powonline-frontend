<template>
  <v-container>
    <v-text-field
      name="team_name"
      type="text"
      v-model="team.name"
      label="Name"
      hint="Enter a new teamname"
    />
    <v-text-field
      name="team_contact"
      type="text"
      v-model="team.contact"
      label="Contact"
      hint="The name of the primary contact of the team"
    />
    <v-text-field
      name="team_phone"
      type="text"
      v-model="team.phone"
      label="Phone #"
      hint="The phone number of the primary contact of the team"
    />
    <v-text-field
      name="team_email"
      type="email"
      v-model="team.email"
      label="e-mail"
      hint="Enter the team's contact email"
    />
    <v-text-field
      name="order"
      type="number"
      v-model="team.order"
      label="Team Ordering"
      hint="This field is used to sort teams"
    />
    <v-text-field
      name="num_vegetarians"
      type="number"
      v-model="team.num_vegetarians"
      label="Vegetarians"
      hint="The number of vegetarians in the team"
    />
    <v-text-field
      name="num_participants"
      type="number"
      v-model="team.num_participants"
      label="Participants"
      hint="The total number of participants in the team"
    />
    <v-text-field
      name="planned_start_time"
      type="datetime-local"
      v-model="team.planned_start_time"
      label="Planned Start Time"
      hint="The time when the team was planned to leave"
    />
    <v-text-field
      name="effective_start_time"
      type="datetime-local"
      v-model="team.effective_start_time"
      label="Real Start Time"
      hint="The time when the team has effectively left the start position"
    />
    <v-text-field
      name="finish_time"
      type="datetime-local"
      v-model="team.finish_time"
      label="Finish Time"
      hint="The time when the team arrived at the end"
    />
    <v-select
      :items="availableRoutes"
      label="Route"
      v-model="team.route_name"
    ></v-select>
    <v-text-field
      name="comments"
      type="text"
      v-model="team.comments"
      label="Comments"
      hint="Additional comments for this team"
    />
    <v-checkbox
      name="cancelled"
      v-model="team.cancelled"
      label="Team has abandoned/cancelled the event"
    />
    <v-checkbox
      name="is_confirmed"
      v-model="team.is_confirmed"
      label="The team is confirmed by the event organisers"
    />
    <v-checkbox
      name="accepted"
      v-model="team.accepted"
      label="The team has accepted the time-slot"
    />
    <v-checkbox
      name="completed"
      v-model="team.completed"
      label="The team has completed the event"
    />
  </v-container>
</template>

<script>
export default {
  name: "TeamForm",
  props: {
    team: {
      type: Object,
    },
  },
  computed: {
    availableRoutes() {
      return this.$store.state.routes.map((item) => item.name);
    },
  },
};
</script>
