import { User } from "@prisma/client";
import express, { Request, Express } from "express";

export interface ExpressRequestExtension extends Request {
      user?: User,
      token?: any,
      userId?: any,
}
