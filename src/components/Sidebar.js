import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import "../styles/sidebar.scss";
import { sidebarData } from "../assets/data/SidebarData";
import { IconButton, List, ListItem, ListItemButton } from "@mui/material";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import { stampReportsList } from "../assets/data/Stamp/stampReportsList";
import { UserContext } from "../contexts/UserContext";

function Sidebar() {
  const { setUser } = useContext(UserContext);
  return (
    <div className="sidebar">
      <List>
      <div className="avatar flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
  <img
    src={require("../assets/images/cmrLogo.png")}
    alt="CMR Logo"
    className="w-36 h-auto object-contain transition-transform hover:scale-105 hover:drop-shadow-xl"
    style={{ 
      maxWidth: '150px', 
      filter: 'brightness(1.1) contrast(1.1)',
    }}
  />
  </div>

        {sidebarData.map((val, index) => {
          const { id, icon, name, url } = val;

          return (
            <div key={id}>
              <ListItem disableGutters={true} className="sidebar-listItem">
                {name === "Reports" ? (
                  <ListItemButton
                    sx={{ textAlign: "left" }}
                    className="appbar-links"
                    style={{ padding: "5px 0" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "0 10px",
                      }}
                    >
                      <IconButton sx={{ color: "#ffffff9f" }}>
                        {icon}
                      </IconButton>
                      <p className="sidebar-list-text">{name}</p>
                    </div>
                  </ListItemButton>
                ) : (
                  <NavLink to={`/${url}`} key={id} className="sidebar-link">
                    <ListItemButton
                      sx={{ textAlign: "left" }}
                      className="appbar-links"
                      style={{ padding: "5px 0" }}
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <IconButton sx={{ color: "#ffffff9f" }}>
                          {icon}
                        </IconButton>
                        <p className="sidebar-list-text">{name}</p>
                      </div>
                    </ListItemButton>
                  </NavLink>
                )}
              </ListItem>

              {/* Add Camera Section after Dashboard */}
              {name === "Dashboard" && (
                <ListItem disableGutters={true} className="sidebar-listItem">
                  <NavLink to="/CameraManagement" className="sidebar-link">
                    <ListItemButton
                      sx={{ textAlign: "left" }}
                      className="appbar-links"
                      style={{ padding: "5px 0" }}
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <IconButton sx={{ color: "#ffffff9f" }}>
                          <CameraAltIcon />
                        </IconButton>
                        <p className="sidebar-list-text">Add Camera</p>
                      </div>
                    </ListItemButton>
                  </NavLink>
                </ListItem>
              )}

              {name === "Reports" &&
                stampReportsList.map((list) => {
                  return (
                    <ListItem
                      disableGutters={true}
                      key={list.id}
                      className="sidebar-listItem"
                    >
                      <NavLink
                        to={`/${list.url}`}
                        key={id}
                        className="sidebar-link"
                      >
                        <ListItemButton
                          sx={{ textAlign: "left" }}
                          className="appbar-links"
                          style={{ padding: "5px 0" }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: "0 15px",
                            }}
                          >
                            <IconButton sx={{ color: "#ffffff9f" }}>
                              {icon}
                            </IconButton>
                            <p className="sidebar-list-text">{list.name}</p>
                          </div>
                        </ListItemButton>
                      </NavLink>
                    </ListItem>
                  );
                })}
            </div>
          );
        })}

        <ListItem
          sx={{ textAlign: "left" }}
          className="sidebar-listItem"
          style={{
            padding: "5px 0",
          }}
        >
          <div className="sidebar-link">
            <ListItemButton
              sx={{ textAlign: "left" }}
              className="appbar-links"
              onClick={() => {
                setUser(null);
                localStorage.removeItem("stampToken");
              }}
              style={{
                padding: "5px 0",
              }}
            >
              {/* <div style={{ display: "flex", alignItems: "center" }}>
                <IconButton sx={{ color: "#ffffff9f" }}>
                  <LogoutRoundedIcon />
                </IconButton>
                <p className="sidebar-list-text">Logout</p>
              </div> */}
            </ListItemButton>
          </div>
        </ListItem>
      </List>
    </div>
  );
}

export default Sidebar;