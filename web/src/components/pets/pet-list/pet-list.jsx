import { useEffect, useState } from "react";
import PetItem from "../pet-item/pet-item";
import * as PataFriend from "../../../services/api-service";

function PetList() {
  const [pets, setPets] = useState([]);
  const [reload, setReload] = useState(false);

  useEffect(() => {
    PataFriend.listPets({})
      .then((pets) => setPets(pets))
      .catch((error) => console.error(error));
  });

  const handlePetDeletion = () => {
    PataFriend.deletePet(pet.id)
      .then(() => setReload(!reload))
      .catch((error) => console.error(error));
  };

  return (
    <div className="pet-list">
      {pets.map((pet) => (
        <PetItem
          key={pet.id}
          pet={pet}
          userType={userType}
          onDelete={handlePetDeletion}
        />
      ))}
    </div>
  );
}

export default PetList;
