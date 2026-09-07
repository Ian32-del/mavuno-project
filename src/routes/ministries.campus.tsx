import { createFileRoute } from "@tanstack/react-router";
import { MinistryPage } from "@/components/ministry-page";
import img from "@/assets/ministry-campus.jpeg";

export const Route = createFileRoute("/ministries/campus")({
  head: () => ({
    meta: [
      { title: "Campus Trends — Mavuno Youth" },
      { name: "description", content: "University and college fellowships, leadership training and campus missions across Kenya." },
      { property: "og:title", content: "Campus Trends" },
      { property: "og:description", content: "Christ-centered movements on every campus." },
      { property: "og:url", content: "/ministries/campus" },
      { property: "og:image", content: img },
    ],
    links: [{ rel: "canonical", href: "/ministries/campus" }],
  }),
  component: () => (
    <MinistryPage
      eyebrow="University & College Students"
      title={<>Every campus. <span className="text-brand">Every faculty.</span> His.</>}
      subtitle="Campus Trends plants and nurtures Christ-centered student movements — because campuses shape nations."
      image={img}
      vision="A revived generation of student leaders reshaping campus culture with the Gospel."
      mission="To disciple, train and send students who lead fellowships, love their peers and live sold-out for Jesus."
      activities={[
        "28+ campus fellowships",
        "Weekly Bible studies",
        "Campus leaders' summit",
        "Missions & outreach weeks",
        "Freshers' welcome program",
        "One-on-one discipleship",
      ]}
      leaders={[
        { name: "Pastor Brian Kiptoo", role: "Campus Trends Pastor" },
        { name: "Cynthia Achieng", role: "Discipleship Coach" },
        { name: "Michael Wafula", role: "Missions" },
        { name: "Esther Muthoni", role: "Freshers' Lead" },
      ]}
      meetTime="Weekdays & Sunday afternoons"
      meetLocation="On every partner campus across Kenya"
    />
  ),
});