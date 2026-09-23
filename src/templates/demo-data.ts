import { getTranslations } from "next-intl/server";
import { DEMO_STARTS_AT } from "./catalog";
import { type InvitationData, invitationDataSchema } from "./schema";

/** Sample invitation content in the current request language (previews and new drafts). */
export async function demoInvitationData(): Promise<InvitationData> {
  const demo = await getTranslations("demoInvitation");
  return invitationDataSchema.parse({
    hosts: { first: demo("first"), second: demo("second") },
    message: demo("message"),
    families: demo("families"),
    event: { startsAt: DEMO_STARTS_AT, venueName: demo("venueName"), address: demo("address") },
  });
}
