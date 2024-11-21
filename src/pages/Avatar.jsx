import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/storage'; // Firebase Storage for avatar upload

const Avatar = ({ userId }) => {
  const [avatarUrl, setAvatarUrl] = useState('');

  // Fetch the avatar URL when the component loads
  useEffect(() => {
    const fetchAvatar = async () => {
      const userDoc = await firebase.firestore().collection('users').doc(userId).get();
      const avatarPath = userDoc.data()?.avatarPath;

      if (avatarPath) {
        const storageRef = firebase.storage().ref();
        const avatarRef = storageRef.child(avatarPath);
        avatarRef.getDownloadURL().then((url) => {
          setAvatarUrl(url);
        }).catch((error) => {
          console.error("Error fetching avatar:", error);
          setAvatarUrl(''); // Default icon if there's an issue
        });
      } else {
        setAvatarUrl(''); // Default icon if no avatar
      }
    };

    fetchAvatar();
  }, [userId]);

  // Handle file upload for new avatar
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const storageRef = firebase.storage().ref();
    const avatarRef = storageRef.child(`avatars/${userId}/${file.name}`);

    try {
      await avatarRef.put(file);
      const avatarPath = `avatars/${userId}/${file.name}`;

      // Update avatar path in Firestore
      await firebase.firestore().collection('users').doc(userId).update({
        avatarPath
      });

      setAvatarUrl(await avatarRef.getDownloadURL()); // Update avatar URL
    } catch (error) {
      console.error("Error uploading avatar:", error);
    }
  };

  return (
    <div>
      <img 
        src={avatarUrl || 'https://via.placeholder.com/100'} // Default profile icon if no avatar
        alt="User Avatar"
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          objectFit: 'cover',
          cursor: 'pointer'
        }}
      />
      <input
        type="file"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
        id="avatarUpload"
      />
      <label htmlFor="avatarUpload" style={{ cursor: 'pointer', display: 'block', textAlign: 'center', marginTop: '5px' }}>
        Change Avatar
      </label>
    </div>
  );
};

export default Avatar;
