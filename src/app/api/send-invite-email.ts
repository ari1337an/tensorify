import { NextRequest, NextResponse } from "next/server";
import { sendOrganizationEmail } from "@/server/actions/email-actions";
import { OrganizationInviteEmail } from "@/server/emails/OrganizationInviteEmail";

export async function POST(req: NextRequest) {
  try {
    const { email, inviterInfo, organizationName } = await req.json();
    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required." },
        { status: 400 }
      );
    }
    const react = OrganizationInviteEmail({
      organizationName: organizationName || "Tensorify Organization",
      inviteeEmail: email,
      inviteLink: "https://app.tensorify.io/accept-invite", // Default/fallback link
      inviterName: inviterInfo?.name,
      inviterEmail: inviterInfo?.email,
    });
    const result = await sendOrganizationEmail({
      to: email,
      subject: `You're invited to join ${organizationName || "Tensorify Organization"}!`,
      react,
    });
    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to send email." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Server error." },
      { status: 500 }
    );
  }
}
