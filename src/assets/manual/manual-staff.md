# Staff Manual

## Important Concepts

### Team "states"

A team can be in one of three different "states" for each station:

- Unknown/Pending: The team has not yet arrived on the station
- Arrived/Playing: The team has arrived at the station
- Finished: The team has left the station

These three states are shown as icons throughout the application:

- Unknown/Pending: ![Pending](/manual/images/icon-pending.png 'State Icon: Pending')
- Arrived/Playing: ![Arrived](/manual/images/icon-arrived.png 'State Icon: Arrived')
- Finished: ![Finished](/manual/images/icon-finished.png 'State Icon: Finished')

### Finished Teams

A team can be considered as "done" with the event through various means:

- The team has been marked as "finished" on the arrival station (the station
  must be configured as "arrival" in the system).
- The staff manually marks the team as "cancelled"
- The staff manually marks the team as "finished"

::: admonition important
**Staff**: Marking a team as "finished" or "cancelled" gives valuable
information to stations. This information is shown on the station dashboard. It
lets stations know that they no longer need to wait for those teams. The staff
should make sure that this information is kept up-to-date and correct.

The states "cancelled" and "finished" are displayed slightly differently in the
user-interface.
:::

---

## Station List

The Station List shows all stations registered for the event. This view can be
used by administrators to add, remote and/or edit stations.

![Station List](/manual/images/station-list.png 'Station List')

## Station Dashboard

::: admonition tip
This is the main view for the event staff managing a station and can be accessed
by clicking on the "Clipboard" icon in the station list:

![Clipboard](/manual/images/clipboard.png 'Clipboard')
:::

If you're logged in, and have been granted access to a station, the
"station-dashboard" will become available for that station.

![Station Dashboard](/manual/images/station-dashboard.png 'Station Dashboard')

The station-dashboard has a lot of features in one view. These are (in order of
importance):

### Team "cards"

Each team is represented by a card. The card can be used to:

- Update the score for this station
- Update the score for the quizz/questionnaire for this station
- Set the "state" (unknown/arrived/finished) by clicking on the state-icon
  button.

### Filter/Find

For convenience, the text-box at the top can be used to quickly find a team by
name or by contact-name. While the "Show finished teams" option is disabled, you
will only see cards for teams that are still in the game. **As soon as you mark
the team as finished** it will be hidden. To see it again (for example if you
accidentally click the button) you can find it back by enabling that option.

### Previous/Next Station "peek"

The left/right side of the view display state icons for the stations right
**before** and **after** this station. The names of these stations are displayed
in the corner. Those "peek" areas are clickable to navigate to those stations.

The icons in those areas are **brighter if the change happened recently**. And
the more recent changes are displayed at the top.

For example: If a station has recently marked 5 teams as "finished" you will see
5 green "finished" icons brightly at the top. This gives you an indication that
those 5 teams will soon arrive at your station and you can prepare for the
arrival.

If the icons are faded, the change has happened a while ago and the teams have
probably already passed.

:::admonition tip
Other station dashboards will also be available for convenience. But you will
only be able to modify data from the station you have been granted access to.
:::
