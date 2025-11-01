//Import components
import Homepage_Button from "../../components/Homepage_Button";
import Top_Bar from "../../components/Top_Bar";

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
  const features = [
    {
      icon: mapIcon,
      header: "Interactive Map",
      desc: "Explore routes, stations and services",
      route: "/InteractiveMap",
    },
    {
      icon: userIcon,
      header: "Platform Crowdedness",
      desc: "Check live platofrm crowd levels",
      route: "/PlatformCrowdedness",
    },
    {
      icon: trainIcon,
      header: "MRT Services Availability",
      desc: "Check MRT stations' live status",
      route: "/MrtServiceAvailability",
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
      desc: "View saved services and lcoations",
      route: "/Favourites",
    },
    {
      icon: routeIcon,
      header: "Saved Routes",
      desc: "View planned routes",
      route: "/SavedRoutes",
    },
    {
      icon: downloadIcon,
      header: "Downloaded Area",
      desc: "Navigate offline using downloaded map regions",
      route: "/DownloadedArea",
    },
    {
      icon: historyIcon,
      header: "Trip History",
      desc: "View latest trips and searches",
      route: "/TripHistory",
    },
    {
      icon: feedbackIcon,
      header: "Feedback",
      desc: "Track past submission or share new feedback",
      route: "/UserFeedback",
    },
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
    </div>
  );
}

export default UserHomePage;
