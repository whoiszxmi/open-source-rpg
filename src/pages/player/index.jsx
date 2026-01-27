import { COOKIE_NAMES, getSessionFromRequest } from "../../lib/session";

export async function getServerSideProps({ req }) {
  const session = await getSessionFromRequest(req, COOKIE_NAMES.player);
  if (session?.characterId) {
    return {
      redirect: { destination: `/player/${session.characterId}`, permanent: false },
    };
  }

  return {
    redirect: { destination: "/play", permanent: false },
  };
}

export default function PlayerIndex() {
  return null;
}
