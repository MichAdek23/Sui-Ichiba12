import React, { useState, useEffect } from 'react';
import { getAuth, signOut, updateProfile } from 'firebase/auth';
import { getDatabase, ref, get, update } from 'firebase/database'; // Firebase Realtime Database
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const ProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhotoURL, setNewPhotoURL] = useState('');
  const [newBio, setNewBio] = useState(''); // State for Bio
  const auth = getAuth();
  const db = getDatabase();

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      setError('');
      try {
        const user = auth.currentUser;
        if (user) {
          const dbRef = ref(db, `users/${user.uid}`);
          const snapshot = await get(dbRef);
          const userProfile = snapshot.exists() ? snapshot.val() : {};

          setUserData({
            name: user.displayName || 'No Name Available',
            email: user.email,
            photoURL: user.photoURL || 'https://via.placeholder.com/150',
            bio: userProfile.bio || 'No bio available.'
          });

          setNewName(user.displayName || '');
          setNewEmail(user.email || '');
          setNewPhotoURL(user.photoURL || 'https://via.placeholder.com/150');
          setNewBio(userProfile.bio || '');
        } else {
          setError('No user is currently signed in.');
        }
      } catch (err) {
        setError('Failed to fetch profile data.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [auth, db]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setError('');
    } catch (err) {
      setError('Failed to sign out.');
    }
  };

  const handleSaveChanges = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        // Update Firebase Authentication Profile
        await updateProfile(user, {
          displayName: newName,
          photoURL: newPhotoURL
        });

        // Update User Bio in Firebase Database
        const userRef = ref(db, `users/${user.uid}`);
        await update(userRef, { bio: newBio });

        setUserData({
          ...userData,
          name: newName,
          photoURL: newPhotoURL,
          bio: newBio
        });
        setIsEditing(false);
      }
    } catch (err) {
      setError('Failed to update profile.');
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPhotoURL(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <ProfileContainer>
      <ProfileHeader>Your Profile</ProfileHeader>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {userData && (
        <ProfileContent>
          <ProfileImage src={newPhotoURL} alt="Profile" />
          <ProfileDetails>
            {isEditing ? (
              <>
                <ProfileInput
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter new name"
                />
                <ProfileInput
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter new email"
                  disabled
                />
                <ProfileInput
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
                <ProfileTextarea
                  value={newBio}
                  onChange={(e) => setNewBio(e.target.value)}
                  placeholder="Enter your bio"
                />
                <SaveButton onClick={handleSaveChanges}>Save Changes</SaveButton>
                <CancelButton onClick={() => setIsEditing(false)}>Cancel</CancelButton>
              </>
            ) : (
              <>
                <ProfileDetail>
                  <strong>Name:</strong> {userData.name}
                </ProfileDetail>
                <ProfileDetail>
                  <strong>Email:</strong> {userData.email}
                </ProfileDetail>
                <ProfileDetail>
                  <strong>Bio:</strong> {userData.bio}
                </ProfileDetail>
                <EditButton onClick={() => setIsEditing(true)}>Edit Profile</EditButton>
              </>
            )}
            <SignOutButton onClick={handleSignOut}>Sign Out</SignOutButton>
          </ProfileDetails>
        </ProfileContent>
      )}
    </ProfileContainer>
  );
};

export default ProfilePage;

// Styled Components
const ProfileTextarea = styled.textarea`
  width: 80%;
  height: 80px;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  resize: none;
`;



const ProfileContainer = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  background-color: #f4f7fa;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
`;

const ProfileHeader = styled.h2`
  font-size: 2rem;
  text-align: center;
  color: #333;
  margin-bottom: 20px;
`;

const ErrorMessage = styled.p`
  color: #e74c3c;
  text-align: center;
  font-size: 1rem;
  margin: 10px 0;
`;

const LoadingSpinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: ${spin} 2s linear infinite;
  margin: 100px auto;
`;

const ProfileContent = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  padding: 30px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const ProfileImage = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 4px solid #fff;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const ProfileDetails = styled.div`
  width: 100%;
  text-align: center;
  margin-top: 20px;
`;

const ProfileDetail = styled.p`
  font-size: 1.2rem;
  margin: 10px 0;
  color: #333;
`;

const ProfileInput = styled.input`
  width: 80%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
`;

const EditButton = styled.button`
  background-color: #3498db;
  color: #fff;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 10px;
  &:hover {
    background-color: #2980b9;
  }
`;

const SaveButton = styled.button`
  background-color: #2ecc71;
  color: #fff;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 10px;
  &:hover {
    background-color: #27ae60;
  }
`;

const CancelButton = styled.button`
  background-color: #e74c3c;
  color: #fff;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 10px;
  &:hover {
    background-color: #c0392b;
  }
`;

const SignOutButton = styled.button`
  background-color: #f39c12;
  color: #fff;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 20px;
  &:hover {
    background-color: #e67e22;
  }
`;
