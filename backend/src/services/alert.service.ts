import prisma from "../config/database";
import nodemailer from 'nodemailer'
import axios from "axios";
import { logger } from "../utils/logger"
import { config } from "../config/env";
import { timeStamp } from "console";

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


  async triggerAlerts(monitorId: string, eventType: string, data: any) {
    const alerts = await prisma.alert.findMany({
      where: { monitorId, isEnabled: true },
      include: { monitor: true, user: true },
    })

    for (const alert of alerts) {
      try {
        if (alert.type === "email") {
          const html = this.generateEmailTemplate(eventType, alert.monitor.name, data)
          await this.sendEmail(alert.channel, `PulseCheck Alert: ${eventType}`, html)
        } else if (alert.type === "webhook") {
          await this.sendWebhook(alert.channel, {
            event: eventType,
            monitor: { id: alert.monitorId, name: alert.monitor.name },
            data,
            timestamp: new Date(),
          })
        }

        // Record delivery
        await prisma.alertDelivery.create({
          data: {
            alertId: alert.id,
            status: "delivered",
          },
        })

        await prisma.alert.update({
          where: { id: alert.id },
          data: { lastSentAt: new Date(), lastStatus: "sent", consecutiveFails: 0 },
        })
      } catch (error) {
        logger.error("Failed to trigger alert", { alertId: alert.id, error })

        // Record failed delivery
        await prisma.alertDelivery.create({
          data: {
            alertId: alert.id,
            status: "failed",
            error: error instanceof Error ? error.message : "Unknown error",
          },
        })

        await prisma.alert.update({
          where: { id: alert.id },
          data: {
            lastStatus: "failed",
            consecutiveFails: { increment: 1 },
          },
        })
      }
    }
  },

  async createAlert(userId: string, data: any) {
    const monitor = await prisma.monitor.findFirst({
      where: { id: data.monitorId, userId },
    })

    if (!monitor) throw new Error("Monitor not found")

    return await prisma.alert.create({
      data: {
        userId,
        monitorId: data.monitorId,
        type: data.type,
        channel: data.channel,
        threshold: data.threshold || 3,
        recoveryCount: data.recoveryCount || 2,
      },
    })
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
