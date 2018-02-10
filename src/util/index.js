export default {
  getStateIcon: function (stateName) {
    switch (stateName) {
      case 'unknown':
        return 'radio_button_unchecked'
      case 'arrived':
        return 'radio_button_checked'
      case 'finished':
        return 'check'
      case 'unreachable':
        return 'clear'
      default:
        return 'radio_button_unchecked'
    }
  }
}
