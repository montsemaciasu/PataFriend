import React, { useState } from "react";
import "./match-item.css";
import { Link } from "react-router-dom";
import {
  faLocationDot,
  faXmark,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useAuthContext } from "../../../contexts/auth-context"; 

function MatchItem({
  match,
  section,
  onMatchesUpdate,
  openMatchId,
  setOpenMatchId,
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [adopters, setAdopters] = useState([]);
  const [loading, setLoading] = useState(false);

  const { user } = useAuthContext(); 

  const sectionToStatusMap = {
    pending: "pending",
    approved: "accepted",
    rejected: "rejected",
  };

  const toggleDetails = async () => {
    if (openMatchId === match.pet.id) {
      setOpenMatchId(null);
    } else {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:3000/api/pets/${match.pet.id}/match-details`,
          { withCredentials: true }
        );
        const filteredAdopters = response.data.filter(
          (item) => item.status === sectionToStatusMap[section]
        );
        setAdopters(filteredAdopters);
      } catch (error) {
        console.error("Error fetching match details:", error);
      }
      setLoading(false);
      setOpenMatchId(match.pet.id);
    }
  };


  const handleUpdateMatchStatus = async (matchId, newStatus) => {
    try {
      await axios.patch(
        `http://localhost:3000/api/pets/matches/${matchId}/status`,
        { status: newStatus },
        { withCredentials: true }
      );

      onMatchesUpdate(); 
 
      const response = await axios.get(
        `http://localhost:3000/api/pets/${match.pet.id}/match-details`,
        { withCredentials: true }
      );
      const filteredAdopters = response.data.filter(
        (item) => item.status === sectionToStatusMap[section]
      );
      setAdopters(filteredAdopters);
    } catch (error) {
      console.error("Error updating match status:", error);
    }
  };

  const handleNoMatch = async () => {
    try {
      await axios.delete(
        `http://localhost:3000/api/pets/${match.pet.id}/matches`,
        { withCredentials: true }
      );
      window.location.reload();
    } catch (error) {
      console.error("Error deleting match:", error);
    }
  };

  return (
    <div className="card mb-3 match-item">
      <div className="row no-gutters">
        <div className="col" style={{ flex: "0" }}>
          <img
            src={match.pet.photos[0]}
            className="card-img"
            alt={match.pet.name}
          />
        </div>
        <div className="col card-match-info">
          <div className="card-match-body">
            <h5 className="card-title">{match.pet.name}</h5>
            <p className="shelter-info">
              <FontAwesomeIcon
                icon={faLocationDot}
                style={{ color: "#535456", marginRight: "5px" }}
              />
              {match.pet.shelterId.name} - {match.pet.shelterId.province}
            </p>
            <p className="card-match-description">{match.pet.description}</p>
            <p className="card-text">
              <small className="text-muted">
                Last updated {new Date(match.updatedAt).toLocaleString()}
              </small>
            </p>
          </div>
        </div>

        <div className="col match-section" style={{ flex: "0.30 0 0%" }}>
          {/* Mostrar solo el botón de "No Match" si el usuario es Adopter */}
          {user?.userType === "adopter" && (
            <button
              className={`no-match`}
              style={{ width: "130px" }}
              onClick={handleNoMatch}
            >
              <FontAwesomeIcon icon={faXmark} /> No Match
            </button>
          )}

          {/* Mostrar solo el desplegable si el usuario es Shelter */}
          {user?.userType === "shelter" && (
            <button className="desplegable" onClick={toggleDetails}>
              {openMatchId === match.pet.id ? (
                <FontAwesomeIcon icon={faChevronUp} />
              ) : (
                <FontAwesomeIcon icon={faChevronDown} />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mostrar detalles solo si `showDetails` está activo */}
      {openMatchId === match.pet.id && (
        <div className={`adopter-details active`}>
          {loading ? (
            <p>Loading adopters...</p>
          ) : adopters.length > 0 ? (
            adopters.map((adopter) => (
              <div key={adopter.adopter.id} className="adopter-card">
                <div className="row no-gutters">
                  <div className="col" style={{ flex: "0" }}>
                    <img
                      src={adopter.adopter.avatar}
                      className="card-img"
                      style={{ height: "100%", maxHeight: "170px" }}
                      alt={adopter.adopter.avatar}
                    />
                  </div>
                  <div className="col card-match-info">
                    <div className="card-match-body">
                      <h5 className="card-title">
                        <Link
                          to={`/profile/${adopter.adopter.id}`}
                          style={{ color: "rgb(76 175 81)" }}
                        >
                          {" "}
                          {adopter.adopter.name}
                        </Link>
                      </h5>
                      <p className="shelter-info">
                        <FontAwesomeIcon
                          icon={faLocationDot}
                          style={{ color: "#535456", marginRight: "5px" }}
                        />
                        {adopter.adopter.province}
                      </p>
                      <p className="card-match-description">
                        {adopter.adopter.description}
                      </p>
                    </div>
                  </div>
                  <div
                    className="col match-section"
                    style={{ flex: "0.30 0 0%" }}
                  >
                    {adopter.status === "pending" && (
                      <>
                        <button
                          className="match"
                          style={{ width: "140px" }}
                          onClick={() =>
                            handleUpdateMatchStatus(adopter._id, "accepted")
                          }
                        >
                          🐾 PataMatch
                        </button>
                        <button
                          className="no-match"
                          style={{ width: "140px" }}
                          onClick={() =>
                            handleUpdateMatchStatus(adopter._id, "rejected")
                          }
                        >
                          <FontAwesomeIcon icon={faXmark} /> No Match
                        </button>
                      </>
                    )}

                    {adopter.status === "accepted" && (
                      <button
                        className="no-match"
                        style={{ width: "140px" }}
                        onClick={() =>
                          handleUpdateMatchStatus(adopter._id, "rejected")
                        }
                      >
                        <FontAwesomeIcon icon={faXmark} /> No Match
                      </button>
                    )}

                    {adopter.status === "rejected" && (
                      <button
                        className="match"
                        style={{ width: "140px" }}
                        onClick={() =>
                          handleUpdateMatchStatus(adopter._id, "accepted")
                        }
                      >
                        🐾 PataMatch
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No matches found for this pet.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default MatchItem;
