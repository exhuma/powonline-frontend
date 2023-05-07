export default {
  getStateIcon: function (stateName) {
    switch (stateName) {
      case 'unknown':
        return 'mdi-radiobox-blank'
      case 'arrived':
        return 'mdi-radiobox-indeterminate-variant'
      case 'finished':
        return 'mdi-radiobox-marked'
      case 'unreachable':
        return 'mdi-cancel'
      default:
        return 'mdi-radiobox-blank'
    }
  }
}
