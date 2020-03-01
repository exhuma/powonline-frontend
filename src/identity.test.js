/* eslint-env jest */
import {Identity} from './identity.js'
import makeRemoteProxy from './remoteProxy.js'
import jwt_decode from 'jwt-decode' // eslint-disable-line camelcase


test('Logging in onto the backend should be initialised with a valid token', () => {
  const proxy = makeRemoteProxy(true, 'https://foo.bar')
  const prm = Identity.login('username', 'password', proxy)
    .then((identity) => {
      const now = (new Date()).getTime()/1000
      expect(identity.username).toEqual('john.doe')
      expect(identity.roles).toEqual(['admin'])
      expect(identity.exp).toBeGreaterThan(now)
      expect(identity.iat).toBeLessThan(now)
    })
  return prm
})

test('Identity Information should be available in the token too', () => {
  const fake_token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImpvaG4uZG9lIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0Ijo2NjI2ODQ0MDAsImV4cCI6MzI0NzIxNDA0MDB9.4MGvoPOO_394gskFiSa3_hAOQcj5pE3vXKm1byO_jo4'
  const identity = Identity.fromToken(fake_token)
  const decoded = jwt_decode(identity.token)
  expect(identity.username).toEqual(decoded.username)
  expect(identity.roles).toEqual(decoded.roles)
  expect(identity.exp).toEqual(decoded.exp)
  expect(identity.iat).toEqual(decoded.iat)
})

test('Identity should be detected as expired', () => {
  let identity = new Identity('jdoe', [], 0, 0, '', null)
  expect(identity.isExpired()).toBe(true)
  let exp = (new Date().getTime()/1000) - 500
  identity = new Identity('jdoe', [], 0, exp, 'foo', null)
  expect(identity.isExpired()).toBe(true)
  exp = (new Date().getTime()/1000) + 500
  identity = new Identity('jdoe', [], 0, exp, 'foo', null)
  expect(identity.isExpired()).toBe(false)
})


test('Token should be renewable', () => {
  const fake_token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImpvaG4uZG9lIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0Ijo2NjI2ODQ0MDAsImV4cCI6MzI0NzIxNDA0MDB9.4MGvoPOO_394gskFiSa3_hAOQcj5pE3vXKm1byO_jo4'
  const identity = Identity.fromToken(fake_token)
  const proxy = makeRemoteProxy(true, 'https://foo.bar')
  identity.backend = proxy
  identity.renew()
})


test('Token should be clearable without resetting the retries', () => {
  const fake_token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImpvaG4uZG9lIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0Ijo2NjI2ODQ0MDAsImV4cCI6MzI0NzIxNDA0MDB9.4MGvoPOO_394gskFiSa3_hAOQcj5pE3vXKm1byO_jo4'
  const identity = Identity.fromToken(fake_token)
  identity.failedRenewals = 1
  identity.clear()
  expect(identity.token).toEqual('')
  expect(identity.roles).toEqual([])
  expect(identity.failedRenewals).not.toEqual(0)
})


test('Token should be clearable with the retries', () => {
  const fake_token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImpvaG4uZG9lIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0Ijo2NjI2ODQ0MDAsImV4cCI6MzI0NzIxNDA0MDB9.4MGvoPOO_394gskFiSa3_hAOQcj5pE3vXKm1byO_jo4'
  const identity = Identity.fromToken(fake_token)
  identity.failedRenewals = 1
  identity.clear(true)
  expect(identity.token).toEqual('')
  expect(identity.roles).toEqual([])
  expect(identity.failedRenewals).toEqual(0)
})
