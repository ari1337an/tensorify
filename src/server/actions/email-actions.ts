"use server";

import { Resend } from "resend";
import { OrganizationInviteEmail } from "@/server/emails/OrganizationInviteEmail";
import { Organization } from "@prisma/client";

export async function sendOrganizationEmail({
  to,
  subject,
  react,
}: {
  to: string;
  subject: string;
  react: React.ReactElement;
}) {
  try {
    const resend = new Resend(process.env.RESEND_IO_API_KEY);

    const { data, error } = await resend.emails.send({
      from: "Tensorify <no-reply@app.tensorify.io>",
      to,
      subject,
      react,
    });
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function sendInviteEmailAction(
  email: string,
  invitationId: string,
  inviterInfo?: {
    name: string;
    email: string;
  },
  organization?: Organization
) {
  if (!email) return { success: false, error: "Email is required." };

  const organizationName = organization?.name || "Tensorify Organization";

  const react = OrganizationInviteEmail({
    organizationName,
    inviteeEmail: email,
    inviteLink: `https://app.tensorify.io/onboarding/accept-invitation?token=${invitationId}`,
    inviterName: inviterInfo?.name,
    inviterEmail: inviterInfo?.email,
  });

  return await sendOrganizationEmail({
    to: email,
    subject: `You're invited to join ${organizationName}!`,
    react,
  });
}
