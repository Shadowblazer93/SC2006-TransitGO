import { useNavigate } from "react-router-dom";

//Styles
const buttonStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  gap: "15px",
  backgroundColor: "#FBFBFB",
  border: "1px solid #EBEBEB",
  borderRadius: "10px",
  padding: "20px",
  width: "100%",
  textAlign: "left",
  cursor: "pointer",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
};

const iconStyle = {
  width: "24px",
  height: "24px",
  marginTop: "4px", // Vertically aligns icon with text
};

const contentStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "5px",
  flex: 1,
};

const headerStyle = {
  fontSize: "18px",
  fontWeight: "600",
  margin: "0",
  color: "#333",
  display: "flex",
  alignItems: "center",
};

const descStyle = {
  fontSize: "14px",
  color: "#777",
  margin: "0",
  lineHeight: "1.4",
};

const Homepage_Button = ({ icon, header, desc, route }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(route);
  };

  return (
    <div style={{ marginTop: "30px", textAlign: "left" }}>
      <button
        type="button"
        className="btn"
        style={buttonStyle}
        onClick={handleClick}
      >
        <img src={icon} alt={header} style={iconStyle} />
        <div style={contentStyle}>
          <h2 style={headerStyle}>{header}</h2>
          <p style={descStyle}>{desc}</p>
        </div>
      </button>
    </div>
  );
};

export default Homepage_Button;
