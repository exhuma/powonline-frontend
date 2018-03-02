export default {

  SEND_MODE: {
    CREATE: 'create',
    UPDATE: 'update'
  },

  user: {
    makeEmpty: function () {
      return {
        name: '',
        password: ''
      }
    }
  },

  station: {
    makeEmpty: function () {
      return {
        name: ''
      }
    }
  },

  team: {
    makeEmpty: function () {
      return {
        name: '',
        email: 'nobody@example.com', // TODO we should make this optional
        order: 500,
        cancelled: false,
        contact: '',
        phone: '',
        comments: '',
        is_confirmed: false,
        confirmation_key: '',
        accepted: false,
        completed: false,
        inserted: null,
        updated: null,
        num_vegetarians: 0,
        num_participants: 0,
        planned_start_time: null,
        effective_start_time: null,
        finish_time: null,
        route_name: ''
      }
    }
  }
}
