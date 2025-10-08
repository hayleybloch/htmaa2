import type { NextApiRequest, NextApiResponse } from 'next'
import { Ok, Result } from 'result';
import { z } from "zod";
import nodemailer from "nodemailer";

type SendEmailRequestData = {
  name: string,
  email: string,
  company?: string,
  message: string
}

type ResponseData = {
  message: string
}

type ResponseError = {
  error: any
}

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().min(5),
  company: z.string().optional(),
  message: z.string().min(1),
});

async function sendEmailToMe(request: SendEmailRequestData): Promise<void> {
  // If mail server is not configured, assume we're in local/dev and
  // simply log the message instead of attempting to send. This avoids
  // 500 Internal Server Errors when env vars are not present.
  if (!process.env.MAIL_SERVER) {
    const subject = `${request.name} <${request.email}> ${request.company ? `from ${request.company}` : ''}`;
    console.log('[contact] MAIL_SERVER not set — skipping sendMail (dev mode)');
    console.log('Subject:', subject);
    console.log('Message:', request.message);
    return;
  }

  const port = Number(process.env.MAIL_PORT ?? 587);
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_SERVER,
    port: Number.isNaN(port) ? 587 : port,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });

  await transporter.verify();

  const subject = `${request.name} <${request.email}> ${request.company ? `from ${request.company}` : ''}`;

  console.log('Email send from');
  console.log(subject);
  console.log('---------');
  console.log(request.message);

  await transporter.sendMail({
    from: `"${request.email}" <hayleybl@mit.edu>`,
    to: `hayleybl@mit.edu`,
    subject,
    text: request.message
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ResponseError>
) {
  if (req.method === 'POST') {
    const request = contactSchema.safeParse(req.body);

    if (request.success) {
      try {
        await sendEmailToMe(request.data);
        return res.status(200).json({ message: "Message processed" });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Unable to send email" });
      }

    } else {
      return res.status(503).json({ error: request.error.flatten().fieldErrors });
    }
  }

  return res.status(404).json({ error: 'Page not found' });
}
