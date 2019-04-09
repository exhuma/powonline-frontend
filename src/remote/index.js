/**
 * Proxy for the remote API
 */
import axios from 'axios'
import Vue from 'vue'

Vue.mixin({
  beforeCreate () {
    const options = this.$options
    if (options.remoteProxy) {
      this.$remoteProxy = options.remoteProxy
    } else if (options.parent && options.parent.$remoteProxy) {
      this.$remoteProxy = options.parent.$remoteProxy
    }
  }
})

class APIProxy {
  constructor (baseUrl) {
    this.baseUrl = baseUrl
  }

  /**
   * Perform a social login on the back-end
   *
   * This assumes that we've already done a social login on the client-side and
   * hold a token. The back-end will use that token to authenticate the user
   * with the social provider.
   *
   * network: The name of the social network
   * userId: The user-id used by the social network
   * token: The token received from the social network.
   */
  socialLogin (store, network, userId, token) {
    axios.post(this.baseUrl + '/login', {
      'social_provider': network,
      'user_id': userId,
      'token': token
    }).then(response => {
      if (response.status === 200) {
        store.commit('loginUser', response.data)
      } else {
        // TODO show error as snack-text
        console.error('Unexpected remote response (' + response.status + ')')
        store.commit('logoutUser')
      }
    }).catch(e => {
      // TODO show message as snack-text
      console.error(e)
      store.commit('logoutUser')
    })
  }

  setStationScore (stationName, teamName, score) {
    return axios.post(this.baseUrl + '/job', {
      'action': 'set_score',
      'args': {
        'station_name': stationName,
        'team_name': teamName,
        'score': score
      }
    })
  }

  setQuestionnaireScore (store, stationName, teamName, score) {
    return axios.post(this.baseUrl + '/job', {
      'action': 'set_questionnaire_score',
      'args': {
        'station_name': stationName,
        'team_name': teamName,
        'score': score
      }
    }).then(response => {
      store.commit('setQuestionnaireScore', {
        'stationName': stationName,
        'teamName': teamName,
        'score': parseInt(score, 10)
      })
    })
  }

  advanceState (store, stationName, teamName) {
    axios.post(this.baseUrl + '/job', {
      'action': 'advance',
      'args': {
        'station_name': stationName,
        'team_name': teamName
      }
    }).then(response => {
      // The server assigned a new state, so we must update our local
      // values
      const newState = response.data.result.state
      let data = {
        team: teamName,
        station: stationName,
        new_state: newState
      }
      store.commit('updateTeamState', data)
    })
  }

  fetchDashboard (store) {
    axios.get(this.baseUrl + '/dashboard').then(response => {
      store.commit('updateGlobalDashboard', response.data)
    })
  }
}

class FakeProxy extends APIProxy {
  socialLogin (store, network, userId, token) {
    let responseData = {
      'token': 'fake-jwt-token',
      'roles': ['role1'],
      'user': 'fake-user'
    }
    store.commit('loginUser', responseData)
    console.log('User logged in as ' + responseData)
  }

  setStationScore (stationName, teamName, score) {
    // no-op
  }

  setQuestionnaireScore (store, stationName, teamName, score) {
    // no-op
  }

  advanceState (store, stationName, teamName) {
    let data = {
      team: teamName,
      station: stationName,
      new_state: 'arrived'
    }
    store.commit('updateTeamState', data)
  }

  fetchDashboard (store) {
    let data = [
      {
        'team': 'team-1',
        'stations': [{'name': 'station-1', 'score': 10, 'state': 'arrived'}]
      }, {
        'team': 'team-2',
        'stations': [{'name': 'station-1', 'score': 20, 'state': 'unknown'}]
      }
    ]
    store.commit('updateGlobalDashboard', data)
  }
}

export default function makeRemoteProxy (fake, backendUrl) {
  let Cls = (fake ? FakeProxy : Proxy)
  return new Cls(backendUrl)
}
