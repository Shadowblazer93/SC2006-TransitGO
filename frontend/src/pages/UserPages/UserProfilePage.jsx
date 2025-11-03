import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase, user_loggedin } from "../../supabaseClient";
import { deleteAccount } from "../../services/api";
import FooterNav from "../../components/FooterNav";

//Import Components
import Top_Bar_Return from "../../components/Top_Bar_Return";

//Import Icons/Images
import userProfile from "../../assets/User/userProfile.png";

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

function UserProfilePage() {
  async function getAccessToken() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Error getting session:", error.message);
      return null;
    }

    if (session) {
      return session.access_token;
    } else {
      console.log("No active session found.");
      return null;
    }
  }
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = await getAccessToken();
        if (!token) return;

        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.error("Error fetching user:", error);
          return;
        }

        const user = data.user;
        if (!user || !mounted) return;

        const name = user.display_name || user.email.split("@")[0] || "";
        setUserName(name);
        setUserEmail(user.email || "");
      } catch (err) {
        console.error("Error:", err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const navigate = useNavigate();

  // authentication
  const [perms, setPerms] = useState(true)
  user_loggedin().then((res) => {if (!res) setPerms(false)})
  if (!perms) {return (<div style={{background:'#ffaeaeff', fontWeight:600, fontSize:15, padding: '20px 5px'}}>YOU DO NOT HAVE PERMISSION TO VIEW THIS PAGE</div>)}

  const handleActionClick = (route) => {
    navigate(route);
  };

  async function logout() {
    const { error } = await supabase.auth.signOut(); 
    if (error) console.error(error);
    else navigate("/Login");
}
  async function changePW() {
    navigate("/reset-password");
  }
  return (
    <div>
      <Top_Bar_Return
        pageTitle="User Profile"
        profileIcon={userProfile}
        userAdmin={"user"}
        originalPage={"/UserHomePage"}
      />
      <div>
        <div style={profileContainer}>
          <img src={userProfile} alt="profileImg" style={profileStyle} />
        </div>
        <a className="detailHeader" style={headerStyle}>
          User Name
        </a>

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
          onClick={changePW}
        >
          Change Password
        </a>
        <a
          className="actionDesc"
          style={actionDescStyle}
          onClick={logout}
        >
          Logout
        </a>
        <a
          className="actionDesc"
          style={actionDescStyle}
          onClick={deleteAccount}
        >
          Delete Account
        </a>
      </div>
      <FooterNav />
    </div>
  );
}

export default UserProfilePage;
