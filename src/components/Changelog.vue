<template>
  <center-col id="ChangeLog">
    <div class="white--text text-xs-left">
      <h1>v2019.05.8 <small>Released on 2019-05-10</small></h1>
      <h2>Bugfixes</h2>
      <ul>
        <li>Show error message on station dashboard if remote call fails</li>
      </ul>

    <div class="white--text text-xs-left">
      <h1>v2019.05.7 <small>Released on 2019-05-10</small></h1>
      <h2>Highlights</h2>
      <ul>
        <li>New "audit-log" which lists all changes to team scores</li>
      </ul>
      <h2>Quality-of-Life improvments</h2>
      <ul>
        <li>Team contact info is now displayed to staff members</li>
      </ul>

      <h1>v2019.05.6 <small>Released on 2019-05-09</small></h1>
      <h2>Quality-of-Life improvments</h2>
      <ul>
        <li>Photo gallery now updates automatically</li>
        <li>Deleting files now prompts for a confirmation</li>
        <li>Photo gallery is sorted by file-date</li>
      </ul>

      <h1>v2019.05.5 <small>Released on 2019-05-09</small></h1>
      <h2>Highlights</h2>
      <ul>
        <li><strong>Replace tab-based filtering on station dashboards with checkboxes</strong></li>
      </ul>
      <h2>Quality-of-Life improvments</h2>
      <ul>
        <li>Add activity indicators on most actions.<br />
            <small>This helps on slow connections, telling the user that something is still happening.</small></li>
        <li>Improved progress bar design (less intrusive)</li>
        <li>Increase font-size of team names in station dashboards</li>
        <li>Add fake fullscreen to "live image" view</li>
        <li>Show the error-reason on failed uploads</li>
        <li>Remove "team-list" and "station-list" from non-authenticated users.
            <br /><small>The views did not bring any added value. Removing them simplifies the page.</small></li>
      </ul>
      <h2>Fixes</h2>
      <ul>
        <li>Fix file uploads</li>
        <li>Change handling of site-configuration. This should avoid
        accidentally disabling social logins.</li>
      </ul>

      <h1>v2019.05.4 <small>Released on 2019-05-07</small></h1>
      <h2>Highlights</h2>
      <ul>
        <li>Add progress bar to image uploads</li>
        <li>Add a photo gallery</li>
        <li>Add a <tt>/live-image</tt> URL. This displays photos as soon as
            they arrive in the system</li>
      </ul>
      <h2>Bug Fixes</h2>
      <ul>
        <li>Remote-call error handlers did not correctly show the error in the
            logs.</li>
      </ul>

      <h1>v2019.05.3 <small>Released on 2019-05-05</small></h1>
      <h2>Highlights</h2>
      <ul>
        <li>Some sensitive information was leaked to non-admins. This has been
            fixed</li>
        <li>Support for Image Uploads (uses the camera on supported mobile
            phones)</li>
      </ul>
      <h2>Quality-of-Life improvments</h2>
      <ul>
        <li>More non-intrusive pop-ups on errors and successes</li>
        <li>The bootom navigation panel no longer covers page content</li>
        <li>Team list should render a bit faster now</li>
        <li>Rudimentary validation added on team forms (should make errors more
            understandable)</li>
      </ul>

      <h1>v2019.05.2 <small>Released on 2019-05-04</small></h1>
      <h2>Highlights</h2>
      <ul>
        <li><strong>Add a "filter" text-box to team lists (both in the admin,
            and the station dashboard)</strong></li>
        <li>Stations can now also be flagged for "arrival" station. This flag
            is used to automatically set the "finish time" of a team</li>
        <li>Allow admins to change the route color</li>
        <li>Allow admins to change the finish time of a team</li>
        <li>Add date-picker for team times. <small>This ensures the date is
            correct if a team arrives after midnight</small></li>
      </ul>
      <h2>Quality-of-Life improvments</h2>
      <ul>
        <li>Time pickers in the team information have been simplified</li>
        <li>The scoreboard now highlights team which have cancelled the event</li>
        <li>Routes are now sorted by name in the admin interface</li>
        <li>Make phone numbers & e-mails clickable</li>
        <li>Login dialog simplified</li>
        <li>Team list simplified</li>
        <li>Added this changelog</li>
      </ul>
    </div>
    <v-footer class="pa-3">
        <v-spacer></v-spacer>
        <router-link to="/privacy-policy">Privacy Policy</router-link>
    </v-footer>
  </center-col>
</template>

<style scoped>
H1 {
    margin-top: 1em;
}
LI {
    margin-left: 2em;
}
H1 SMALL {
  font-size: 50%;
  font-weight: normal;
  font-style: italic;
}
</style>
