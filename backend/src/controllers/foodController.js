import Food from "../models/Food.js";

// GET /api/foods
export const getFoods = async (req, res) => {
  try {
    const foods = await Food.find().sort({ createdAt: -1 });
    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/foods/:id
export const getFoodById = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) return res.status(404).json({ message: "Food not found" });
    res.json(food);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/foods
export const createFood = async (req, res) => {
  try {
    const food = await Food.create(req.body);
    res.status(201).json(food);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT /api/foods/:id
export const updateFood = async (req, res) => {
  try {
    const food = await Food.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!food) return res.status(404).json({ message: "Food not found" });
    res.json(food);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE /api/foods/:id
export const deleteFood = async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);
    if (!food) return res.status(404).json({ message: "Food not found" });
    res.json({ message: "Food deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
