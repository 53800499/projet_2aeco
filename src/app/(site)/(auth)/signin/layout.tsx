import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | 2aeco",
};

export default function SigninLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
