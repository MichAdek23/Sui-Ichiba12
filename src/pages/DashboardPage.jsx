import React, { useState, useEffect, Suspense } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom'; // Import Link
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUser, faBox, faHandshake, faCog, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import styled, { keyframes } from 'styled-components';

// Dynamically import pages using React.lazy
const ProfilePage = React.lazy(() => import('./ProfilePage'));
const MyProductsPage = React.lazy(() => import('./MyProductsPage'));
const EscrowPage = React.lazy(() => import('./EscrowPage'));
const DepositPage = React.lazy(() => import('./DepositPage'));
const Settings = React.lazy(() => import('./Settings'));
const AddProduct = React.lazy(() => import('./AddProduct'));

const DashboardPage = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [userBalance, setUserBalance] = useState(0); // Add userBalance state
  const [userName, setUserName] = useState(''); // Add userName state
  const [userAvatar, setUserAvatar] = useState(''); // Add userAvatar state
  const auth = getAuth();
  const user = auth.currentUser;
  const db = getFirestore();
  const navigate = useNavigate();
  const [productsCount, setProductsCount] = useState(0);
  const [escrowsCount, setEscrowsCount] = useState(0);
  const [notificationsCount, setNotificationsCount] = useState(0);

  // Sign out function
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/sign-in');  // Redirect to sign-in page after logout
    } catch (err) {
      console.error('Sign-out failed', err.message);
    }
  };

  const loadUserData = async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log(userData);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadUserBalance = async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserBalance(userData.balance || 0);
      }
    } catch (error) {
      console.error('Error loading user balance:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserName(user.displayName || ''); // Set displayName from Firebase Auth
        setUserAvatar(user.photoURL || 'default-avatar-url'); // Set avatar from Firebase Auth

        loadUserData(user.uid); // Optionally load additional user data from Firestore
        loadUserBalance(user.uid); // Load user balance from Firestore
      } else {
        navigate('/sign-in');
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  useEffect(() => {
    const userId = user?.uid; // Get the current user's UID

    if (userId) {
      // Fetch products count for the logged-in user
      const fetchProducts = async () => {
        try {
          const q = query(collection(db, "products"), where("userId", "==", userId)); // Filter products by userId
          const querySnapshot = await getDocs(q);
          setProductsCount(querySnapshot.size); // Count the number of products listed by the user
        } catch (err) {
          console.error('Error fetching products:', err);
        }
      };

      // Fetch active escrows count for the logged-in user
      const fetchEscrows = async () => {
        try {
          const q = query(collection(db, "escrows"), where("userId", "==", userId)); // Filter escrows by userId
          const querySnapshot = await getDocs(q);
          const activeEscrows = querySnapshot.docs.filter(doc => doc.data().status === 'active'); // Filter active escrows
          setEscrowsCount(activeEscrows.length); // Count active escrows
        } catch (err) {
          console.error('Error fetching escrows:', err);
        }
      };

      // Fetch notifications count for the logged-in user
      const fetchNotifications = async () => {
        try {
          const q = query(collection(db, "notifications"), where("userId", "==", userId)); // Filter notifications by userId
          const querySnapshot = await getDocs(q);
          setNotificationsCount(querySnapshot.size); // Count the number of notifications for the user
        } catch (err) {
          console.error('Error fetching notifications:', err);
        }
      };

      // Run the fetch functions
      fetchProducts();
      fetchEscrows();
      fetchNotifications();
    }

  }, [user?.uid, db]); // Only re-run effect if user UID changes


  // Render the dashboard content
  const renderDashboard = () => (
    <DashboardOverview>
      <OverviewHeader>
        <h3>Welcome, {userName ? userName.split(' ')[0] : user.uid}!</h3>
        <p>Here’s an overview of your available balance and actions.</p>
      </OverviewHeader>
      <DepositSection>
        <DepositCard>
          <h4>Your Available Balance</h4>
          <BalanceAmount>{`SUI ${userBalance.toFixed(2)}`}</BalanceAmount>
          <DepositButton onClick={() => setActiveSection('deposit')}>Deposit Funds</DepositButton>
        </DepositCard>
      </DepositSection>
      <StatsSection>
        <StatCard>
          <h4>Products Listed</h4>
          <p>{productsCount}</p>
        </StatCard>
        <StatCard>
          <h4>Active Escrows</h4>
          <p>{escrowsCount}</p>
        </StatCard>
        <StatCard>
          <h4>Notifications</h4>
          <p>{notificationsCount}</p>
        </StatCard>
      </StatsSection>
      <ActionLinks>
        <AddProductButton onClick={() => setActiveSection('add_product')}>
          Add New Product
        </AddProductButton>
      </ActionLinks>
    </DashboardOverview>
  );

  return (
    <DashboardWrapper>
      <SidebarWrapper isVisible={isSidebarVisible}>
        <SidebarToggle isOpen={isSidebarVisible} onClick={() => setIsSidebarVisible(!isSidebarVisible)}>
          &#9776;
        </SidebarToggle>
        <Logo>Sui-Ichiba</Logo>
        <ProfileSection>
          <Avatar src={userAvatar || ''} /> {/* Display the user's avatar */}
          <UserName>{userName || 'User'}</UserName> {/* Display the user's name */}
          <UserBadge>PRO</UserBadge>
        </ProfileSection>
        <NavSection>
          <SidebarLink to="#" onClick={() => setActiveSection('dashboard')}>
            <Icon>
              <FontAwesomeIcon icon={faHome} />
            </Icon>{' '}
            Dashboard
          </SidebarLink>
          <SidebarLink to="#" onClick={() => setActiveSection('profile')}>
            <Icon>
              <FontAwesomeIcon icon={faUser} />
            </Icon>{' '}
            Profile
          </SidebarLink>
          <SidebarLink to="#" onClick={() => setActiveSection('myproducts')}>
            <Icon>
              <FontAwesomeIcon icon={faBox} />
            </Icon>{' '}
            Products
          </SidebarLink>
          <SidebarLink to="#" onClick={() => setActiveSection('escrows')}>
            <Icon>
              <FontAwesomeIcon icon={faHandshake} />
            </Icon>{' '}
            Escrows
          </SidebarLink>
          <SidebarLink to="#" onClick={() => setActiveSection('settings')}>
            <Icon>
              <FontAwesomeIcon icon={faCog} />
            </Icon>{' '}
            Settings
          </SidebarLink>
          <SidebarLink to="#" onClick={handleSignOut}>
            <Icon>
              <FontAwesomeIcon icon={faSignOutAlt} />
            </Icon>{' '}
            Log out
          </SidebarLink>
        </NavSection>
      </SidebarWrapper>

      <MainContent sidebarOpen={isSidebarVisible}>
        <Suspense fallback={<LoadingSpinner />}>
          {activeSection === 'profile' && <ProfilePage />}
          {activeSection === 'myproducts' && <MyProductsPage />}
          {activeSection === 'escrows' && <EscrowPage />}
          {activeSection === 'deposit' && <DepositPage />}
          {activeSection === 'settings' && <Settings />}
          {activeSection === 'add_product' && <AddProduct />}
          {activeSection === 'dashboard' && renderDashboard()}
        </Suspense>
      </MainContent>
    </DashboardWrapper>
  );
};

export default DashboardPage;


/// Main Dashboard Wrapper
const DashboardWrapper = styled.div`
display: flex;
min-height: 100vh;
background-color: #f4f4f9;
position: relative; /* Needed for sidebar toggle */
`;

// Loading Spinner animation
const spin = keyframes`
0% { transform: rotate(0deg); }
100% { transform: rotate(360deg); }
`;

// Loading spinner styled component
const LoadingSpinner = styled.div`
border: 4px solid #f3f3f3; /* Light grey color for the spinner's background */
border-top: 4px solid #3498db; /* Blue color for the top section */
border-radius: 50%;
width: 50px;
height: 50px;
animation: ${spin} 2s linear infinite;
margin: 100px auto; /* Center the spinner vertically and horizontally */
`;

// Sidebar Styling
const Sidebar = styled.aside`
width: ${(props) => (props.isOpen ? "250px" : "0")};
overflow: hidden;
background: linear-gradient(180deg, #0d141d, #182a36);
padding: ${(props) => (props.isOpen ? "20px" : "0")};
color: white;
display: flex;
flex-direction: column;
align-items: center;
gap: 20px;
height: 100vh;
border-radius:30%;
position: fixed;
left: 0;
top: 0;
z-index: 1000;
transition: all 0.3s ease;
`;

// Sidebar Toggle Button
const SidebarToggle = styled.button`
position: absolute;
top: 15px;
left: ${(props) => (props.isOpen ? "260px" : "15px")};
background-color: #182a36;
color: white;
border: none;
padding: 10px 15px;
border-radius: 5px;
cursor: pointer;
z-index: 1100;

&:hover {
  background-color: #1c7ed6;
}

@media (min-width: 768px) {
  display: none;  /* Hide toggle button on larger screens */
}
`;

// Swipe Gesture Area
const SwipeArea = styled.div`
width: 30px;
height: 100%;
position: fixed;
top: 0;
left: 0;
z-index: 900;

@media (min-width: 768px) {
  display: none;
}
`;

const Logo = styled.h2`
color: #d1f4d1;
font-size: 1.5em;
font-weight: bold;
text-align: center;
`;

const SidebarWrapper = styled.div`
display: ${(props) => (props.isVisible ? "flex" : "none")};
flex-direction: column;
position: fixed;
width: 250px;
height: 100%;
background: #0d141d;
color: white;
padding: 20px;
transition: transform 0.3s ease-in-out;
transform: ${(props) =>
  props.isVisible ? "translateX(0)" : "translateX(-100%)"};

@media (min-width: 768px) {
  transform: translateX(0);  /* Sidebar is always visible on desktop */
  display: flex;  /* Always visible on larger screens */
}
`;

// Profile Section
const ProfileSection = styled.div`
display: flex;
flex-direction: column;
align-items: center;
gap: 10px;
`;

const Avatar = styled.img`
width: 80px;
height: 80px;
border-radius: 50%;
margin-bottom: 10px;
`;

const UserBadge = styled.span`
background-color: #28a745;
color: white;
padding: 5px 10px;
border-radius: 12px;
font-size: 0.75em;
margin-top: 5px;
`;

const UserName = styled.h3`
font-size: 1.1em;
color: white;
margin: 10px 0;
text-align: center;
`;

// Sidebar Navigation Links Section
const NavSection = styled.div`
width: 100%;
display: flex;
flex-direction: column;
gap: 10px;
`;

const SidebarLink = styled.a`
color: white;
text-decoration: none;
font-size: 1em;
padding: 10px;
border-radius: 8px;
display: flex;
align-items: center;
background-color: transparent;

&:hover {
  background-color: #1c7ed6;
}

${(props) =>
  props.active &&
  `
  background-color: #1c7ed6;
  font-weight: bold;
`}
`;

// Logout Link Styling
const LogoutLink = styled(Link)`
color: #ff6b6b;
text-decoration: none;
font-size: 1em;
padding: 10px;
border-radius: 8px;
display: flex;
align-items: center;
margin-top: auto;
background-color: transparent;

&:hover {
  background-color: #ff8787;
}
`;

// Main Content Styling
const MainContent = styled.main`
  flex: 1;
  padding: 30px;
  margin-left: ${(props) => (props.sidebarOpen ? "250px" : "")};
  transition: margin-left 0.3s ease;
  background-color: #f9fafb;
  height: 100vh;  // Ensure full height
  overflow-y: auto;  // Add scroll if content overflows

  @media (max-width: 768px) {
    margin-left: 0;
    width: 100%;  // Ensure full width when sidebar is hidden
    height: calc(100vh - 60px);  // Adjust height when sidebar is hidden (you can modify 60px based on header height)
  }
`;
// Dashboard Overview
const DashboardOverview = styled.section`
background-color: white;
padding: 20px;
border-radius: 8px;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

// Header inside Dashboard Overview
const OverviewHeader = styled.div`
h3 {
  margin-bottom: 10px;
}
p {
  color: #555;
  font-size: 1em;
}
`;

// Deposit Section
const DepositSection = styled.section`
margin-top: 20px;
`;

const DepositCard = styled.div`
background-color: white;
padding: 20px;
border-radius: 8px;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const BalanceAmount = styled.p`
font-size: 1.5em;
color: #28a745;
`;

const DepositButton = styled.button`
margin-top: 15px;
padding: 10px;
background-color: #28a745;
color: white;
border: none;
border-radius: 5px;
cursor: pointer;

&:hover {
  background-color: #218838;
}
`;

const AddProductButton = styled.button`
  padding: 10px 20px;
  background-color: #1c7ed6;
  color: white;
  border-radius: 5px;
  text-decoration: none;
  cursor: pointer;
  border: none;

  &:hover {
    background-color: #155db5;
  }
`;
// Stats Section
const StatsSection = styled.section`
  display: flex;
  gap: 20px;
  margin-top: 30px;
  overflow-x: auto;   /* Enable horizontal scrolling */
  padding-bottom: 10px; /* Optional: Adds space at the bottom if needed */
  
  /* Prevent wrapping of cards on smaller screens */
  flex-wrap: nowrap;
  
  /* Optional: If you want to hide scrollbars while scrolling, use the following */
  -webkit-overflow-scrolling: touch;  /* Smooth scrolling on iOS */
`;

// StatCard
const StatCard = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex: 1;
  text-align: center;
  margin: 10px;
  box-sizing: border-box;
  min-width: 250px;   /* Prevent cards from shrinking too small */
  
  /* Responsive adjustments */
  @media (max-width: 1024px) {
    flex: 1 1 45%;  /* Two columns for medium screens */
    margin: 10px;
  }

  @media (max-width: 768px) {
    flex: 1 1 48%;  /* Stacks in two columns for smaller screens */
    padding: 15px;   /* Reduce padding on smaller screens */
  }

  @media (max-width: 480px) {
    flex: 1 1 100%;  /* Full width for very small screens */
    padding: 10px;   /* Further reduce padding */
  }
`;

const Icon = styled.span`
  margin-right: 10px;
  display: inline-block;
`;

// Action Links
const ActionLinks = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 20px;
  justify-content: center; /* Center the links by default */

  /* Responsive adjustments */
  @media (max-width: 1024px) {
    gap: 20px;  /* Increase gap slightly for medium screens for a spacious feel */
  }

  @media (max-width: 768px) {
    flex-direction: column;  /* Stack the links vertically on smaller screens */
    gap: 15px;  /* Maintain some spacing between stacked items */
    align-items: center; /* Center the items when stacked */
  }

  @media (max-width: 480px) {
    flex-direction: column;  /* Keep items stacked on very small screens */
    gap: 10px;  /* Reduce gap for a tighter layout */
    align-items: center; /* Ensure centered alignment on very small screens */
  }
;


a {
  padding: 10px 20px;
  background-color: #1c7ed6;
  color: white;
  border-radius: 5px;
  text-decoration: none;

  &:hover {
    background-color: #155db5;
  }
}
`;

const ErrorMessage = styled.p`
color: red;
font-size: 1em;
margin-top: 20px;
`;

const SkeletonLoader = styled.div`
width: 100%;
height: 20px;
background-color: #ddd;
margin: 10px 0;
animation: skeleton 1.5s infinite ease-in-out;

@keyframes skeleton {
  0% { background-color: #ddd; }
  50% { background-color: #f4f4f4; }
  100% { background-color: #ddd; }
}
`;

export {
DashboardWrapper,
Sidebar,
SidebarToggle,
SwipeArea,
LoadingSpinner,
Logo,
SidebarWrapper,
ProfileSection,
Avatar,
UserBadge,
UserName,
NavSection,
SidebarLink,
LogoutLink,
MainContent,
DashboardOverview,
OverviewHeader,
DepositSection,
DepositCard,
BalanceAmount,
DepositButton,
StatsSection,
StatCard,
ActionLinks,
ErrorMessage,
SkeletonLoader,
};
