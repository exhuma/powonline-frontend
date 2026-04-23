/**
 * Permission definitions for role-based access control.
 *
 * Each entry maps a permission name to the list of roles that are granted that
 * permission. To check whether a user has a permission, call `hasPermission`
 * with the user's role list.
 *
 * Roles:
 *   - `admin`           — full administrative access
 *   - `station_manager` — access to a single assigned station's dashboard
 */

export type Permission =
  /** Grants access to the dashboard of *any* station (all-station overview). */
  'manage-all-stations'

/** Maps each permission to the roles that are granted it. */
const ROLE_PERMISSIONS: Record<Permission, string[]> = {
  'manage-all-stations': ['admin']
}

/**
 * Returns `true` if any of the provided `userRoles` grants the given
 * `permission`.
 */
export function hasPermission(
  userRoles: string[],
  permission: Permission
): boolean {
  const grantedTo = ROLE_PERMISSIONS[permission] ?? []
  return userRoles.some((role) => grantedTo.includes(role))
}
