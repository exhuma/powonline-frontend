// @ts-expect-error - VueX type definitions are missing
import type { Store } from 'Vuex'
import type { Proxy } from './remote'
import Pusher from 'pusher-js'

type EventConfig = {
  key: string
  debug: boolean
  teamChannel: string
  fileChannel: string
}

export function init(store: Store, remoteProxy: Proxy, config: EventConfig) {
  if (!config.key) {
    console.debug('No pusher-key defined. Realtime events will be disabled')
    return
  }
  Pusher.logToConsole = config.debug
  const pusher = new Pusher(config.key, {
    cluster: 'eu'
  })
  const teamChannel = pusher.subscribe(config.teamChannel)
  teamChannel.bind('state-change', (data: object) => {
    store.commit('updateTeamState', data)
  })
  teamChannel.bind('score-change', function (data: object) {
    store.commit('updateTeamState', data)
  })
  teamChannel.bind('questionnaire-score-change', function (data: object) {
    store.commit('setQuestionnaireScore', data)
  })
  teamChannel.bind('team-details-change', function (data: { name: string }) {
    remoteProxy.fetchTeam(data.name).then((newData: { name: string }) => {
      store.commit('updateTeam', {
        team: data.name,
        newData: newData
      })
    })
  })
  teamChannel.bind('team-deleted', function (data: { name: string }) {
    store.commit('deleteTeam', data.name)
  })

  const fileChannel = pusher.subscribe(config.fileChannel)
  fileChannel.bind('file-added', function (data: object) {
    store.dispatch('refreshUploads')
    store.dispatch('refreshGallery')
    store.commit('addImageToLiveQueue', data)
  })
  fileChannel.bind('file-deleted', function () {
    store.dispatch('refreshUploads')
    store.dispatch('refreshGallery')
  })
}

export default {
  init
}
