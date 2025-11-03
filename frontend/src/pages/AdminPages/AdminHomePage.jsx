//Import components
import Homepage_Button from "../../components/Homepage_Button";
import Top_Bar from "../../components/Top_Bar";
import { user_loggedin, user_isadmin } from "../../supabaseClient";
import { useState } from "react";

//Import image assets
import feedbackIcon from "../../assets/Admin/feedback.png";
import userIcon from "../../assets/Admin//userAccounts.png";
import metricsIcon from "../../assets/Admin/metrics.png";
import heatmapIcon from "../../assets/Admin/issueHeatmap.png";
import annoucementIcon from "../../assets/Admin/annoucements.png";
import adminProfile from "../../assets/Admin/adminProfile.png";

function AdminHomePage() {
  // authentication
    const [perms, setPerms] = useState(true)
    user_loggedin().then((res) => {if (!res) setPerms(false)})
    user_isadmin().then((res) => {if (!res) setPerms(false)})
    if (!perms) {return (<div style={{background:'#ffaeaeff', fontWeight:600, fontSize:15, padding: '20px 5px'}}>YOU DO NOT HAVE PERMISSION TO VIEW THIS PAGE</div>)}

  const features = [
    {
      icon: heatmapIcon,
      header: "User Home Page",
      desc: "View the home page for non-admin users.",
      route: "/UserHomePage",
    }
    ,
    {
      icon: feedbackIcon,
      header: "User Feedback",
      desc: "Collect, review, and reply to user insights",
      route: "/Feedback",
    },
    {
      icon: userIcon,
      header: "User Accounts",
      desc: "Manage user access and privileges",
      route: "/UserManagement",
    },
    // {
    //   icon: metricsIcon,
    //   header: "System Metrics",
    //   desc: "Track performance and API up-time",
    //   route: "/SystemMetrics",
    // },
    // {
    //   icon: heatmapIcon,
    //   header: "Issue Heatmaps",
    //   desc: "Visualise high-impact problem zones",
    //   route: "/IssueHeatmap",
    // },
    {
      icon: annoucementIcon,
      header: "Announcements Management",
      desc: "Broadcast important updates to all users",
      route: "/AnnouncementManagement",
    },
  ];

  return (
    <div className="AdminHome">
      <Top_Bar
        pageTitle="Admin Profile"
        profileIcon={adminProfile}
        userAdmin={"admin"}
      />
      {features.map((feature, index) => (
        <Homepage_Button
          key={index}
          icon={feature.icon}
          header={feature.header}
          desc={feature.desc}
          route={feature.route}
        />
      ))}
    </div>
  );
}

export default AdminHomePage;
