import { prisma } from "../../database";
import { parseCookies } from "../../lib/session";

export async function getServerSideProps({ req }) {
  const cookies = parseCookies(req?.headers?.cookie || "");
  const token = cookies.psid;
  if (token) {
    const session = await prisma.playerSession.findUnique({
      where: { token },
      select: { characterId: true, expiresAt: true },
    });
    if (session && (!session.expiresAt || new Date(session.expiresAt) > new Date())) {
      return {
        redirect: { destination: `/player/${session.characterId}`, permanent: false },
      };
    }
  }

  return {
    redirect: { destination: "/play", permanent: false },
  };
}

export default function PlayerIndex() {
  return null;
}
