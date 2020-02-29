/* eslint-env jest */
import {LostTrackerAPI} from './lost_tracker_api.js'

test('test-title', () => {
  const result = LostTrackerAPI.fetchRoutes()
  const expected = [{
    name: 'Fake Route 1',
  }, {
    name: 'Fake Route 2',
  }]
  expect(result).toEqual(expected)
})
