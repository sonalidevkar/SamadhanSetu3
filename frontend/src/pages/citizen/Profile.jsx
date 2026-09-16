import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit3,
  Save,
  Trash2,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";

function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    mobile: "",
    address: "",
    district: "",
    villageCity: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("samadhanSetuUser");

      if (savedUser) {
        const user = JSON.parse(savedUser);

        setProfile({
          name: user.name || "",
          email: user.email || "",
          mobile: user.mobile || "",
          address: user.address || "",
          district: user.district || "",
          villageCity: user.villageCity || "",
        });
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    }
  }, []);

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });

    setMessage("");
    setError("");
  };

  const handleSave = (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!profile.name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!profile.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!/^[0-9]{10}$/.test(profile.mobile)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!profile.address.trim()) {
      setError("Please enter your address.");
      return;
    }

    if (!profile.district.trim()) {
      setError("Please enter your district.");
      return;
    }

    if (!profile.villageCity.trim()) {
      setError("Please enter your village/city.");
      return;
    }

    try {
      const existingUser = localStorage.getItem("samadhanSetuUser");
      const oldUser = existingUser ? JSON.parse(existingUser) : {};

      const updatedUser = {
        ...oldUser,
        ...profile,
      };

      localStorage.setItem(
        "samadhanSetuUser",
        JSON.stringify(updatedUser)
      );

      setProfile(updatedUser);
      setIsEditing(false);
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError("Unable to update profile. Please try again.");
    }
  };

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (!confirmed) return;

    localStorage.removeItem("samadhanSetuUser");
    localStorage.removeItem("isLoggedIn");

    alert("Your account has been deleted.");
    navigate("/register");
  };

  const getInitial = () => {
    if (profile.name) {
      return profile.name.charAt(0).toUpperCase();
    }

    if (profile.email) {
      return profile.email.charAt(0).toUpperCase();
    }

    return "U";
  };

  return (
    <div className="profile-page">
      <div className="profile-container">

        {/* Back Button */}
        <Link to="/dashboard" className="profile-back-button">
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="profile-header">
          <div className="profile-header-content">
            <div className="profile-avatar">
              {getInitial()}
            </div>

            <div>
              <h1>My Profile</h1>
              <p>Manage your SamadhanSetu account details</p>
            </div>
          </div>

          {!isEditing && (
            <button
              className="profile-edit-button"
              onClick={() => {
                setIsEditing(true);
                setMessage("");
                setError("");
              }}
            >
              <Edit3 size={18} />
              Edit Profile
            </button>
          )}
        </div>

        {/* Messages */}
        {message && (
          <div className="profile-success-message">
            <ShieldCheck size={20} />
            {message}
          </div>
        )}

        {error && (
          <div className="profile-error-message">
            {error}
          </div>
        )}

        {/* Profile Card */}
        <div className="profile-card">

          <div className="profile-section-title">
            <div className="profile-section-icon">
              <User size={20} />
            </div>

            <div>
              <h2>Personal Information</h2>
              <p>Your basic account information</p>
            </div>
          </div>

          <form onSubmit={handleSave}>

            <div className="profile-form-grid">

              {/* Name */}
              <div className="profile-input-group">
                <label htmlFor="profile-name">
                  Full Name
                </label>

                <div className="profile-input-wrapper">
                  <User size={18} />

                  <input
                    id="profile-name"
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="profile-input-group">
                <label htmlFor="profile-email">
                  Email Address
                </label>

                <div className="profile-input-wrapper">
                  <Mail size={18} />

                  <input
                    id="profile-email"
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Mobile */}
              <div className="profile-input-group">
                <label htmlFor="profile-mobile">
                  Mobile Number
                </label>

                <div className="profile-input-wrapper">
                  <Phone size={18} />

                  <input
                    id="profile-mobile"
                    type="tel"
                    name="mobile"
                    value={profile.mobile}
                    onChange={handleChange}
                    disabled={!isEditing}
                    maxLength="10"
                    placeholder="Enter 10-digit mobile number"
                  />
                </div>
              </div>

              {/* Village / City */}
              <div className="profile-input-group">
                <label htmlFor="profile-villageCity">
                  Village / City
                </label>

                <div className="profile-input-wrapper">
                  <MapPin size={18} />

                  <input
                    id="profile-villageCity"
                    type="text"
                    name="villageCity"
                    value={profile.villageCity}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Enter village or city"
                  />
                </div>
              </div>

              {/* District */}
              <div className="profile-input-group">
                <label htmlFor="profile-district">
                  District
                </label>

                <div className="profile-input-wrapper">
                  <MapPin size={18} />

                  <input
                    id="profile-district"
                    type="text"
                    name="district"
                    value={profile.district}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Enter your district"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="profile-input-group profile-full-width">
                <label htmlFor="profile-address">
                  Address
                </label>

                <textarea
                  id="profile-address"
                  name="address"
                  value={profile.address}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows="4"
                  placeholder="Enter your complete address"
                />
              </div>

            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="profile-actions">

                <button
                  type="button"
                  className="profile-cancel-button"
                  onClick={() => {
                    setIsEditing(false);
                    setError("");
                    setMessage("");
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="profile-save-button"
                >
                  <Save size={18} />
                  Save Changes
                </button>

              </div>
            )}

          </form>
        </div>

        {/* Account Section */}
        <div className="profile-account-card">

          <div>
            <h2>Account Management</h2>
            <p>
              Manage your SamadhanSetu account and personal data.
            </p>
          </div>

          <button
            className="profile-delete-button"
            onClick={handleDeleteAccount}
          >
            <Trash2 size={18} />
            Delete Account
          </button>

        </div>

      </div>
    </div>
  );
}

export default Profile;