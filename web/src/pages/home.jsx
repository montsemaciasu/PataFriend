import { useEffect, useState } from "react";
import PageLayout from "../components/layouts/page-layout/page-layout";
import PetItem from "../components/pets/pet-item/pet-item";
import axios from "axios";
import "./HomePage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot, faXmark } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { useAuthContext } from "../contexts/auth-context";

function HomePage() {
  const [pet, setPet] = useState(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [petsList, setPetsList] = useState([]);
  const [noMatchPets, setNoMatchPets] = useState([]);
  const [matchedPets, setMatchedPets] = useState([]);
  const [undefinedMatchPets, setUndefinedMatchPets] = useState([]);
  const [matchStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthContext();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [petsResponse, matchStatusResponse, urgentPetResponse] =
          await Promise.all([
            axios.get("http://localhost:3000/api/pets?limit=3", {
              withCredentials: true,
            }),
            axios.get("http://localhost:3000/api/pets/match-statuses", {
              withCredentials: true,
            }),
            axios.get("http://localhost:3000/api/pets/random-urgent", {
              withCredentials: true,
            }),
          ]);

        setPetsList(petsResponse.data);
        setMatchedPets(matchStatusResponse.data.matchedPets || []);
        setNoMatchPets(matchStatusResponse.data.noMatchPets || []);
        setUndefinedMatchPets(
          matchStatusResponse.data.undefinedMatchPets || []
        );
        setPet(urgentPetResponse.data);

        console.log(petsResponse);

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleNoMatch = (petId) => {
    setNoMatchPets((prev) => [...prev, petId]);
  };

  const handleMatch = (petId) => {
    setMatchedPets((prev) => [...prev, petId]);
  };

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

  if (isLoading) return <></>;

  return (
    <PageLayout>
      <h2 className="section-title">
        🐾 Pata
        <span className="logo-part2">Friend </span>
        <span style={{ color: "#f65b4c" }}>urgently </span>looking for a home
      </h2>
      {pet && (
        <div className="card mb-3 custom-card">
          <div className="row no-gutters">
            <div className="col-md-4 position-relative">
              <div className="image-container">
                <img
                  src={pet.photos[currentPhotoIndex]}
                  className="card-img"
                  alt={pet.name}
                />
                <button className="carousel-btn left" onClick={handlePrevPhoto}>
                  ❮
                </button>
                <button
                  className="carousel-btn right"
                  onClick={handleNextPhoto}
                >
                  ❯
                </button>
              </div>
            </div>

            <div className="col-md-8">
              <div className="card-body p-0">
                <div
                  className={`pet-info ${
                    user?.userType !== "shelter" ? "full-width" : ""
                  }`}
                >
                  <h2 className="pet-name">{pet.name}</h2>
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

                  <p style={{ marginTop: "15px" }}>
                    <small className="age-text">🗓️ Age: {pet.age}</small>
                  </p>

                  <p className="card-text description">{pet.description}</p>

                  <div className="urgent-tag">URGENT - Needs a home!</div>
                </div>
                <div
                  className={`match-section-urgent ${
                    user?.userType !== "shelter" ? "adopter" : ""
                  }`}
                >
                  <div className="match-section">
                    {user?.userType !== "shelter" && (
                      <>
                        <button
                          className={`${
                            matchStatus === "matched" ? "active" : ""
                          }`}
                        >
                          🐾 PataMatch
                        </button>
                        <button
                          className={`no-match ${
                            matchStatus === "no-match" ? "active" : ""
                          }`}
                        >
                          <FontAwesomeIcon icon={faXmark} /> No Match
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <h3 className="section-subtitle">
        Other Pata
        <span className="logo-part2">Friends </span>waiting for a home
      </h3>
      <div className="row-pets">
        {petsList
          .filter(
            (pet) =>
              undefinedMatchPets.includes(pet.id) &&
              !noMatchPets.includes(pet.id) &&
              !matchedPets.includes(pet.id)
          )
          .map((pet) => (
            <PetItem
              key={pet.id}
              pet={pet}
              onMatch={handleMatch}
              onNoMatch={handleNoMatch}
            />
          ))}
      </div>
    </PageLayout>
  );
}

export default HomePage;
