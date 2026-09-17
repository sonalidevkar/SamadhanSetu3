import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Mic,
  Camera,
  Video,
  FileText,
  Navigation,
  CheckCircle,
  AlertCircle,
  User,
  Send,
  Lightbulb,
} from "lucide-react";

function SubmitProblem() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    mobile: "",
    address: "",
    district: "",
    villageCity: "",
  });

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    subCategory: "",
    problemType: "",
    description: "",
    severity: "",
    peopleAffected: "",
    duration: "",
    expectedSolution: "",
    additionalDetails: "",
  });

  const [photo, setPhoto] = useState(null);
  const [video, setVideo] = useState(null);
  const [document, setDocument] = useState(null);

  const [location, setLocation] = useState({
    latitude: "",
    longitude: "",
    address: "",
  });

  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  const [voiceListening, setVoiceListening] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /* =====================================================
     LOAD USER
  ===================================================== */

  useEffect(() => {
    loadUser();
    detectLocation();
  }, []);

  const loadUser = () => {
    try {
      // First try normal login user
      const normalUser = localStorage.getItem("user");

      // Also support old SamadhanSetu user
      const oldUser =
        localStorage.getItem("samadhanSetuUser");

      const savedUser =
        normalUser || oldUser;

      if (!savedUser) {
        return;
      }

      const parsedUser = JSON.parse(savedUser);

      setUser(parsedUser);

      setUserDetails({
        name: parsedUser.name || "",
        email: parsedUser.email || "",
        mobile: parsedUser.mobile || "",
        address: parsedUser.address || "",
        district: parsedUser.district || "",
        villageCity: parsedUser.villageCity || "",
      });
    } catch (err) {
      console.error(
        "Failed to load user:",
        err
      );
    }
  };

  /* =====================================================
     USER DETAILS CHANGE
  ===================================================== */

  const handleUserChange = (e) => {
    const { name, value } = e.target;

    setUserDetails((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  /* =====================================================
     PROBLEM DETAILS CHANGE
  ===================================================== */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  /* =====================================================
     LOCATION DETECTION
  ===================================================== */

  const detectLocation = () => {
    setLocationLoading(true);
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError(
        "Geolocation is not supported by your browser."
      );

      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;

        let address =
          "Location detected";

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );

          const data =
            await response.json();

          if (data.display_name) {
            address =
              data.display_name;
          }
        } catch (err) {
          console.log(
            "Reverse geocoding failed"
          );
        }

        setLocation({
          latitude,
          longitude,
          address,
        });

        setLocationLoading(false);
      },

      (err) => {
        console.log(
          "Location error:",
          err
        );

        setLocationError(
          "Unable to detect your location. Please allow location permission."
        );

        setLocationLoading(false);
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  /* =====================================================
     VOICE INPUT
  ===================================================== */

  const startVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Voice input is not supported in this browser."
      );
      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setVoiceListening(true);
    };

    recognition.onresult = (event) => {
      const speechText =
        event.results[0][0].transcript;

      setFormData((prev) => ({
        ...prev,
        description:
          `${prev.description} ${speechText}`.trim(),
      }));
    };

    recognition.onerror = () => {
      setVoiceListening(false);
    };

    recognition.onend = () => {
      setVoiceListening(false);
    };

    recognition.start();
  };

  /* =====================================================
     SUBMIT PROBLEM TO BACKEND
  ===================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    /* ---------------- USER VALIDATION ---------------- */

    if (!userDetails.name.trim()) {
      setError(
        "Please enter your full name."
      );
      return;
    }

    if (!userDetails.email.trim()) {
      setError(
        "Please enter your email address."
      );
      return;
    }

    if (
      !/^[0-9]{10}$/.test(
        userDetails.mobile
      )
    ) {
      setError(
        "Please enter a valid 10-digit mobile number."
      );
      return;
    }

    if (!userDetails.address.trim()) {
      setError(
        "Please enter your address."
      );
      return;
    }

    /* ---------------- PROBLEM VALIDATION ---------------- */

    if (!formData.title.trim()) {
      setError(
        "Please enter a problem title."
      );
      return;
    }

    if (!formData.category) {
      setError(
        "Please select a problem category."
      );
      return;
    }

    if (!formData.subCategory) {
      setError(
        "Please select a problem sub-category."
      );
      return;
    }

    if (!formData.problemType) {
      setError(
        "Please select the problem type."
      );
      return;
    }

    if (!formData.description.trim()) {
      setError(
        "Please describe the problem."
      );
      return;
    }

    if (!formData.severity) {
      setError(
        "Please select the problem severity."
      );
      return;
    }

    if (
      !location.latitude ||
      !location.longitude
    ) {
      setError(
        "Please detect your live location before submitting."
      );
      return;
    }

    /* ---------------- TOKEN ---------------- */

    const token =
      localStorage.getItem("token");

    if (!token) {
      setError(
        "Your login session has expired. Please login again."
      );

      navigate("/login");
      return;
    }

    try {
      setSubmitting(true);

      /*
       * IMPORTANT:
       * We are sending JSON to backend.
       * Files are currently sent only as their
       * names because problemRoutes.js does not
       * have multer upload middleware.
       */

      const problemData = {
        /* CITIZEN DETAILS */

        citizen: {
          name: userDetails.name,
          email: userDetails.email,
          mobile: userDetails.mobile,
          address: userDetails.address,
          district: userDetails.district,
          villageCity:
            userDetails.villageCity,
        },

        /* PROBLEM */

        title: formData.title.trim(),

        category:
          formData.category,

        subCategory:
          formData.subCategory,

        problemType:
          formData.problemType,

        description:
          formData.description.trim(),

        severity:
          formData.severity,

        peopleAffected:
          formData.peopleAffected
            ? Number(
                formData.peopleAffected
              )
            : 0,

        duration:
          formData.duration,

        expectedSolution:
          formData.expectedSolution.trim(),

        additionalDetails:
          formData.additionalDetails.trim(),

        /* LOCATION */

        location: {
          latitude:
            Number(location.latitude),

          longitude:
            Number(location.longitude),

          address:
            location.address ||
            userDetails.address,

          district:
            userDetails.district,

          villageCity:
            userDetails.villageCity,
        },

        /* MEDIA INFORMATION */

        media: {
          photo:
            photo
              ? photo.name
              : "",

          video:
            video
              ? video.name
              : "",

          document:
            document
              ? document.name
              : "",
        },
      };

      console.log(
        "Submitting problem:",
        problemData
      );

      /* =================================================
         SEND TO BACKEND
      ================================================= */

      const response = await fetch(
        "https://samadhansetu3.onrender.com/api/problems",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify(
            problemData
          ),
        }
      );

      const data =
        await response.json();

      console.log(
        "Backend response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to submit problem."
        );
      }

      /* =================================================
         SUCCESS
      ================================================= */

      setSuccess(true);

      /*
       * Keep local user details updated
       */

      const updatedUser = {
        ...(user || {}),
        ...userDetails,
      };

      localStorage.setItem(
        "samadhanSetuUser",
        JSON.stringify(
          updatedUser
        )
      );

      localStorage.setItem(
        "user",
        JSON.stringify(
          updatedUser
        )
      );

      /*
       * DO NOT manually add problem to localStorage.
       * Backend/MongoDB is now the main source of truth.
       */

      setTimeout(() => {
        navigate("/dashboard");
      }, 1800);
    } catch (err) {
      console.error(
        "Submit problem error:",
        err
      );

      setError(
        err.message ||
          "Unable to submit problem. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =====================================================
     CATEGORY DATA
  ===================================================== */

  const categories = {
    Education: [
      "School Infrastructure",
      "Digital Education",
      "Teachers",
      "Learning Resources",
      "Student Facilities",
    ],

    Health: [
      "Hospital / PHC",
      "Medicine Availability",
      "Ambulance",
      "Medical Staff",
      "Health Infrastructure",
    ],

    Agriculture: [
      "Irrigation",
      "Crop Disease",
      "Market Access",
      "Fertilizer / Seeds",
      "Farming Equipment",
    ],

    Water: [
      "Drinking Water",
      "Water Supply",
      "Water Leakage",
      "Water Quality",
      "Groundwater",
    ],

    Sanitation: [
      "Waste Management",
      "Drainage",
      "Toilet Facilities",
      "Sewage",
      "Cleanliness",
    ],

    Environment: [
      "Pollution",
      "Deforestation",
      "Water Pollution",
      "Air Pollution",
      "Plastic Waste",
    ],

    Employment: [
      "Job Opportunities",
      "Skill Development",
      "Training",
      "Local Employment",
      "Entrepreneurship",
    ],

    Transport: [
      "Road Damage",
      "Public Transport",
      "Street Lights",
      "Bridges",
      "Traffic",
    ],

    "Government Services": [
      "Public Services",
      "Documents",
      "Government Schemes",
      "Public Offices",
      "Other Services",
    ],
  };

  const subCategories =
    formData.category
      ? categories[
          formData.category
        ] || []
      : [];

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="submit-problem-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="submit-page-header">

        <button
          className="back-dashboard-button"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          <ArrowLeft size={18} />

          Back to Dashboard
        </button>

        <div>

          <span className="submit-page-tag">

            <MapPin size={15} />

            Citizen Problem Reporting

          </span>

          <h1>
            Report a Community Problem
          </h1>

          <p>
            Provide complete details so
            SamadhanSetu can analyze and
            connect your problem with the
            right solution partner.
          </p>

        </div>

      </div>

      {/* =================================================
          CONTAINER
      ================================================= */}

      <div className="submit-problem-container">

        <form
          onSubmit={handleSubmit}
        >

          {/* =================================================
              CITIZEN DETAILS
          ================================================= */}

          <section className="problem-form-section">

            <div className="form-section-heading">

              <div className="form-section-icon">
                <User size={21} />
              </div>

              <div>

                <h2>
                  Citizen Details
                </h2>

                <p>
                  Enter your details so we
                  can contact you regarding
                  the reported problem.
                </p>

              </div>

            </div>

            <div className="form-grid">

              {/* NAME */}

              <div className="input-group">

                <label htmlFor="name">
                  Full Name <span>*</span>
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={
                    userDetails.name
                  }
                  onChange={
                    handleUserChange
                  }
                  required
                />

              </div>

              {/* EMAIL */}

              <div className="input-group">

                <label htmlFor="email">
                  Email Address <span>*</span>
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={
                    userDetails.email
                  }
                  onChange={
                    handleUserChange
                  }
                  required
                />

              </div>

              {/* MOBILE */}

              <div className="input-group">

                <label htmlFor="mobile">
                  Mobile Number <span>*</span>
                </label>

                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  maxLength="10"
                  placeholder="Enter 10-digit mobile number"
                  value={
                    userDetails.mobile
                  }
                  onChange={
                    handleUserChange
                  }
                  required
                />

              </div>

              {/* DISTRICT */}

              <div className="input-group">

                <label htmlFor="district">
                  District
                </label>

                <input
                  id="district"
                  name="district"
                  type="text"
                  placeholder="Enter district"
                  value={
                    userDetails.district
                  }
                  onChange={
                    handleUserChange
                  }
                />

              </div>

              {/* VILLAGE / CITY */}

              <div className="input-group">

                <label htmlFor="villageCity">
                  Village / City
                </label>

                <input
                  id="villageCity"
                  name="villageCity"
                  type="text"
                  placeholder="Enter village or city"
                  value={
                    userDetails.villageCity
                  }
                  onChange={
                    handleUserChange
                  }
                />

              </div>

              {/* ADDRESS */}

              <div className="input-group full-width">

                <label htmlFor="address">
                  Complete Address{" "}
                  <span>*</span>
                </label>

                <textarea
                  id="address"
                  name="address"
                  rows="3"
                  placeholder="House number, street, village/city, district..."
                  value={
                    userDetails.address
                  }
                  onChange={
                    handleUserChange
                  }
                  required
                />

              </div>

            </div>

          </section>

          {/* =================================================
              PROBLEM DETAILS
          ================================================= */}

          <section className="problem-form-section">

            <div className="form-section-heading">

              <div className="form-section-icon">
                <AlertCircle size={21} />
              </div>

              <div>

                <h2>
                  Problem Details
                </h2>

                <p>
                  Describe the community
                  problem in detail.
                </p>

              </div>

            </div>

            <div className="form-grid">

              {/* TITLE */}

              <div className="input-group full-width">

                <label htmlFor="title">
                  Problem Title{" "}
                  <span>*</span>
                </label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="Example: Irregular water supply in village"
                  value={
                    formData.title
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

                <small>
                  Use a short and clear title.
                </small>

              </div>

              {/* CATEGORY */}

              <div className="input-group">

                <label htmlFor="category">
                  Main Category{" "}
                  <span>*</span>
                </label>

                <select
                  id="category"
                  name="category"
                  value={
                    formData.category
                  }
                  onChange={(e) => {

                    setFormData(
                      (prev) => ({
                        ...prev,
                        category:
                          e.target.value,
                        subCategory:
                          "",
                      })
                    );

                    setError("");
                  }}
                  required
                >

                  <option value="">
                    Select category
                  </option>

                  {Object.keys(
                    categories
                  ).map(
                    (category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* SUB CATEGORY */}

              <div className="input-group">

                <label htmlFor="subCategory">
                  Sub-Category{" "}
                  <span>*</span>
                </label>

                <select
                  id="subCategory"
                  name="subCategory"
                  value={
                    formData.subCategory
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    !formData.category
                  }
                  required
                >

                  <option value="">
                    Select sub-category
                  </option>

                  {subCategories.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* PROBLEM TYPE */}

              <div className="input-group">

                <label htmlFor="problemType">
                  Problem Type{" "}
                  <span>*</span>
                </label>

                <select
                  id="problemType"
                  name="problemType"
                  value={
                    formData.problemType
                  }
                  onChange={
                    handleChange
                  }
                  required
                >

                  <option value="">
                    Select problem type
                  </option>

                  <option value="Infrastructure">
                    Infrastructure
                  </option>

                  <option value="Public Service">
                    Public Service
                  </option>

                  <option value="Social Issue">
                    Social Issue
                  </option>

                  <option value="Environmental">
                    Environmental
                  </option>

                  <option value="Technical">
                    Technical
                  </option>

                  <option value="Emergency">
                    Emergency
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>

              </div>

              {/* SEVERITY */}

              <div className="input-group">

                <label htmlFor="severity">
                  Severity / Priority{" "}
                  <span>*</span>
                </label>

                <select
                  id="severity"
                  name="severity"
                  value={
                    formData.severity
                  }
                  onChange={
                    handleChange
                  }
                  required
                >

                  <option value="">
                    Select severity
                  </option>

                  <option value="Low">
                    Low - Can be addressed later
                  </option>

                  <option value="Medium">
                    Medium - Needs attention
                  </option>

                  <option value="High">
                    High - Significant impact
                  </option>

                  <option value="Critical">
                    Critical - Immediate attention
                  </option>

                </select>

              </div>

              {/* PEOPLE AFFECTED */}

              <div className="input-group">

                <label htmlFor="peopleAffected">
                  Approx. People Affected
                </label>

                <input
                  id="peopleAffected"
                  name="peopleAffected"
                  type="number"
                  min="0"
                  placeholder="Example: 250"
                  value={
                    formData.peopleAffected
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>

              {/* DURATION */}

              <div className="input-group">

                <label htmlFor="duration">
                  Problem Duration
                </label>

                <select
                  id="duration"
                  name="duration"
                  value={
                    formData.duration
                  }
                  onChange={
                    handleChange
                  }
                >

                  <option value="">
                    Select duration
                  </option>

                  <option value="Less than a week">
                    Less than a week
                  </option>

                  <option value="1-4 weeks">
                    1–4 weeks
                  </option>

                  <option value="1-6 months">
                    1–6 months
                  </option>

                  <option value="6 months - 1 year">
                    6 months – 1 year
                  </option>

                  <option value="More than 1 year">
                    More than 1 year
                  </option>

                </select>

              </div>

              {/* DESCRIPTION */}

              <div className="input-group full-width">

                <label htmlFor="description">
                  Detailed Problem Description{" "}
                  <span>*</span>
                </label>

                <textarea
                  id="description"
                  name="description"
                  rows="6"
                  placeholder="Explain what happened, where the problem is, who is affected and why it needs attention..."
                  value={
                    formData.description
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

                <small>
                  Detailed information helps
                  the AI engine analyze the
                  problem correctly.
                </small>

              </div>

              {/* EXPECTED SOLUTION */}

              <div className="input-group full-width">

                <label htmlFor="expectedSolution">
                  Expected Solution / Suggestion
                </label>

                <textarea
                  id="expectedSolution"
                  name="expectedSolution"
                  rows="4"
                  placeholder="Describe your idea or expected solution..."
                  value={
                    formData.expectedSolution
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>

              {/* ADDITIONAL DETAILS */}

              <div className="input-group full-width">

                <label htmlFor="additionalDetails">
                  Additional Information
                </label>

                <textarea
                  id="additionalDetails"
                  name="additionalDetails"
                  rows="4"
                  placeholder="Add previous complaint details, nearby landmarks, affected facilities or any other information..."
                  value={
                    formData.additionalDetails
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>

            </div>

            {/* VOICE */}

            <div className="voice-area">

              <button
                type="button"
                className={`voice-button ${
                  voiceListening
                    ? "voice-active"
                    : ""
                }`}
                onClick={
                  startVoiceInput
                }
              >

                <Mic size={21} />

                {voiceListening
                  ? "Listening..."
                  : "Describe Problem by Voice"}

              </button>

              <div className="voice-info">

                <strong>
                  Prefer speaking?
                </strong>

                <span>
                  Speak your problem and
                  it will be converted into
                  text automatically.
                </span>

              </div>

            </div>

          </section>

          {/* =================================================
              MEDIA
          ================================================= */}

          <section className="problem-form-section">

            <div className="form-section-heading">

              <div className="form-section-icon">
                <Camera size={21} />
              </div>

              <div>

                <h2>
                  Evidence & Media
                </h2>

                <p>
                  Upload photos, videos or
                  supporting documents.
                </p>

              </div>

            </div>

            <div className="media-upload-grid">

              {/* PHOTO */}

              <div className="media-upload-card">

                <div className="media-upload-icon">
                  <Camera size={28} />
                </div>

                <h3>
                  Problem Photo
                </h3>

                <p>
                  Upload a clear photo
                  showing the issue.
                </p>

                <label className="media-upload-button">

                  Choose Photo

                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) =>
                      setPhoto(
                        e.target.files[0] ||
                          null
                      )
                    }
                  />

                </label>

                {photo && (
                  <div className="selected-file">

                    <CheckCircle
                      size={16}
                    />

                    {photo.name}

                  </div>
                )}

              </div>

              {/* VIDEO */}

              <div className="media-upload-card">

                <div className="media-upload-icon">
                  <Video size={28} />
                </div>

                <h3>
                  Problem Video
                </h3>

                <p>
                  Upload a short video
                  explaining the problem.
                </p>

                <label className="media-upload-button">

                  Choose Video

                  <input
                    type="file"
                    accept="video/*"
                    hidden
                    onChange={(e) =>
                      setVideo(
                        e.target.files[0] ||
                          null
                      )
                    }
                  />

                </label>

                {video && (
                  <div className="selected-file">

                    <CheckCircle
                      size={16}
                    />

                    {video.name}

                  </div>
                )}

              </div>

              {/* DOCUMENT */}

              <div className="media-upload-card">

                <div className="media-upload-icon">
                  <FileText size={28} />
                </div>

                <h3>
                  Supporting Document
                </h3>

                <p>
                  Upload complaint proof
                  or supporting documents.
                </p>

                <label className="media-upload-button">

                  Choose Document

                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    hidden
                    onChange={(e) =>
                      setDocument(
                        e.target.files[0] ||
                          null
                      )
                    }
                  />

                </label>

                {document && (
                  <div className="selected-file">

                    <CheckCircle
                      size={16}
                    />

                    {document.name}

                  </div>
                )}

              </div>

            </div>

          </section>

          {/* =================================================
              LOCATION
          ================================================= */}

          <section className="problem-form-section">

            <div className="form-section-heading">

              <div className="form-section-icon">
                <MapPin size={21} />
              </div>

              <div>

                <h2>
                  Problem Location
                </h2>

                <p>
                  Live location helps us
                  identify nearby colleges,
                  industries and authorities.
                </p>

              </div>

            </div>

            <div className="location-panel">

              <div className="location-top">

                <div className="location-status">

                  <div className="location-status-icon">
                    <Navigation
                      size={20}
                    />
                  </div>

                  <div>

                    <strong>

                      {locationLoading
                        ? "Detecting your location..."
                        : location.latitude
                        ? "Live location detected"
                        : "Location not detected"}

                    </strong>

                    <span>

                      {location.latitude
                        ? "Your GPS coordinates will be attached to this report."
                        : "Allow location permission to continue."}

                    </span>

                  </div>

                </div>

                <button
                  type="button"
                  className="detect-location-button"
                  onClick={
                    detectLocation
                  }
                  disabled={
                    locationLoading
                  }
                >

                  <Navigation
                    size={17}
                  />

                  {locationLoading
                    ? "Detecting..."
                    : "Detect My Location"}

                </button>

              </div>

              {locationError && (
                <div className="location-error">

                  <AlertCircle
                    size={17}
                  />

                  {locationError}

                </div>
              )}

              {location.latitude &&
                location.longitude && (
                  <>

                    {/* COORDINATES */}

                    <div className="coordinates-box">

                      <div>

                        <span>
                          Latitude
                        </span>

                        <strong>
                          {Number(
                            location.latitude
                          ).toFixed(6)}
                        </strong>

                      </div>

                      <div>

                        <span>
                          Longitude
                        </span>

                        <strong>
                          {Number(
                            location.longitude
                          ).toFixed(6)}
                        </strong>

                      </div>

                    </div>

                    {/* ADDRESS */}

                    <div className="detected-address">

                      <MapPin
                        size={18}
                      />

                      <div>

                        <span>
                          Detected Address
                        </span>

                        <strong>
                          {location.address}
                        </strong>

                      </div>

                    </div>

                    {/* MAP */}

                    <div className="map-container">

                      <iframe
                        title="Live Problem Location"
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                          Number(
                            location.longitude
                          ) - 0.005
                        }%2C${
                          Number(
                            location.latitude
                          ) - 0.005
                        }%2C${
                          Number(
                            location.longitude
                          ) + 0.005
                        }%2C${
                          Number(
                            location.latitude
                          ) + 0.005
                        }&layer=mapnik&marker=${
                          location.latitude
                        }%2C${
                          location.longitude
                        }`}
                        width="100%"
                        height="400"
                        style={{
                          border: 0,
                          borderRadius:
                            "18px",
                        }}
                        loading="lazy"
                      />

                      <div className="map-location-badge">

                        <Navigation
                          size={16}
                        />

                        Your Current Location

                      </div>

                    </div>

                  </>
                )}

            </div>

          </section>

          {/* =================================================
              AI INFORMATION
          ================================================= */}

          <section className="ai-info-box">

            <div className="ai-info-icon">

              <Lightbulb
                size={24}
              />

            </div>

            <div>

              <h3>
                What happens after submission?
              </h3>

              <p>
                SamadhanSetu's AI engine will
                analyze your problem, identify
                its category and severity,
                detect similar problems and
                suggest suitable stakeholders
                such as colleges, industries,
                municipalities or government
                departments.
              </p>

              <div className="ai-flow">

                <span>
                  Problem Submitted
                </span>

                <b>→</b>

                <span>
                  AI Analysis
                </span>

                <b>→</b>

                <span>
                  Smart Matching
                </span>

                <b>→</b>

                <span>
                  Assignment
                </span>

              </div>

            </div>

          </section>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="submit-error">

              <AlertCircle
                size={19}
              />

              {error}

            </div>
          )}

          {/* =================================================
              SUCCESS
          ================================================= */}

          {success && (
            <div className="submit-success">

              <CheckCircle
                size={21}
              />

              Problem submitted successfully!
              Redirecting to dashboard...

            </div>
          )}

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="submit-action-area">

            <button
              type="button"
              className="cancel-submit-button"
              onClick={() =>
                navigate("/dashboard")
              }
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="submit-problem-button"
              disabled={
                submitting ||
                success
              }
            >

              <Send size={19} />

              {submitting
                ? "Submitting..."
                : success
                ? "Submitted Successfully"
                : "Submit Problem"}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default SubmitProblem;
