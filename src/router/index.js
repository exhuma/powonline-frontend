import Dashboard from "@/components/Dashboard";
import NotFound from "@/components/NotFound";
import Gallery from "@/components/Gallery";
import Scoreboard from "@/components/Scoreboard";
import StationList from "@/components/StationList";
import TeamList from "@/components/TeamList";
import StationDashboard from "@/components/StationDashboard";
import RouteList from "@/components/RouteList";
import UserList from "@/components/UserList";
import Debug from "@/components/Debug";

function getRoutes() {
  const output = [
    {
      path: "/team/:teamName",
      component: NotFound,
      // TODO component: TeamPanel
      inMenu: false,
      availableToAnonymous: true,
    },
    {
      path: "/debug",
      label: "debug",
      icon: "mdi-wrench",
      component: Debug,
      inMenu: true,
      availableToAnonymous: false,
      needsRole: "admin",
    },
    {
      path: "/station/:stationName",
      component: StationDashboard,
      inMenu: false,
      availableToAnonymous: true,
    },
    {
      path: "/matrix",
      label: "Dashboard",
      icon: "mdi-border-all",
      component: Dashboard,
      inMenu: true,
      availableToAnonymous: true,
    },
    {
      path: "/scoreboard",
      label: "Scoreboard",
      icon: "mdi-format-list-numbered",
      component: Scoreboard,
      inMenu: true,
      availableToAnonymous: true,
    },
    {
      path: "/gallery",
      label: "Photos",
      icon: "mdi-image",
      component: Gallery,
      inMenu: true,
      availableToAnonymous: true,
    },
    {
      path: "/station",
      label: "Stations",
      icon: "mdi-map-marker",
      component: StationList,
      inMenu: true,
      availableToAnonymous: false,
    },
    {
      path: "/team",
      label: "Teams",
      icon: "mdi-account-group",
      component: TeamList,
      inMenu: true,
      availableToAnonymous: false,
    },
    {
      path: "/uploads",
      label: "Uploads",
      icon: "mdi-file-upload",
      component: NotFound,
      inMenu: true,
      availableToAnonymous: false,
    },
    {
      path: "/route",
      label: "Routes",
      icon: "mdi-gesture",
      component: RouteList,
      inMenu: true,
      availableToAnonymous: false,
      needsRole: "admin",
    },
    {
      path: "/user",
      label: "Users",
      icon: "mdi-account",
      component: UserList,
      inMenu: true,
      availableToAnonymous: false,
      needsRole: "admin",
    },
    {
      path: "/auditlog",
      label: "Audit",
      icon: "mdi-receipt",
      component: NotFound,
      inMenu: true,
      availableToAnonymous: false,
      needsRole: "admin",
    },
    {
      path: "/changelog",
      label: "Changelog",
      icon: "mdi-playlist-check",
      component: NotFound,
      inMenu: true,
      availableToAnonymous: false,
    },
  ];
  return output;
}

/**
 * Returns only a list of accessible routes.
 *
 * If any of the given roles matches the role needed in a route, it will be
 * included in he output.
 *
 * @param roles A list of user-roles
 */
function accessibleRoutes(roles) {
  const allRoutes = getRoutes();
  const accessible = allRoutes.filter(({ needsRole }) => {
    if (needsRole === undefined || needsRole === null) {
      return true;
    }
    let idx = roles.findIndex((haveRole) => {
      return haveRole === needsRole;
    });
    return idx > -1;
  });
  const inMenu = accessible.filter(({ inMenu }) => {
    return inMenu;
  });
  return inMenu;
}

export { getRoutes, accessibleRoutes };
