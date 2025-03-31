import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";

import PageLayout from "../components/layouts/page-layout/page-layout";
import PetItem from "../components/pets/pet-item/pet-item";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import "./profile.css";
import { useAuthContext } from "../contexts/auth-context";

function ProfilePage({}) {
  const location = useLocation();
  const { id } = useParams();
  const [profile, setProfile] = useState(null);

  const [approvedPets, setApprovedPets] = useState([]);
  const [pendingPets, setPendingPets] = useState([]);
  const [noMatchPets, setNoMatchPets] = useState([]);
  const [allPets, setAllPets] = useState([]);
  const [userMatches, setUserMatches] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const { user } = useAuthContext();
  const isShelterProfile = location.pathname.startsWith("/shelter");

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const profileResponse = await axios.get(
          `http://localhost:3000/api/${
            isShelterProfile ? "shelters" : "users"
          }/${id}`,
          { withCredentials: true }
        );
        setProfile(profileResponse.data);

        // Si soy un adopter viendo mi propio perfil
        if (user?.id === id && user?.userType === "adopter") {
          const userMatchesResponse = await axios.get(
            `http://localhost:3000/api/pets/matches/${id}`,
            { withCredentials: true }
          );
          setUserMatches(userMatchesResponse.data);

          // Si soy un adopter viendo el perfil de un refugio
        } else if (user?.userType === "adopter" && isShelterProfile) {
          const petsResponse = await axios.get(
            `http://localhost:3000/api/pets/shelter/${id}`,
            { withCredentials: true }
          );

          const matchesResponse = await axios.get(
            `http://localhost:3000/api/pets/match-statuses`,
            { withCredentials: true }
          );

          const matchedPets = petsResponse.data.filter((pet) =>
            matchesResponse.data.matchedPets.includes(pet.id)
          );
          const pendingPets = petsResponse.data.filter((pet) =>
            matchesResponse.data.undefinedMatchPets.includes(pet.id)
          );
          const noMatchPets = petsResponse.data.filter((pet) =>
            matchesResponse.data.noMatchPets.includes(pet.id)
          );

          setApprovedPets(matchedPets);
          setPendingPets(pendingPets);
          setNoMatchPets(noMatchPets);

          // Si soy un refugio o un usuario no logueado viendo el perfil de un refugio
        } else if (isShelterProfile) {
          const petsResponse = await axios.get(
            `http://localhost:3000/api/pets/shelter/${id}`,
            { withCredentials: !!user }
          );
          setAllPets(petsResponse.data);

          // Si soy un usuario logueado viendo el perfil de otro adopter
        } else {
          const petsResponse = await axios.get(
            `http://localhost:3000/api/pets/matches/${id}`,
            { withCredentials: true }
          );
          setAllPets(petsResponse.data);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, user?.id, user?.userType, isShelterProfile]);

  if (isLoading) return <></>;

  return (
    <PageLayout>
      <h2 className="section-title">
        {isShelterProfile ? "Shelter Profile" : "Adopter Profile"}
      </h2>

      {profile && (
        <div className="card mb-3 custom-card-profile">
          <div className="row no-gutters">
            <div className="col-md-3 position-relative">
              <div className="image-container">
                <img
                  src={profile.avatar}
                  className="card-img"
                  style={{ height: "310px" }}
                  alt={profile.name}
                />
              </div>
            </div>

            <div className="col-md-8">
              <div className="card-body p-0">
                <div className="profile-info">
                  <h2 className="pet-name">{profile.name}</h2>

                  {!isShelterProfile && profile.age && (
                    <small className="age-text">
                      🗓️ Age: {profile.age} old
                    </small>
                  )}

                  <p className="province-info">
                    <FontAwesomeIcon
                      icon={faLocationDot}
                      style={{ color: "#535456", marginRight: "5px" }}
                    />
                    {profile.province}
                  </p>

                  <p className="province-info">
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      style={{ color: "#535456", marginRight: "5px" }}
                    />
                    {profile.email}
                  </p>

                  <p className="profile-description">{profile.description}</p>

                  <div className="urgent-tag">
                    {isShelterProfile
                      ? "Help us find homes for our PataFriends!"
                      : "Thank you for giving love to our PataFriends!"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mostrar Clasificación si el usuario es "adopter" */}
      {user?.userType === "adopter" ? (
        <>
          {user?.id === id && userMatches.length > 0 && (
            <>
              <h3 className="section-subtitle">My PataMatches</h3>
              <div className="row-pets">
                {userMatches.map((pet) => (
                  <PetItem key={pet.id} pet={pet} isProfile={true} />
                ))}
              </div>
            </>
          )}

          {approvedPets.length > 0 && (
            <>
              <h3 className="section-subtitle">My Matches with this Shelter</h3>
              <div className="row-pets">
                {approvedPets.map((pet) => (
                  <PetItem key={pet.id} pet={pet} isProfile={true} />
                ))}
              </div>
            </>
          )}

          {pendingPets.length > 0 && (
            <>
              <h3 className="section-subtitle">
                Others Pata<span className="logo-part2">Friends</span>
              </h3>
              <div className="row-pets">
                {pendingPets.map((pet) => (
                  <PetItem key={pet.id} pet={pet} isProfile={true} />
                ))}
              </div>
            </>
          )}

          {noMatchPets.length > 0 && (
            <>
              <h3 className="section-subtitle">
                My No Matches with this Shelter
              </h3>
              <div className="row-pets">
                {noMatchPets.map((pet) => (
                  <PetItem key={pet.id} pet={pet} isProfile={true} />
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <h3 className="section-subtitle">
            {isShelterProfile ? (
              <>
                Our Pata
                <span className="logo-part2">Friends</span> waiting for adoption
              </>
            ) : (
              <>
                Our Match's Pata
                <span className="logo-part2">Friends</span>
              </>
            )}
          </h3>

          <div className="row-pets">
            {allPets.length === 0 ? (
              <p className="no-request-found">No pets found.</p>
            ) : (
              allPets.map((pet) => (
                <PetItem
                  key={pet.id}
                  pet={pet}
                  isProfile={true}
                  showMatchButtons={isShelterProfile}
                />
              ))
            )}
          </div>
        </>
      )}
    </PageLayout>
  );
}

export default ProfilePage;
