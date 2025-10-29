import { useNavigate } from "react-router-dom";

import adminProfile from "../assets/Admin/adminProfile.png";
import backArrow from "../assets/Admin/left-arrow.png";

const barStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "#F8F8F8",
  padding: "15px 20px",
  borderBottom: "1px solid #E0E0E0",
  position: "sticky",
  top: 0,
  zIndex: 1000,
  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
};

const titleStyle = {
  fontSize: "18px",
  fontWeight: "600",
  margin: "0",
  color: "#333",
};

const profileStyle = {
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "36px",
  height: "36px",
  borderRadius: "50%",
  overflow: "hidden",
};

const iconStyle = {
  width: "28px",
  height: "28px",
  borderRadius: "50%",
  objectFit: "cover",
};

const Top_Bar_Return = ({ username, originalPage }) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleBackClick = () => {
    navigate({ originalPage });
  };

  return (
    <div style={barStyle}>
      <div onClick={handleBackClick} style={profileStyle}>
        <img src={backArrow} alt="back" style={iconStyle} />
      </div>
      <h1 style={titleStyle}>{username}</h1>
      <div onClick={handleProfileClick} style={profileStyle}>
        <img src={adminProfile} alt="Profile" style={iconStyle} />
      </div>
    </div>
  );
};

export default Top_Bar_Return;
