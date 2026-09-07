import { createFileRoute } from "@tanstack/react-router";
import { MinistryPage } from "@/components/ministry-page";
import img from "@/assets/ministry-myf.jpeg";

export const Route = createFileRoute("/ministries/myf")({
  head: () => ({
    meta: [
      { title: "MYF — Mavuno Young & Fearless" },
      { name: "description", content: "Discipleship, worship and camps for teenagers and high-school students in Nairobi." },
      { property: "og:title", content: "MYF — Young & Fearless" },
      { property: "og:description", content: "Where fearless faith is formed. For teens 13–19." },
      { property: "og:url", content: "/ministries/myf" },
      { property: "og:image", content: img },
    ],
    links: [{ rel: "canonical", href: "/ministries/myf" }],
  }),
  component: () => (
    <MinistryPage
      eyebrow="Young & Fearless · Teens 13–19"
      title={<>Fearless faith, <span className="text-brand">forged early.</span></>}
      subtitle="MYF is the beating heart of teen ministry at Mavuno — a safe, loud, honest space where high-schoolers find Jesus, community and courage."
      image={img}
      vision="A generation of teenagers unashamed of the Gospel, unstoppable in purpose."
      mission="To disciple every teenager into a lifelong follower of Jesus through mentorship, worship and honest community."
      activities={[
        "Weekly Sunday gatherings",
        "Small groups by school and neighborhood",
        "MYF annual camp",
        "Worship nights & prayer meetings",
        "Leadership development track",
        "Outreach & mission weeks",
      ]}
      leaders={[
        { name: "Pastor Kevin Mwangi", role: "MYF Pastor" },
        { name: "Grace Njeri", role: "Discipleship Lead" },
        { name: "David Otieno", role: "Worship Lead" },
        { name: "Faith Wambui", role: "Small Groups" },
      ]}
      meetTime="Sundays · 9:30 AM & 11:30 AM"
      meetLocation="MYF Zone · Bellevue Campus, Nairobi"
    />
  ),
});