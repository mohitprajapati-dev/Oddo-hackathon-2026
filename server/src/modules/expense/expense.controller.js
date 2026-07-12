import expenseService from "./expense.service.js";

class ExpenseController {
  async addExpense(req, res, next) {
    try {
      const { vehicle_id, trip_id, category, amount, description, logged_at } = req.body;

      if (!category || amount === undefined || !description) {
        return res.status(400).json({
          success: false,
          message: "category, amount, and description are required.",
        });
      }

      const parsedAmount = Number(amount);
      if (isNaN(parsedAmount) || parsedAmount < 0) {
        return res.status(400).json({
          success: false,
          message: "amount must be a positive number.",
        });
      }

      const newExpense = await expenseService.addExpense({
        vehicle_id: vehicle_id || null,
        trip_id: trip_id || null,
        category,
        amount: parsedAmount,
        description,
        logged_at,
      });

      return res.status(201).json({
        success: true,
        message: "Expense record created successfully.",
        data: newExpense,
      });
    } catch (error) {
      next(error);
    }
  }

  async listExpenses(req, res, next) {
    try {
      const { vehicle_id, trip_id, category } = req.query;
      const filters = {};
      if (vehicle_id) filters.vehicle_id = vehicle_id;
      if (trip_id) filters.trip_id = trip_id;
      if (category) filters.category = category;

      const list = await expenseService.getExpenses(filters);
      return res.status(200).json({
        success: true,
        data: list,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateExpense(req, res, next) {
    try {
      const { id } = req.params;
      const { category, amount, description, logged_at } = req.body;

      const updates = {};
      if (category !== undefined) {
        const allowedCategories = ["Fuel", "Maintenance", "Repair", "Toll", "Salary", "Miscellaneous", "Other"];
        if (!allowedCategories.includes(category)) {
          return res.status(400).json({
            success: false,
            message: `Invalid category. Allowed: ${allowedCategories.join(", ")}`,
          });
        }
        updates.category = category;
      }
      if (amount !== undefined) {
        const parsedAmount = Number(amount);
        if (isNaN(parsedAmount) || parsedAmount < 0) {
          return res.status(400).json({
            success: false,
            message: "amount must be a positive number.",
          });
        }
        updates.amount = parsedAmount;
      }
      if (description !== undefined) updates.description = description;
      if (logged_at !== undefined) updates.logged_at = logged_at;

      const updated = await expenseService.updateExpense(id, updates);
      return res.status(200).json({
        success: true,
        message: "Expense record updated successfully.",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteExpense(req, res, next) {
    try {
      const { id } = req.params;
      await expenseService.deleteExpense(id);
      return res.status(200).json({
        success: true,
        message: "Expense record deleted successfully.",
      });
    } catch (error) {
      next(error);
    }
  }

  async getOperationalCost(req, res, next) {
    try {
      const { vehicle_id } = req.query;
      const filters = {};
      if (vehicle_id) filters.vehicle_id = vehicle_id;

      const costs = await expenseService.calculateOperationalCost(filters);
      return res.status(200).json({
        success: true,
        data: costs,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ExpenseController();
