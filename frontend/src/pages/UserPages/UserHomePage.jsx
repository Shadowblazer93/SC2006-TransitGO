//Import components
import { user_loggedin, user_isadmin } from "../../supabaseClient";
import { useState } from "react";
import Homepage_Button from "../../components/Homepage_Button";
import Top_Bar from "../../components/Top_Bar";
import FooterNav from "../../components/FooterNav";

//Import image assets
import mapIcon from "../../assets/Admin/issueHeatmap.png";
import userIcon from "../../assets/Admin//userAccounts.png";
import trainIcon from "../../assets/User/train.png";
import calculatorIcon from "../../assets/User/fareCalculator.png";
import favouriteIcon from "../../assets/User/heart.png";
import routeIcon from "../../assets/User/route.png";
import downloadIcon from "../../assets/User/download.png";
import historyIcon from "../../assets/User/history.png";
import feedbackIcon from "../../assets/Admin/feedback.png";

import userProfile from "../../assets/User/userProfile.png";

function UserHomePage() {
  // authentication
  const [perms, setPerms] = useState(true)
  const [admin, setAdmin] = useState(false)
  user_loggedin().then((res) => {if (!res) setPerms(false)})
  user_isadmin().then((res) => {if (res) setAdmin(true)})
  if (!perms) {return (<div style={{background:'#ffaeaeff', fontWeight:600, fontSize:15, padding: '20px 5px'}}>YOU DO NOT HAVE PERMISSION TO VIEW THIS PAGE</div>)}

  const features = [
    {
      icon: mapIcon,
      header: "Interactive Map",
      desc: "Explore routes, stations and services",
      route: "/Routing",
    },
    {
      icon: userIcon,
      header: "Platform Crowdedness",
      desc: "Check live platofrm crowd levels",
      route: "/StationDensityRealTime",
    },
    {
      icon: trainIcon,
      header: "MRT Services Availability",
      desc: "Check MRT stations' live status",
      route: "/TrainServiceAlerts",
    },
    {
      icon: calculatorIcon,
      header: "Fare Calculator",
      desc: "Estimate travel costs to destinations",
      route: "/FareCalculator",
    },
    {
      icon: favouriteIcon,
      header: "Favourites",
      desc: "View saved services and locations",
      route: "/Favourites",
    },
    {
      icon: historyIcon,
      header: "Announcements",
      desc: "View app updates and announcements",
      route: "/Announcements",
    },
    // {
    //   icon: downloadIcon,
    //   header: "Downloaded Area",
    //   desc: "Navigate offline using downloaded map regions",
    //   route: "/DownloadedArea",
    // },
    // {
    //   icon: historyIcon,
    //   header: "Trip History",
    //   desc: "View latest trips and searches",
    //   route: "/TripHistory",
    // },
    {
      icon: feedbackIcon,
      header: "Submit Feedback",
      desc: "Submit a new feedback form",
      route: "/UserFeedback",
    },
    {
      icon: feedbackIcon,
      header: "View Past Feedback",
      desc: "View all submitted feedback forms",
      route: "/UserFeedbackSubmitted",
    }
  ];

  return (
    <div className="UserHome">
      <Top_Bar
        pageTitle="User Profile"
        profileIcon={userProfile}
        userAdmin={"user"}
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
      {admin && (
        <Homepage_Button
          icon={mapIcon}
          header="Admin Home Page"
          desc="Back to Admin Home Page."
          route="/AdminHomePage"
        />
      )}
      <FooterNav />
    </div>
  );
}

export default UserHomePage;
