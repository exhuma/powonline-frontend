function getAuthInfo() {
  const roles = []
  // TODO const roles = this.$store.state.roles
  // TODO return this.$store.state.userName
  // TODO this.$store.state.jwt
  if (process.env.NODE_ENV === "development") {
    roles.push('admin')
  }
  return {
    jwtToken: '',
    roles: roles,
    userName: 'jdoe',  // TODO Use real value
  }
}

export {
  getAuthInfo
}
