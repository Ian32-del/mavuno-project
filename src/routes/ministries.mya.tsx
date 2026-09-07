import { createFileRoute } from "@tanstack/react-router";
import { MinistryPage } from "@/components/ministry-page";
import img from "@/assets/ministry-mya.jpeg";

export const Route = createFileRoute("/ministries/mya")({
  head: () => ({
    meta: [
      { title: "MYA — Mavuno Young Adults" },
      { name: "description", content: "Life transformation, leadership and community for young professionals in their 20s." },
      { property: "og:title", content: "MYA — Young Adults" },
      { property: "og:description", content: "For young professionals stepping into purpose." },
      { property: "og:url", content: "/ministries/mya" },
      { property: "og:image", content: img },
    ],
    links: [{ rel: "canonical", href: "/ministries/mya" }],
  }),
  component: () => (
    <MinistryPage
      eyebrow="Young Adults · 20s"
      title={<>Your <span className="text-brand">20s</span> matter. Live them on purpose.</>}
      subtitle="MYA is a Christ-centered community of young professionals figuring out career, calling, relationships and faith — together."
      image={img}
      vision="Young adults leading with integrity and influence in every sphere of society."
      mission="To equip 20-somethings with theology, mentorship and community that shape a lifetime of Kingdom impact."
      activities={[
        "Sunday communities",
        "Life groups across the city",
        "Career & calling workshops",
        "Marriage-prep track",
        "Financial stewardship school",
        "Annual MYA retreat",
      ]}
      leaders={[
        { name: "Pastor Aisha Kariuki", role: "MYA Pastor" },
        { name: "Samuel Omondi", role: "Discipleship" },
        { name: "Naomi Chebet", role: "Community" },
        { name: "Peter Kimani", role: "Leadership Pipeline" },
      ]}
      meetTime="Sundays · 4:00 PM"
      meetLocation="MYA Hall · Bellevue Campus, Nairobi"
    />
  ),
});