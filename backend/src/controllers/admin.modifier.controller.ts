import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Tạo nhóm Modifier (VD: Size, Extra)
export const createModifierGroup = async (req: Request, res: Response) => {
  const { menuItemId, name, required } = req.body;
  const group = await prisma.modifierGroup.create({
    data: { menuItemId, name, required: Boolean(required) }
  });
  res.status(201).json(group);
};

// Thêm lựa chọn vào nhóm (VD: Small - 0đ, Large - 20k)
export const createModifierOption = async (req: Request, res: Response) => {
  const { modifierGroupId, name, priceDelta } = req.body;
  const option = await prisma.modifierOption.create({
    data: { modifierGroupId, name, priceDelta: Number(priceDelta) }
  });
  res.status(201).json(option);
};