import React, { useEffect, useState } from "react";
import MatchItem from "../match-item/match-item";
import axios from "axios";
import { useAuthContext } from "../../../contexts/auth-context";
import "./match-list.css";

function MatchList() {
  const { user } = useAuthContext();
  const [approvedMatches, setApprovedMatches] = useState([]);
  const [pendingMatches, setPendingMatches] = useState([]);
  const [rejectedMatches, setRejectedMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openMatchId, setOpenMatchId] = useState(null); 

  // Función para quedarnos solo con el primer "match" de cada perro (mismo pet.id)
  const groupMatchesByPetId = (matches) => {
    const uniquePets = [];
    const petIds = new Set();

    for (const match of matches) {
      const petId = match.pet.id;
      if (!petIds.has(petId)) {
        petIds.add(petId);
        uniquePets.push(match);
      }
    }
    return uniquePets;
  };

  // FUNCIÓN que refresca la lista de matches
  const fetchMatchesAgain = () => {
    const endpoint =
      user.userType === "shelter"
        ? "http://localhost:3000/api/shelter/matches"
        : "http://localhost:3000/api/pets/matches";

    axios
      .get(endpoint, { withCredentials: true })
      .then((response) => {
        const matches = response.data;

       
        const approved = matches.approved.filter((m) => m.isMatched);
        const pending = matches.pending.filter((m) => m.isMatched);
        const rejected = matches.rejected.filter((m) => m.isMatched);

        // Agrupamos por pet.id para que solo aparezca una vez cada perro
        setApprovedMatches(groupMatchesByPetId(approved));
        setPendingMatches(groupMatchesByPetId(pending));
        setRejectedMatches(groupMatchesByPetId(rejected));

        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching matches:", error);
        setError("Error fetching matches.");
        setIsLoading(false);
      });
  };

  // Llamamos a fetchMatchesAgain cuando cambie el userType (o la primera vez)
  useEffect(() => {
    fetchMatchesAgain();
  }, [user.userType]);

  if (isLoading) return <></>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="match-list">
      <h2 className="section-title">
        {user.userType === "shelter"
          ? "🐾 Matches for my Pets"
          : "🐾 My Matches"}
      </h2>

      <div>
        <h3 className="section-subtitle">Approved Matches</h3>
        {approvedMatches.length === 0 ? (
          <p className="no-request-found">No approved requests found.</p>
        ) : (
          approvedMatches.map((match) => (
            <MatchItem
              key={match.id}
              match={match}
              section="approved"
              onMatchesUpdate={fetchMatchesAgain}
              openMatchId={openMatchId}
              setOpenMatchId={setOpenMatchId}
            />
          ))
        )}
      </div>

      <div>
        <h3 className="section-subtitle">Pending Matches</h3>
        {pendingMatches.length === 0 ? (
          <p className="no-request-found">No pending requests found.</p>
        ) : (
          pendingMatches.map((match) => (
            <MatchItem
              key={match.id}
              match={match}
              section="pending"
              onMatchesUpdate={fetchMatchesAgain}
              openMatchId={openMatchId}
              setOpenMatchId={setOpenMatchId}
            />
          ))
        )}
      </div>

      <div>
        <h3 className="section-subtitle">Rejected Matches</h3>
        {rejectedMatches.length === 0 ? (
          <p className="no-request-found">No rejected requests found.</p>
        ) : (
          rejectedMatches.map((match) => (
            <MatchItem
              key={match.id}
              match={match}
              section="rejected"
              onMatchesUpdate={fetchMatchesAgain}
              openMatchId={openMatchId}
              setOpenMatchId={setOpenMatchId}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default MatchList;
