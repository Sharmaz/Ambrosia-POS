"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { AuthContext } from "../modules/auth/AuthProvider";
import { getHomeRoute } from "../lib/getHomeRoute";
import LoadingCard from "../components/LoadingCard";
import { Onboarding } from "../components/Onboarding";

export default function HomePage() {
  const router = useRouter();
  // const { isAuthenticated, user, isLoading } = useContext(AuthContext);

  // useEffect(() => {
  //   if (!isLoading) {
  //     if (!isAuthenticated) {
  //       router.replace("/auth");
  //     } else {
  //       const homeRoute = getHomeRoute(user);
  //       console.log(`🏠 Redirigiendo usuario a: ${homeRoute}`);
  //       router.replace(homeRoute);
  //     }
  //   }
  // }, [isAuthenticated, user, isLoading, router]);

  return (
    <Onboarding />
  );
}
