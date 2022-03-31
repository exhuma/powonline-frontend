export default {
  SEND_MODE: {
    CREATE: "create",
    UPDATE: "update",
  },

  route: {
    makeEmpty: function () {
      return {
        name: "",
        color: "",
      };
    },
  },

  user: {
    makeEmpty: function () {
      return {
        name: "",
        password: "",
      };
    },
  },

  station: {
    makeEmpty: function () {
      return {
        name: "",
        order: 500,
        is_start: false,
        is_end: false,
      };
    },
  },

  team: {
    makeEmpty: function () {
      return {
        name: "",
        email: "nobody@example.com", // TODO we should make this optional
        order: 500,
        cancelled: false,
        contact: "",
        phone: "",
        comments: "",
        is_confirmed: false,
        confirmation_key: "",
        accepted: false,
        completed: false,
        inserted: null,
        updated: null,
        num_vegetarians: 0,
        num_participants: 0,
        planned_start_time: null,
        effective_start_time: null,
        finish_time: null,
        route_name: "",
      };
    },
  },
};
