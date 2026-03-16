import { GetServerSideProps } from "next";

export default function ChatPage() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async () => {
  return { redirect: { destination: "/", permanent: false } };
};
