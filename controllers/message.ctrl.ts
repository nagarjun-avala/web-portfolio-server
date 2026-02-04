import { Request, Response } from "express";
import { db } from "@/lib/db";

const MessageController = {
  getMessages: async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;
      const search = (req.query.search as string) || "";
      const status = req.query.status as string; // 'read', 'unread', or undefined for all

      const whereClause: any = {};

      if (status === "read") whereClause.isRead = true;
      if (status === "unread") whereClause.isRead = false;

      if (search) {
        whereClause.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { message: { contains: search, mode: "insensitive" } },
        ];
      }

      const [messages, total, unreadCount] = await Promise.all([
        db.message.findMany({
          where: whereClause,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        db.message.count({ where: whereClause }),
        db.message.count({ where: { isRead: false } }),
      ]);

      res.json({
        success: true,
        data: messages,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
        },
        unreadCount,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Error fetching messages" });
    }
  },

  updateMessageStatus: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const messageId = Array.isArray(id) ? id[0] : id;

      const { isRead } = req.body;

      if (typeof isRead !== "boolean") {
        return res
          .status(400)
          .json({ success: false, message: "Invalid status" });
      }

      const updated = await db.message.update({
        where: { id: messageId },
        data: { isRead },
      });

      res.json({ success: true, data: updated });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Error updating status" });
    }
  },

  bulkDeleteMessages: async (req: Request, res: Response) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "No IDs provided" });
      }

      await db.message.deleteMany({
        where: { id: { in: ids } },
      });

      res.json({ success: true, message: `Deleted ${ids.length} messages` });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Error deleting messages" });
    }
  },

  bulkUpdateStatus: async (req: Request, res: Response) => {
    try {
      const { ids, isRead } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "No IDs provided" });
      }
      if (typeof isRead !== "boolean") {
        return res
          .status(400)
          .json({ success: false, message: "Invalid status" });
      }

      await db.message.updateMany({
        where: { id: { in: ids } },
        data: { isRead },
      });

      res.json({ success: true, message: `Updated ${ids.length} messages` });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Error updating status" });
    }
  },

  deleteMessage: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const messageId = Array.isArray(id) ? id[0] : id;

      if (!messageId) {
        return res.status(400).json({ success: false, message: "Invalid ID" });
      }

      await db.message.delete({
        where: { id: messageId },
      });

      res.json({ success: true, message: "Message deleted" });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Error deleting message" });
    }
  },
};

export default MessageController;
