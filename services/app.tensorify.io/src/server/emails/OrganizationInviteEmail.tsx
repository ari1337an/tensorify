/* eslint-disable @next/next/no-img-element */
import * as React from "react";

interface OrganizationInviteEmailProps {
  organizationName: string;
  inviteeEmail: string;
  inviteLink: string;
  inviterName?: string;
  inviterEmail?: string;
}

export function OrganizationInviteEmail({
  organizationName,
  inviteeEmail,
  inviteLink,
  inviterName = "A Tensorify Admin",
  inviterEmail = "no-reply@app.tensorify.io",
}: OrganizationInviteEmailProps) {
  // Extract name before @ from email
  const name = inviteeEmail.split("@")[0];
  const logoUrl = "https://app.tensorify.io/tensorify-logo.png";

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        color: "#222",
        background: "#fff",
        borderRadius: 8,
        border: "1px solid #eee",
        maxWidth: 480,
        margin: "40px auto",
        padding: 32,
        boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <img
          src={logoUrl}
          alt="Tensorify"
          style={{ height: 40, marginBottom: 24 }}
        />
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>
          Join <span style={{ fontWeight: 700 }}>{organizationName}</span> on{" "}
          <span style={{ fontWeight: 700 }}>Tensorify</span>
        </h1>
      </div>
      <div style={{ fontSize: 16, marginBottom: 24 }}>
        <div style={{ marginBottom: 16 }}>
          Hello <b>{name}</b>,
        </div>
        <div>
          <b>{inviterName}</b> (
          <a
            href={`mailto:${inviterEmail}`}
            style={{ color: "#2563eb", textDecoration: "none" }}
          >
            {inviterEmail}
          </a>
          ) has invited you to the <b>{organizationName}</b> organization on{" "}
          <b>Tensorify</b>.
        </div>
      </div>
      <div style={{ textAlign: "center", margin: "32px 0" }}>
        <a
          href={inviteLink}
          style={{
            display: "inline-block",
            background: "#111827",
            color: "#fff",
            fontWeight: 600,
            fontSize: 16,
            padding: "14px 32px",
            borderRadius: 6,
            textDecoration: "none",
            marginBottom: 16,
          }}
        >
          Join the team
        </a>
      </div>
      <div
        style={{
          fontSize: 14,
          color: "#555",
          textAlign: "center",
          marginBottom: 0,
        }}
      >
        or copy and paste this URL into your browser:
        <br />
        <a
          href={inviteLink}
          style={{ color: "#2563eb", wordBreak: "break-all" }}
        >
          {inviteLink}
        </a>
      </div>
    </div>
  );
}
