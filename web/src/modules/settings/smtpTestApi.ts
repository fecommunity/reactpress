import { getToolkitClient } from "@/shared/client";

export type SmtpTestPayload = {
  to: string;
  smtpHost?: string;
  smtpPort?: string;
  smtpUser?: string;
  smtpPass?: string;
  smtpFromUser?: string;
};

export async function sendSmtpTestEmail(payload: SmtpTestPayload): Promise<void> {
  const api = await getToolkitClient();
  await api.smtp.testSend(payload);
}
