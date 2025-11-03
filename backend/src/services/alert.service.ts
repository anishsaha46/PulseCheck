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

  async sendWebhook(url: string, payload: any) {
    try {
      const response = await axios.post(url, payload, {
        timeout: 5000,
        headers: { "Content-Type": "application/json" },
      })

      logger.info("Webhook sent", { url, status: response.status })
      return { success: true, status: response.status }
    } catch (error) {
      logger.error("Failed to send webhook", error)
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
    }
  },




  generateEmailTemplate(eventType: string, monitorName: string, data: any): string {
    const baseUrl = config.FRONTEND_URL

    let content = ""
    if (eventType === "incident_created") {
      content = `
        <h2 style="color: #dc2626;">Incident Alert</h2>
        <p>Your monitor <strong>${monitorName}</strong> is experiencing issues.</p>
        <p>Started at: ${new Date(data.startAt).toLocaleString()}</p>
        <a href="${baseUrl}/dashboard/monitors/${data.monitorId}" 
           style="display: inline-block; padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px;">
          View Monitor
        </a>
      `
    } else if (eventType === "incident_resolved") {
      content = `
        <h2 style="color: #16a34a;">Incident Resolved</h2>
        <p>Your monitor <strong>${monitorName}</strong> is back online.</p>
        <p>Resolved at: ${new Date(data.endAt).toLocaleString()}</p>
        <a href="${baseUrl}/dashboard/monitors/${data.monitorId}" 
           style="display: inline-block; padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px;">
          View Monitor
        </a>
      `
    }

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            ${content}
            <div class="footer">
              <p>PulseCheck API Monitor</p>
              <p><a href="${baseUrl}">Visit Dashboard</a></p>
            </div>
          </div>
        </body>
      </html>
    `
  },



}
