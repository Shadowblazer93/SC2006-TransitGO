//Import components
import Homepage_Button from "../../components/Homepage_Button";
import Top_Bar from "../../components/Top_Bar";

//Import image assets
import feedbackIcon from "../../assets/Admin/feedback.png";
import userIcon from "../../assets/Admin//userAccounts.png";
import metricsIcon from "../../assets/Admin/metrics.png";
import heatmapIcon from "../../assets/Admin/issueHeatmap.png";
import annoucementIcon from "../../assets/Admin/annoucements.png";
import adminProfile from "../../assets/Admin/adminProfile.png";

function AdminHomePage() {
  const features = [
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
      route: "/UserAccounts",
    },
    {
      icon: metricsIcon,
      header: "System Metrics",
      desc: "Track performance and API up-time",
      route: "/SystemMetrics",
    },
    {
      icon: heatmapIcon,
      header: "Issue Heatmaps",
      desc: "Visualise high-impact problem zones",
      route: "/IssueHeatmap",
    },
    {
      icon: annoucementIcon,
      header: "Annoucements",
      desc: "Broadcast important updates to all users",
      route: "/Annoucements",
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
