import { useState, useEffect } from "react";
import axios from "axios";
import "./pet-item.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationDot,
  faXmark,
  faCircleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { useAuthContext } from "../../../contexts/auth-context";
import { Link } from "react-router-dom"; 

function PetItem({ pet, onNoMatch, onMatch }) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const { user } = useAuthContext();

  const handleNextPhoto = () => {
    setCurrentPhotoIndex((prevIndex) =>
      prevIndex === pet.photos.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrevPhoto = () => {
    setCurrentPhotoIndex((prevIndex) =>
      prevIndex === 0 ? pet.photos.length - 1 : prevIndex - 1
    );
  };

  const handleMatch = async () => {
    try {
      await axios.post(
        `http://localhost:3000/api/pets/${pet.id}/matches`,
        {},
        { withCredentials: true }
      );
      onMatch(pet.id); 
    } catch (error) {
      console.error("Error creating match:", error);
    }
  };

  const handleNoMatch = async () => {
    try {
      await axios.patch(
        `http://localhost:3000/api/pets/${pet.id}/matches/no-match`,
        {},
        { withCredentials: true }
      );

      onNoMatch(pet.id); 
    } catch (error) {
      console.error("Error marking as no match:", error);
    }
  };

  return (
    <div
      className={`card pet-item ${
        user?.userType !== "shelter" ? "" : "shelter-style"
      }`}
    >
      <div className="card-img-top">
        {pet.photos && pet.photos.length > 1 && (
          <>
            <button
              className="carousel-detail-btn left"
              onClick={handlePrevPhoto}
            >
              ❮
            </button>
            <button
              className="carousel-detail-btn right"
              onClick={handleNextPhoto}
            >
              ❯
            </button>
          </>
        )}
        <img
          src={pet.photos[currentPhotoIndex]}
          className="card-img-top-single"
          alt={pet.name}
        />
      </div>

      <div className="card-body-detail">
        <h5 className="card-title">{pet.name}</h5>

        <p className="shelter-info-urgent">
          <FontAwesomeIcon
            icon={faLocationDot}
            style={{ color: "#535456", marginRight: "5px" }}
          />
          {pet.shelterId ? (
            <Link
              to={`/shelter/${pet.shelterId.id}`}
              className="shelter-info-urgent"
            >
              {pet.shelterId.name} - {pet.shelterId.province}
            </Link>
          ) : (
            <span className="shelter-info-urgent">
              Shelter info unavailable
            </span>
          )}
        </p>
        {pet.urgentTag && (
          <p className="urgent-message">
            <FontAwesomeIcon icon={faCircleExclamation} /> It needs a PataFriend
            urgently!
          </p>
        )}
        {pet.age && <p className="pet-details">🗓️ Age: {pet.age} old</p>}
        <p className="card-text-detail">{pet.description}</p>
      </div>

      {/* Ocultar Match si el usuario es "Shelter" */}
      {user?.userType !== "shelter" && (
        <ul className="list-group list-group-flush">
          <div className="match">
            <button className="card-link" onClick={handleMatch}>
              🐾 PataMatch
            </button>
            <button className="card-link no-match" onClick={handleNoMatch}>
              <FontAwesomeIcon icon={faXmark} /> No Match
            </button>
          </div>
        </ul>
      )}
    </div>
  );
}

export default PetItem;
