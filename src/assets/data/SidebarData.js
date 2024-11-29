import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import AssessmentIcon from "@mui/icons-material/Assessment";
import TableViewIcon from "@mui/icons-material/TableView";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import ArticleIcon from "@mui/icons-material/Article";

export const sidebarData = [
  { id: 1, icon: <HomeRoundedIcon />, name: "Dashboard", url: "dashboard" },
  {
    id: 2,
    icon: <AssessmentIcon />,
    name: "Reports",
    url: "reports",
  },
  // {
  //   id: 3,
  //   icon: <TableViewIcon />,
  //   name: "Floor Board",
  //   url: "floorboard",
  // },
  { id: 4, icon: <TaskAltIcon />, name: "SOP", url: "sop" },
  // { id: 5, icon: <ArticleIcon />, name: "Bulletin", url: "bulletin" },
];
