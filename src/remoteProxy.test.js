/* eslint-env jest */
import makeRemoteProxy from './remoteProxy.js'


test('Fetching stations from the remote', () => {
  const proxy = makeRemoteProxy(true, 'https://foo/bar')
  const expected = [{
    'name': 'station-starts',
    'contact': 'Example Contact',
    'phone': '12345',
    'is_start': true,
    'is_end': false,
    'order': 0
  }, {
    'name': 'station-1-1',
    'contact': 'Example Contact',
    'phone': '12345',
    'is_start': false,
    'is_end': false,
    'order': 100
  }, {
    'name': 'station-2-1',
    'contact': 'Example Contact',
    'phone': '12345',
    'is_start': false,
    'is_end': false,
    'order': 100
  }]
  const prm = proxy.fetchStations().then((data) => {
    expect(data).toEqual(expected)
  })
  return prm
})


test('Deleting stations should remove them from the remote', () => {
  const proxy = makeRemoteProxy(true, 'https://foo/bar')
  const prm = proxy.deleteStation('station-1-1').then((data) => {
    expect(data).toBe(undefined)
    return proxy.fetchStations()
  }).then((result2) => {
    expect(result2.length).toEqual(2)
  })
  return prm
})


test('Updating stations should update data on the remote', () => {
  const proxy = makeRemoteProxy(true, 'https://foo/bar')
  const newData = {
    'name': 'station-1-1',
    'contact': 'new-contact',
    'phone': '23456',
    'is_start': true,
    'is_end': true,
    'order': 200
  }
  const prm = proxy.updateStation('station-1-1', newData).then((data) => {
    expect(data).toBe(undefined)
    return proxy.fetchStation('station-1-1')
  }).then((result2) => {
    expect(result2).toEqual(newData)
  })
  return prm
})
