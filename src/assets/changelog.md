# v2019.05.9 <small class="release-date">2019-05-10</small>

## Bugfixes

- Force auto-refresh on scoreboard

# v2019.05.9 <small class="release-date">2019-05-10</small>

## Bugfixes

- Force auto-refresh on scoreboard

# v2019.05.8 <small class="release-date">2019-05-10</small>

## Bugfixes

- Show error message on station dashboard if remote call fails

# v2019.05.7 <small class="release-date">2019-05-10</small>

## Highlights

- New "audit-log" which lists all changes to team scores

## Quality-of-Life improvments

- Team contact info is now displayed to staff members

# v2019.05.6 <small class="release-date">2019-05-09</small>

## Quality-of-Life improvments

- Photo gallery now updates automatically
- Deleting files now prompts for a confirmation
- Photo gallery is sorted by file-date

# v2019.05.5 <small class="release-date">2019-05-09</small>

## Highlights

- Replace tab-based filtering on station dashboards with checkboxes

## Quality-of-Life improvments

- Add activity indicators on most actions.<br /><small>
  This helps on slow connections, telling the user that something is still
  happening.</small>
- Improved progress bar design (less intrusive)
- Increase font-size of team names in station dashboards
- Add fake fullscreen to "live image" view
- Show the error-reason on failed uploads
- Remove "team-list" and "station-list" from non-authenticated users.<br /><small>
  The views did not bring any added value. Removing them simplifies the page.</small>

## Bugfixes

- Fix file uploads
- Change handling of site-configuration. This should avoid accidentally disabling social logins.

# v2019.05.4 <small class="release-date">2019-05-07</small>

## Highlights

- Add progress bar to image uploads
- Add a photo gallery
- Add a <tt>/live-image</tt> URL. This displays photos as soon as they arrive in the system

## Bugfixes

- Remote-call error handlers did not correctly show the error in the logs.

# v2019.05.3 <small class="release-date">2019-05-05</small>

## Highlights

- Some sensitive information was leaked to non-admins. This has been fixed
- Support for Image Uploads (uses the camera on supported mobile phones)

## Quality-of-Life improvments

- More non-intrusive pop-ups on errors and successes
- The bootom navigation panel no longer covers page content
- Team list should render a bit faster now
- Rudimentary validation added on team forms (should make errors more understandable)

# v2019.05.2 <small class="release-date">2019-05-04</small>

## Highlights

- **Add a "filter" text-box to team lists (both in the admin, and the station dashboard)**
- Stations can now also be flagged for "arrival" station. This flag is used to automatically set the "finish time" of a team
- Allow admins to change the route color
- Allow admins to change the finish time of a team
- Add date-picker for team times. <small>This ensures the date is correct if a team arrives after midnight</small>

## Quality-of-Life improvments

- Time pickers in the team information have been simplified
- The scoreboard now highlights team which have cancelled the event
- Routes are now sorted by name in the admin interface
- Make phone numbers & e-mails clickable
- Login dialog simplified
- Team list simplified
- Added this changelog
