import { useParams } from "react-router-dom";
import { PageLayout } from "../src/components/layouts";
import { PetDetail } from "../src/components/pets";

function PetDetailPage() {
  const { id } = useParams();

  return (
    <PageLayout title={<h1>HOLI</h1>}>
      <PetDetail id={id} />
    </PageLayout>
  );
}

export default PetDetailPage;
