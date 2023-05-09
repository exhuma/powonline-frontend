# Admin Manual

## Station Details

Accessing the "Station List" provides an option to modify stations.

Important Options:

- "Station Ordering" defines the "sorting" used for stations
- "Departure Station" marks this station as the beginning of the trail. When a
  team is marked as "arrived" on this station, the "effective start time" is
  registered.
- "Arrival Station" marks this station as the end of the trail. When a
  team is marked as "arrived" on this station, it is automatically flagged as
  "finished".

![Station List](/src/assets/manual/images/station-list.png 'Station List')

## Team List & Details

::: admonition tip
This can be used to mark a team as "cancelled" or "finished" even if they did
not pass the "arrival station". This gives valuable information to station
staff. They will see a "cancelled" team and will know that they don't have to
wait for that team.
:::

![Team List](/src/assets/manual/images/team-list.png 'Team List')
![Team Panel](/src/assets/manual/images/team-panel.png 'Team Panel')

If you're logged in, and have been granted access to a station, the
"station-dashboard" will become available for that station.

![Station Dashboard](/src/assets/manual/images/station-dashboard.png 'Station Dashboard')

The station-dashboard has a lot of features in one view. These are (in order of
importance):

## Upload Management

As "Admin" you have access to view and delete any photo from the system if
necessary.

This includes both images submitted via e-mail or via direct-upload.

## Route Management

This view is used to add, edit or remove routes from the system.

::: admonition warning
This view is currently a bit tricky to use. Especially assigning stations and
teams to routes. This is currently not needed for Lost XX and will be reworked
in a future version.
:::

## User Management

This view is used to add, edit or remove users from the system.

::: admonition important
For users to have access to the station dashboard they must be flagged as
"station_manager" and need to have at least one station assigned to them!
:::

![User Panel](/src/assets/manual/images/user-panel.png 'User Panel')

## Audit Log

This view shows a chronological history of score- and state-changes for each
team across all stations.

This can prove helpful to retrace changes in scores in case of doubt or upon
request.

![Audit Log](/src/assets/manual/images/audit-log.png 'Audit Log')
