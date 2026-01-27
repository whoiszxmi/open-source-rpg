export async function getServerSideProps() {
  return {
    redirect: { destination: "/dashboard/overview", permanent: false },
  };
}

export default function DashboardIndex() {
  return null;
}
