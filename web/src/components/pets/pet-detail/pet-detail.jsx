import { useEffect, useState } from "react";
import * as PataFriend from "../../../services/api-service";

function PetDetail({ id }) {
  const [pet, setPet] = useState();

  useEffect(() => {
    PataFriend.getPet(id)
      .then((pet) => setPet(pet))
      .catch((error) => console.error(error));
  }, [id]);

  if (!pet) {
    return null;
  } else {
    return <>{pet.title}</>;
  }
}

export default PetDetail;
