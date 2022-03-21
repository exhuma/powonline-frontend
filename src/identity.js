import jwt_decode from "jwt-decode"; // eslint-disable-line camelcase

const LOG = window.console;

/**
 * This class contains a wrapper around the application authentication
 * mechanism based on JWT.
 *
 * A JWT token for this class must have the keys:
 *
 * @param persistence A helper class for persistent storage of identity
 *    information
 * @param username the login-name as string
 * @param roles A list of strings representing the users roles
 * @param iat The standard JWT iat key
 * @param exp The standard JWT exp key
 */
class Identity {
  constructor(persistence, username, roles, iat, exp, token) {
    this.persistence = persistence;
    this.username = username;
    this.roles = roles;
    this.iat = iat;
    this.exp = exp;
    this.token = token;
    this.failedRenewals = 0;
  }

  /**
   * Creates a new empty, invalid identity
   *
   * @param persistence A helper class for persistent storage of identity
   *    information
   */
  static makeNull(persistence) {
    const instance = new Identity(persistence, "", [], 0, 0, "");
    return instance;
  }

  /**
   * Creates a new identity from a JWT token
   *
   * @param persistence A helper class for persistent storage of identity
   *    information
   * @param token: The JWT token as string
   * @return str returns a new "Identity" instance
   */
  static fromToken(persistence, token) {
    const decoded = jwt_decode(token);
    const instance = new Identity(
      persistence,
      decoded.username,
      decoded.roles,
      decoded.iat || null,
      decoded.exp || null,
      token
    );
    return instance;
  }

  /**
   * Persists the identity token into local storage to be able to retrieve it
   * later.
   */
  persist() {
    this.persistence.save(this);
  }

  /**
   * Check if the identity is valid and usable (even an expired identity is
   * considered "usable")
   */
  isUsable() {
    return this.token !== "";
  }

  /**
   * Determines whether a token has expired or not.
   */
  isExpired() {
    LOG.debug("Checking if current token has expired");
    if (this.token === "") {
      LOG.debug("Empty token (always counts as expired)");
      return true;
    }
    const now = Math.floor(Date.now() / 1000);
    LOG.debug("Token will expire in " + (this.exp - now) + "s");
    if (this.exp <= now) {
      LOG.debug("Security token has expired!");
      return true;
    } else {
      LOG.debug("Security token is still fresh");
      return false;
    }
  }

  /**
   * Check if the token will soon expire, indicating that we should renew as
   * soon as possible.
   * @returns Whether the token needs to be renewed on the next request
   */
  needsRenewal() {
    if (this.isExpired()) {
      return true;
    }
    const now = Math.floor(Date.now() / 1000);
    const remainingSeconds = this.exp - now;
    if (remainingSeconds < 30*60) {
      LOG.debug("Token will expire soon. Renewal advised!");
      return true;
    }
    return false;
  }

  /**
   * Check if the current identity has a given role
   *
   * @param roleName the role name to check
   */
  hasRole(roleName) {
    const idx = this.roles.findIndex((item) => {
      return item === roleName;
    });
    const output = idx > -1;
    return output;
  }

  /**
   * Renews the current token. Note that this will only work for tokens that
   * have not expired yet!

   * @param backend An optional injection point for back-end communications
   */
  renew(backend) {
    LOG.debug("Refreshing token. Failed renewals=" + this.failedRenewals);
    if (this.token === "") {
      return true;
    }
    if (this.failedRenewals > 5) {
      this.clear();
      LOG.error("Too many retries!");
      return false;
    }
    backend
      .renewToken(this.token)
      .then((data) => {
        if (data.status < 300) {
          this.token = data.token;
          this.failedRenewals = 0;
          this.persist();
          return;
        } else {
          LOG.error("Unable to renew the token!");
          this.failedRenewals += 1;
          this.persist();
          return;
        }
      })
      .catch((error) => {
        LOG.error(error);
        this.failedRenewals += 1;
        this.persist();
        return false;
      });
  }

  /**
   * Removes all authentication from this intance
   *
   * @param resetFailedRenewals Whether to set failedRenewals back to 0
   */
  clear(resetFailedRenewals) {
    this.roles = [];
    this.iat = 0;
    this.exp = 0;
    this.token = "";
    if (resetFailedRenewals) {
      this.failedRenewals = 0;
    }
    this.persistence.save(this);
  }
}

/**
 * A persistence helper for the Identity class
 *
 * @param keyName The name under which the identity information is stored
 */
class LocalStorage {
  constructor(keyName) {
    this.keyName = keyName;
  }

  /**
   * Loads an identity instance from local storage
   *
   * @return Identity An identity instance
   */
  load() {
    const token = localStorage.getItem(this.keyName) || "";
    if (token === "") {
      LOG.debug(
        "No identity available in local-storage, returning a dummy entry"
      );
      return new Identity.makeNull(this);
    }
    const failedRenewals = localStorage.getItem("failedRenewals") || 0;
    const instance = Identity.fromToken(this, token);
    instance.failedRenewals = failedRenewals;
    return instance;
  }

  /**
   * Stores an identity to the persistent storage
   *
   * @param identity An identity instance
   */
  save(identity) {
    localStorage.setItem(this.keyName, identity.token);
    localStorage.setItem("failedRenewals", identity.failedRenewals);
  }

  clear() {
    localStorage.removeItem(this.keyName);
    localStorage.removeItem("failedRenewals");
  }
}

export { Identity, LocalStorage };
