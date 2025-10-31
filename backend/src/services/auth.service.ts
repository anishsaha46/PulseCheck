import bcrypt from "bcryptjs"
import { generateToken } from "../config/auth"
import prisma from "../config/database"

export const authService = {
  async register(data: { email: string; password: string; name: string }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      throw new Error("User already exists")
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)

    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
      },
    })

    const token = generateToken(user.id)

    return {
      user: { id: user.id, email: user.email, name: user.name },
      token,
    }
  },

  async login(data: { email: string; password: string }) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (!user) {
      throw new Error("Invalid credentials")
    }

    const passwordMatch = await bcrypt.compare(data.password, user.password)

    if (!passwordMatch) {
      throw new Error("Invalid credentials")
    }

    const token = generateToken(user.id)

    return {
      user: { id: user.id, email: user.email, name: user.name },
      token,
    }
  },
}
