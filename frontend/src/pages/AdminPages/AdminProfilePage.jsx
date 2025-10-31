import { useNavigate } from "react-router-dom";

//Import Components
import Top_Bar_Return from "../../components/Top_Bar_Return";

//Import Icons/Images
import adminProfile from "../../assets/Admin/adminProfile.png";

//CSS
const profileContainer = {
  maxWidth: "400px",
  margin: "40px auto",
  padding: "5px",
  borderRadius: "12px",
};

const profileStyle = {
  display: "block",
  margin: "0 auto 20px",
  width: "80px",
  height: "80px",
  borderRadius: "50%",
  overflow: "hidden",
  border: "2px solid #e0e0e0",
};

const headerStyle = {
  display: "block",
  fontSize: "18px",
  fontWeight: "600",
  color: "#000000ff",
  marginTop: "24px",
  marginBottom: "4px",
  padding: "1px",
};

const dataStyle = {
  display: "block",
  fontSize: "16px",
  color: "#555",
  marginBottom: "12px",
  wordBreak: "break-all",
  padding: "1px",
};

const actionDescStyle = {
  display: "block",
  fontSize: "16px",
  color: "#007aff",
  marginBottom: "12px",
  cursor: "pointer",
  transition: "color 0.2s ease",
  padding: "1px",
};

function AdminProfilePage({ userName, userEmail }) {
  const navigate = useNavigate();

  const handleActionClick = (route) => {
    navigate(route);
  };
  return (
    <div>
      <Top_Bar_Return
        pageTitle="Admin Profile"
        profileIcon={adminProfile}
        userAdmin={"admin"}
        originalPage={"/AdminHomePage"}
      />
      <div>
        <div style={profileContainer}>
          <img src={adminProfile} alt="profileImg" style={profileStyle} />
        </div>
        <a className="detailHeader" style={headerStyle}>
          User Name
        </a>
        {/*I dont know how to get the username and email from database....pls help*/}
        <a className="detailData" style={dataStyle}>
          {userName}
        </a>

        <a className="detailHeader" style={headerStyle}>
          Email Address
        </a>
        <a className="detailData" style={dataStyle}>
          {userEmail}
        </a>

        <a className="detailHeader" style={headerStyle}>
          Actions
        </a>
        <a
          className="actionDesc"
          style={actionDescStyle}
          onClick={() => handleActionClick("/AdminHomePage")}
        >
          Create New Admin Account
        </a>
        <a
          className="actionDesc"
          style={actionDescStyle}
          onClick={() => handleActionClick("/AdminHomePage")}
        >
          Change Password
        </a>
        <a
          className="actionDesc"
          style={actionDescStyle}
          onClick={() => handleActionClick("/Login")}
        >
          Logout
        </a>
        <a
          className="actionDesc"
          style={actionDescStyle}
          onClick={() => handleActionClick("/AdminHomePage")}
        >
          Delete Account
        </a>
      </div>
    </div>
  );
}

export default AdminProfilePage;
