import prisma from "../config/database";
import nodemailer from 'nodemailer'
import axios from "axios";
import { logger } from "../utils/logger"
import { config } from "../config/env";

const emailTransporter = nodemailer.createTransport({
    host:config.SMTP_HOST,
    port:config.SMTP_PORT,
    auth:{
        user:config.SMTP_USER,
        pass:config.SMTP_PASS,
    },
})

export const alertService={

  async sendEmail(to: string, subject: string, html: string) {
    try {
      const result = await emailTransporter.sendMail({
        from: config.SMTP_FROM,
        to,
        subject,
        html,
      })

      logger.info("Email sent", { to, subject, messageId: result.messageId })
      return { success: true, messageId: result.messageId }
    } catch (error) {
      logger.error("Failed to send email", error)
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
    }
  },
}
