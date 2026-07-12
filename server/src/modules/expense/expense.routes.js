import express from "express";
import expenseController from "./expense.controller.js";
import { protect, authorize } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

// Financial cost views and stats visible to authenticated roles
router.get("/", expenseController.listExpenses);
router.get("/operational-cost", expenseController.getOperationalCost);

// Mutating endpoints restricted to Fleet Managers and Financial Analysts
router.post("/", authorize("Fleet Manager", "Financial Analyst"), expenseController.addExpense);
router.put("/:id", authorize("Fleet Manager", "Financial Analyst"), expenseController.updateExpense);
router.delete("/:id", authorize("Fleet Manager", "Financial Analyst"), expenseController.deleteExpense);

export default router;
